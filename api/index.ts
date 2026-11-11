import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { CATEGORIES, lineageTable } from "./data.js";
import { EMBEDDED_ARTISTS } from "./singersData.js";

// ESM-safe directory anchor: this module may be executed as ESM (where
// __dirname is undefined → ReferenceError) or bundled to CJS by the Vercel
// function builder (where __dirname exists). import.meta must NOT appear
// here: Vercel transpiles this file to CJS and older esbuild rejects
// import.meta in CJS output, failing the whole build.
const RUNTIME_DIRNAME: string = (() => {
  try {
    // eslint-disable-next-line no-typeof-undefined
    if (typeof __dirname !== "undefined") return __dirname;
  } catch (_) {}
  return process.cwd();
})();

const app = express();
const PORT = 3000;

// Load config for Firestore REST API safely with multiple fallback paths and safe defaults
let firebaseConfig: any = {
  projectId: "gen-lang-client-0510749480",
  firestoreDatabaseId: "ai-studio-saulspodship-c0ebd8e4-5a5c-4407-aecf-e7b162604083",
  apiKey: "AIzaSyD2pvWrxBA8eqtxSof6JHb4vfnoZJCG6-A"
};

try {
  const possiblePaths = [
    path.join(process.cwd(), "firebase-applet-config.json"),
    path.join(RUNTIME_DIRNAME, "../firebase-applet-config.json"),
    path.join(RUNTIME_DIRNAME, "firebase-applet-config.json")
  ];
  
  let configStr = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      configStr = fs.readFileSync(p, "utf8");
      break;
    }
  }
  
  if (configStr) {
    const loaded = JSON.parse(configStr);
    firebaseConfig = {
      projectId: loaded.projectId || firebaseConfig.projectId,
      firestoreDatabaseId: loaded.firestoreDatabaseId || firebaseConfig.firestoreDatabaseId,
      apiKey: loaded.apiKey || firebaseConfig.apiKey
    };
    console.log("[CONFIG LOG] Successfully loaded firebase-applet-config.json");
  } else {
    console.warn("[CONFIG LOG] Warning: firebase-applet-config.json not found in any standard path. Using robust default fallbacks.");
  }
} catch (err: any) {
  console.error("[CONFIG LOG] Error loading firebase-applet-config.json:", err);
}

// Helper to recursively parse Firestore REST API fields structure to clean JSON
function parseFirestoreValue(val: any): any {
  if (!val) return null;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('booleanValue' in val) return val.booleanValue;
  if ('arrayValue' in val) {
    const values = val.arrayValue.values || [];
    return values.map((v: any) => parseFirestoreValue(v));
  }
  if ('mapValue' in val) {
    const fields = val.mapValue.fields || {};
    const parsed: any = {};
    for (const [k, v] of Object.entries(fields)) {
      parsed[k] = parseFirestoreValue(v);
    }
    return parsed;
  }
  return null;
}

function parseFirestoreDoc(doc: any): any {
  if (!doc || !doc.fields) return null;
  const parsed: any = {};
  for (const [k, v] of Object.entries(doc.fields)) {
    parsed[k] = parseFirestoreValue(v);
  }
  return parsed;
}

// Fetch a single document via Firestore REST API (extremely fast & avoids GCP IAM authorization bugs)
async function getFirestoreDoc(collectionName: string, docId: string): Promise<any> {
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/${collectionName}/${docId}?key=${firebaseConfig.apiKey}`;
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) return null;
    let errBody = "";
    try {
      errBody = await response.text();
    } catch (_) {}
    throw new Error(`Firestore REST API returned status ${response.status} for ${collectionName}/${docId}. Body: ${errBody}`);
  }
  const data = await response.json();
  return parseFirestoreDoc(data);
}

// Fetch all documents in a collection via Firestore REST runQuery API
async function queryFirestoreCollection(collectionName: string): Promise<any[]> {
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents:runQuery?key=${firebaseConfig.apiKey}`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: collectionName }]
    }
  };
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    let errBody = "";
    try {
      errBody = await response.text();
    } catch (_) {}
    throw new Error(`Firestore runQuery failed with status ${response.status} for ${collectionName}. Body: ${errBody}`);
  }
  const results = await response.json();
  const docs: any[] = [];
  for (const r of results) {
    if (r.document) {
      const docId = r.document.name.split("/").pop();
      const parsedFields = parseFirestoreDoc(r.document);
      docs.push({
        id: docId,
        createTime: r.document.createTime,
        updateTime: r.document.updateTime,
        ...parsedFields
      });
    }
  }
  return docs;
}

// Canonical Host & Protocol Normalizer (Redirect non-www to www, http to https)
app.use((req, res, next) => {
  const host = (req.headers.host || "").toLowerCase();
  const forwardedProto = req.headers["x-forwarded-proto"] as string;

  if (host === "saulspodship.com") {
    return res.redirect(301, `https://www.saulspodship.com${req.originalUrl || req.url}`);
  }

  if (forwardedProto === "http" && host.includes("saulspodship.com")) {
    return res.redirect(301, `https://${host}${req.originalUrl || req.url}`);
  }

  next();
});

// Vercel Serverless Routing Normalizer and Logging Middleware
app.use((req, res, next) => {
  console.log(`[EXPRESS REQUEST LOG] METHOD: ${req.method} | PATH: ${req.path} | FULL URL: ${req.url}`);
  const originalUrl = req.url;
  const xMatchedPath = req.headers["x-matched-path"] as string;
  const xForwardedUri = req.headers["x-forwarded-uri"] as string;
  const xVercelForwardedPath = req.headers["x-vercel-forwarded-path"] as string;

  console.log(`[VERCEL SSR LOG] TIME: ${new Date().toISOString()}`);
  console.log(`[VERCEL SSR LOG] Incoming req.url: "${originalUrl}" | req.originalUrl: "${req.originalUrl}" | req.path: "${req.path}"`);
  console.log(`[VERCEL SSR LOG] Headers: x-matched-path: "${xMatchedPath}" | x-forwarded-uri: "${xForwardedUri}" | x-vercel-forwarded-path: "${xVercelForwardedPath}"`);
  console.log(`[VERCEL SSR LOG] Query params: ${JSON.stringify(req.query)}`);

  // Extract the original requested path
  let resolvedPath = "";
  if (req.query.originalPath) {
    resolvedPath = req.query.originalPath as string;
    console.log(`[VERCEL SSR LOG] Detected originalPath from query param: "${resolvedPath}"`);
  } else if (xMatchedPath && !xMatchedPath.includes("/api/index")) {
    resolvedPath = xMatchedPath;
    console.log(`[VERCEL SSR LOG] Detected originalPath from x-matched-path: "${resolvedPath}"`);
  } else if (xVercelForwardedPath) {
    resolvedPath = xVercelForwardedPath;
    console.log(`[VERCEL SSR LOG] Detected originalPath from x-vercel-forwarded-path: "${resolvedPath}"`);
  } else if (xForwardedUri) {
    resolvedPath = xForwardedUri;
    console.log(`[VERCEL SSR LOG] Detected originalPath from x-forwarded-uri: "${resolvedPath}"`);
  }

  if (resolvedPath) {
    console.log(`[VERCEL SSR LOG] Overriding req.url to: "${resolvedPath}"`);
    req.url = resolvedPath;
  } else {
    // Fallback: If we match x-matched-path, we always trust it as a fallback path
    if (xMatchedPath) {
      console.log(`[VERCEL SSR LOG] Fallback: Overriding req.url to x-matched-path: "${xMatchedPath}"`);
      req.url = xMatchedPath;
    }
  }

  next();
});

// Enable JSON body parsing
app.use(express.json({ limit: "10mb" }));

// Initialize the Google GenAI client defensively: an absent/invalid API key must
// NEVER crash the whole serverless function (that 500s every function-routed page,
// including the music archive on Vercel). AI routes degrade to 503 instead.
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
let ai: GoogleGenAI | null = null;
try {
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } else {
    console.warn("[AI INIT] GEMINI_API_KEY/API_KEY not set — AI endpoints disabled, rest of server stays healthy.");
  }
} catch (initErr) {
  console.error("[AI INIT] GoogleGenAI client init failed — AI endpoints disabled:", initErr);
  ai = null;
}

// Paths for database storage safely adjusted for serverless read-only environment
const isVercel = !!process.env.VERCEL;
const rootDir = process.cwd();

// Writable directory path on Vercel is /tmp, otherwise use the repository's data directory
const DATA_DIR = isVercel ? "/tmp" : path.join(rootDir, "data");
const COMPS_FILE = path.join(DATA_DIR, "compositions_db.json");
const IMAGES_FILE = path.join(DATA_DIR, "volume_images_db.json");

// Read-only source paths in the repository for initial seeding
const SRC_DATA_DIR = path.join(rootDir, "api/data");
const SRC_COMPS_FILE = path.join(SRC_DATA_DIR, "compositions_db.json");
const SRC_IMAGES_FILE = path.join(SRC_DATA_DIR, "volume_images_db.json");

// In-memory cache for compositions and images in case file systems are read-only or fail
let inMemoryCompositions: any[] = [];
let inMemoryImages: Record<string, string> = {};

function initializeDatabases() {
  try {
    if (isVercel) {
      console.log("[DB LOG] Running in Vercel environment, seeding databases into /tmp if needed...");
      // Copy files from read-only package dir to /tmp if they don't exist
      if (!fs.existsSync(COMPS_FILE)) {
        if (fs.existsSync(SRC_COMPS_FILE)) {
          fs.writeFileSync(COMPS_FILE, fs.readFileSync(SRC_COMPS_FILE, "utf8"), "utf8");
        } else {
          fs.writeFileSync(COMPS_FILE, JSON.stringify([], null, 2), "utf8");
        }
      }
      
      if (!fs.existsSync(IMAGES_FILE)) {
        if (fs.existsSync(SRC_IMAGES_FILE)) {
          fs.writeFileSync(IMAGES_FILE, fs.readFileSync(SRC_IMAGES_FILE, "utf8"), "utf8");
        } else {
          fs.writeFileSync(IMAGES_FILE, JSON.stringify({}, null, 2), "utf8");
        }
      }
    } else {
      // Standard Node environment
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(COMPS_FILE)) {
        fs.writeFileSync(COMPS_FILE, JSON.stringify([], null, 2), "utf8");
      }
      if (!fs.existsSync(IMAGES_FILE) || fs.readFileSync(IMAGES_FILE, "utf8").includes("image.pollinations.ai")) {
        fs.writeFileSync(IMAGES_FILE, JSON.stringify({}, null, 2), "utf8");
      }
    }
    
    // Load initial data into in-memory storage to serve as robust fallback
    if (fs.existsSync(COMPS_FILE)) {
      inMemoryCompositions = JSON.parse(fs.readFileSync(COMPS_FILE, "utf8"));
    } else if (fs.existsSync(SRC_COMPS_FILE)) {
      inMemoryCompositions = JSON.parse(fs.readFileSync(SRC_COMPS_FILE, "utf8"));
    }
    
    if (fs.existsSync(IMAGES_FILE)) {
      const contents = fs.readFileSync(IMAGES_FILE, "utf8");
      if (!contents.includes("image.pollinations.ai")) {
        inMemoryImages = JSON.parse(contents);
      }
    } else if (fs.existsSync(SRC_IMAGES_FILE)) {
      inMemoryImages = JSON.parse(fs.readFileSync(SRC_IMAGES_FILE, "utf8"));
    }
    console.log("[DB LOG] Databases successfully initialized. Compositions count:", inMemoryCompositions.length);
  } catch (err: any) {
    console.warn("[DB LOG] Database initialization warning (falling back to memory):", err.message);
    // Load at least the read-only templates to memory if possible
    try {
      if (fs.existsSync(SRC_COMPS_FILE)) {
        inMemoryCompositions = JSON.parse(fs.readFileSync(SRC_COMPS_FILE, "utf8"));
      }
      if (fs.existsSync(SRC_IMAGES_FILE)) {
        inMemoryImages = JSON.parse(fs.readFileSync(SRC_IMAGES_FILE, "utf8"));
      }
    } catch (inner: any) {
      console.error("[DB LOG] Failed to load in-memory databases from read-only sources:", inner.message);
    }
  }
}

// Robust wrappers for safe filesystem reading & writing with in-memory fallbacks
function readCompositions(): any[] {
  try {
    if (fs.existsSync(COMPS_FILE)) {
      const data = fs.readFileSync(COMPS_FILE, "utf8");
      inMemoryCompositions = JSON.parse(data);
    }
  } catch (err: any) {
    console.error("[DB LOG] Error reading compositions file, using in-memory:", err.message);
  }
  return inMemoryCompositions;
}

function writeCompositions(list: any[]) {
  inMemoryCompositions = list;
  try {
    fs.writeFileSync(COMPS_FILE, JSON.stringify(list, null, 2), "utf8");
  } catch (err: any) {
    console.error("[DB LOG] Error writing compositions file, updated in-memory only:", err.message);
  }
}

function readImages(): Record<string, string> {
  try {
    if (fs.existsSync(IMAGES_FILE)) {
      const data = fs.readFileSync(IMAGES_FILE, "utf8");
      inMemoryImages = JSON.parse(data);
    }
  } catch (err: any) {
    console.error("[DB LOG] Error reading images file, using in-memory:", err.message);
  }
  return inMemoryImages;
}

function writeImages(images: Record<string, string>) {
  inMemoryImages = images;
  try {
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(images, null, 2), "utf8");
  } catch (err: any) {
    console.error("[DB LOG] Error writing images file, updated in-memory only:", err.message);
  }
}

// Safe immediate database initialization
initializeDatabases();

// ---------------- API ENDPOINTS ----------------

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 2. Fetch all saved compositions
app.get("/api/compositions", (req, res) => {
  try {
    const compositions = readCompositions();
    res.json(compositions);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to read database: " + error.message });
  }
});

// 3. Save a composition
app.post("/api/compositions", (req, res) => {
  try {
    const composition = req.body;
    if (!composition || !composition.title) {
      res.status(400).json({ error: "Invalid composition data" });
      return;
    }

    const list = readCompositions();

    // Assign a unique ID and timestamp if not present
    const item = {
      id: composition.id || Math.random().toString(36).substring(2, 9),
      savedAt: new Date().toISOString(),
      ...composition,
    };

    list.unshift(item); // Add to the top of the list
    writeCompositions(list);

    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to save to database: " + error.message });
  }
});

// 4. Delete a composition
app.delete("/api/compositions/:id", (req, res) => {
  try {
    const id = req.params.id;
    const list = readCompositions();

    const initialLength = list.length;
    const filteredList = list.filter((item: any) => item.id !== id);

    if (filteredList.length === initialLength) {
      res.status(404).json({ error: "Composition not found" });
      return;
    }

    writeCompositions(filteredList);
    res.json({ success: true, message: "Deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete: " + error.message });
  }
});

// 5. Compose music via Gemini
app.post("/api/compose", async (req, res) => {
  try {
    const { systemPrompt, userPrompt } = req.body;

    if (!userPrompt) {
      res.status(400).json({ error: "User prompt is required" });
      return;
    }

    if (!apiKey) {
      res.status(500).json({
        error: "Gemini API key is not configured. Please add it in project secrets.",
      });
      return;
    }

    // High fidelity response schema guaranteeing perfect JSON compatibility
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        subtitle: { type: Type.STRING },
        key: { type: Type.STRING },
        raag: { type: Type.STRING },
        taal: { type: Type.STRING },
        tempo: { type: Type.STRING },
        timeSig: { type: Type.STRING },
        durationMin: { type: Type.INTEGER },
        bpm: { type: Type.INTEGER },
        moodDescription: { type: Type.STRING },
        raagDescription: { type: Type.STRING },
        sections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              measures: { type: Type.INTEGER },
              dynamicMarking: { type: Type.STRING },
              chordProgression: { type: Type.ARRAY, items: { type: Type.STRING } },
              lyrics: { type: Type.ARRAY, items: { type: Type.STRING } },
              notes: { type: Type.STRING },
            },
            required: ["name", "measures", "dynamicMarking", "chordProgression", "lyrics", "notes"],
          },
        },
        instrumentRoles: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              instrument: { type: Type.STRING },
              role: { type: Type.STRING },
            },
            required: ["instrument", "role"],
          },
        },
        sheetNotes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              part: { type: Type.STRING },
              clef: { type: Type.STRING },
              measures: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    notes: { type: Type.ARRAY, items: { type: Type.STRING } },
                    durations: { type: Type.ARRAY, items: { type: Type.STRING } },
                    dynamic: { type: Type.STRING },
                  },
                  required: ["notes", "durations"],
                },
              },
            },
            required: ["part", "clef", "measures"],
          },
        },
        arrangementNotes: { type: Type.STRING },
        biblicalReference: { type: Type.STRING },
        performanceTips: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: [
        "title",
        "subtitle",
        "key",
        "raag",
        "taal",
        "tempo",
        "timeSig",
        "durationMin",
        "bpm",
        "moodDescription",
        "raagDescription",
        "sections",
        "instrumentRoles",
        "sheetNotes",
        "arrangementNotes",
        "biblicalReference",
        "performanceTips",
      ],
    };

    if (!ai) {
      return res.status(503).json({ error: "AI service is not configured on this server (set GEMINI_API_KEY in the hosting environment)." });
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response generated from Gemini model.");
    }

    const composition = JSON.parse(resultText);
    res.json(composition);
  } catch (error: any) {
    console.error("Gemini Composer Error:", error);
    let msg = error.message || "An error occurred during composition";
    const errorStr = JSON.stringify(error);
    if (
      msg.toLowerCase().includes("leaked") ||
      errorStr.toLowerCase().includes("leaked") ||
      msg.toLowerCase().includes("permission_denied") ||
      errorStr.toLowerCase().includes("permission_denied")
    ) {
      msg = "Your Gemini API key was reported as leaked or is invalid (Permission Denied). Please open 'Settings' (gear icon) -> 'Secrets' in the Google AI Studio menu to configure a safe, valid GEMINI_API_KEY.";
    }
    res.status(500).json({ error: msg });
  }
});

// 6. Enhance image prompt via Gemini
app.post("/api/enhance-prompt", async (req, res) => {
  try {
    const { originalPrompt, style, modifier } = req.body;
    if (!originalPrompt) {
      res.status(400).json({ error: "Original prompt is required" });
      return;
    }

    if (!apiKey) {
      res.status(500).json({
        error: "Gemini API key is not configured. Please add it in project secrets.",
      });
      return;
    }

    const systemPrompt = "You are an expert art director and historical illustrator. Combine the user's base scene description with their requested art style and custom modifiers to create a single, highly descriptive, visually spectacular prompt for an AI image generator. The prompt should be historical, artistic, and suitable for a theological encyclopedia. Focus on dramatic chiaroscuro lighting, depth, texture, and authentic ancient aesthetic. Output ONLY the raw final expanded prompt string. No conversational preamble, no markdown formatting, no trailing explanations, and do not wrap in quotation marks.";
    
    const userPrompt = `
      Base Scene: ${originalPrompt}
      Artistic Style: ${style || "Classical Fine Oil Painting"}
      Modifiers: ${modifier || "none"}
      
      Generate a single refined, highly descriptive and punchy image generation prompt based on these elements. Make it dramatic, focus on light, color, framing, and texture. Keep the prompt under 100 words. Do not wrap in quotes or add preamble.
    `;

    if (!ai) {
      return res.status(503).json({ error: "AI service is not configured on this server (set GEMINI_API_KEY in the hosting environment)." });
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const enhancedPrompt = response.text?.trim() || "";
    res.json({ enhancedPrompt });
  } catch (error: any) {
    console.error("Gemini Prompter Error:", error);
    res.status(500).json({ error: error.message || "An error occurred" });
  }
});

// 7. Academic Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    if (!apiKey) {
      res.status(500).json({
        error: "Gemini API key is not configured. Please add it in project secrets.",
      });
      return;
    }

    // Set up chat with history
    if (!ai) {
      return res.status(503).json({ error: "AI service is not configured on this server (set GEMINI_API_KEY in the hosting environment)." });
    }
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: "You are 'Theophilus', a Senior Theological AI. Provide deep, academically rigorous, objective, and beautifully structured scholarly answers.",
      },
      history: history || [],
    });

    const response = await chat.sendMessage({ message });
    res.json({ text: response.text || "No manuscript response found." });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during chat" });
  }
});

// 8. Academic Polyglot Search endpoint
app.post("/api/polyglot-search", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ error: "Query is required" });
      return;
    }

    if (!apiKey) {
      res.status(500).json({ error: "Gemini API key is not configured." });
      return;
    }

    if (!ai) {
      return res.status(503).json({ error: "AI service is not configured on this server (set GEMINI_API_KEY in the hosting environment)." });
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Perform a deep polyglot search for biblical term: "${query}". Return a JSON array with one object containing keys: reference, english, hebrew, greek, aramaic, latin, nuance, context. Ensure accurate transliterations and precise historical information.`,
      config: { responseMimeType: "application/json" }
    });

    const resultText = response.text || "[]";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Polyglot Search Error:", error);
    res.status(500).json({ error: error.message || "An error occurred" });
  }
});

// 9. Bible/Manuscript Search endpoint
app.post("/api/global-search", async (req, res) => {
  try {
    const { query, language } = req.body;
    if (!query) {
      res.status(400).json({ error: "Query is required" });
      return;
    }

    if (!apiKey) {
      res.status(500).json({ error: "Gemini API key is not configured." });
      return;
    }

    if (!ai) {
      return res.status(503).json({ error: "AI service is not configured on this server (set GEMINI_API_KEY in the hosting environment)." });
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Search the scriptures for: "${query}" in the ${language || 'English'} language. Return a JSON array of objects with keys: reference, text, explanation.`,
      config: { responseMimeType: "application/json" }
    });

    const resultText = response.text || "[]";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Global Search Error:", error);
    res.status(500).json({ error: error.message || "An error occurred" });
  }
});

// 10. Scholarly Analysis Content Generator endpoint
app.post("/api/enhance-super-nerd-content", async (req, res) => {
  try {
    const { title, overview, language } = req.body;
    if (!title) {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    if (!apiKey) {
      res.status(500).json({ error: "Gemini API key is not configured." });
      return;
    }

    if (!ai) {
      return res.status(503).json({ error: "AI service is not configured on this server (set GEMINI_API_KEY in the hosting environment)." });
    }
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Write an incredibly scholarly, academically rigorous, and objective scientific-theological analysis of "${title}" (overview context: "${overview || ''}") in the ${language || 'English'} language. Use comprehensive historical details, mention linguistic nuances, and format with beautiful markdown headings, bullet points, and citations.`,
    });

    res.json({ text: response.text || "Analysis unavailable." });
  } catch (error: any) {
    console.error("Scholarly analysis generation error:", error);
    res.status(500).json({ error: error.message || "An error occurred" });
  }
});

// 11. Fetch all volume images from database
app.get("/api/volume-images", (req, res) => {
  try {
    const images = readImages();
    res.json(images);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to read images database: " + error.message });
  }
});

// 12. Update or save a volume image in database
app.post("/api/volume-images", (req, res) => {
  try {
    const { id, imageUrl } = req.body;
    if (!id || !imageUrl) {
      res.status(400).json({ error: "Volume ID and Image URL are required" });
      return;
    }

    const images = readImages();
    images[id] = imageUrl;
    writeImages(images);

    res.json({ success: true, id, imageUrl });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to save image: " + error.message });
  }
});

// ---------------- SERVER-SIDE RENDERING CODES ----------------

// Helper to convert simple markdown to HTML safely for crawlers and search engine indexing
function markdownToHtml(md: string): string {
  if (!md) return "";
  let html = md;
  // Convert charts first
  html = html.replace(/\[\[CHART:(.*?)\]\]/g, (_, chartContent) => {
    const items = chartContent.split(",").map((item: string) => {
      const parts = item.trim().split("|");
      const label = parts[0] || "";
      const value = parts[1] || "0";
      const color = parts[2] || "#D4AF37";
      return `
        <div style="margin-bottom: 0.75rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #4A152C; margin-bottom: 0.25rem;">
            <span>${label}</span>
            <span style="color: ${color};">${value}%</span>
          </div>
          <div style="width: 100%; background-color: rgba(74,21,44,0.05); border: 1px solid rgba(74,21,44,0.08); border-radius: 9999px; height: 10px; overflow: hidden;">
            <div style="height: 100%; border-radius: 9999px; width: ${value}%; background-color: ${color};"></div>
          </div>
        </div>`;
    }).join("");
    return `
      <div style="margin: 2rem 0; padding: 1.5rem; background-color: rgba(74,21,44,0.02); border: 1px solid rgba(74,21,44,0.1); border-radius: 12px;">
        <h5 style="margin-top: 0; margin-bottom: 1rem; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(74,21,44,0.6);">Visual Metric Breakdown</h5>
        ${items}
      </div>`;
  });
  // Convert headings (##, ###, #### and # all normalized)
  html = html.replace(/^####\s+(.*?)\n/gm, '<h3 style="font-family:\'Merriweather\', serif; color:#4A152C; font-size:1.2rem; margin-top:1.5rem; margin-bottom:0.75rem; font-weight:700;">$1</h3>');
  html = html.replace(/^###\s+(.*?)\n/gm, '<h2 style="font-family:\'Merriweather\', serif; color:#4A152C; font-size:1.5rem; margin-top:2rem; margin-bottom:1rem; font-weight:700;">$1</h2>');
  html = html.replace(/^##\s+(.*?)\n/gm, '<h2 style="font-family:\'Merriweather\', serif; color:#4A152C; font-size:1.6rem; margin-top:2rem; margin-bottom:1rem; font-weight:700;">$1</h2>');
  html = html.replace(/^#\s+(.*?)\n/gm, '<h1 style="font-family:\'Merriweather\', serif; color:#4A152C; font-size:1.9rem; margin-top:2rem; margin-bottom:1rem; font-weight:900;">$1</h1>');
  // Markdown links [label](url) -> anchor (http/https only, sanitized)
  html = html.replace(/\[([^\]]{1,120})\]\((https?:\/\/[^)\s]+)\)/g, (_, label, url) => {
    const safe = String(url).replace(/["'<>]/g, "");
    return `<a href="${safe}" target="_blank" rel="noopener noreferrer" style="color:#8B1C2E; text-decoration:underline; text-underline-offset:3px;">${label}</a>`;
  });
  // Bold (inside and outside headings), then strip any stray emphasis markers
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*\*/g, "");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");
  // Single-asterisk emphasis (*Sira*, *Antiquities* …) — after bold, so the
  // double markers are already consumed.
  html = html.replace(/(^|[\s(])\*([^*\n]{1,200})\*/g, '$1<em>$2</em>');
  html = html.replace(/(^|[\s(])_([^_\n]{1,200})_/g, '$1<em>$2</em>');
  // Blockquotes ("> line")
  html = html.replace(/^>\s?(.*)$/gm, '<blockquote style="margin:1.75rem 0; padding:1rem 1.25rem; border-left:4px solid #D4AF37; background:rgba(212,175,55,.08); border-radius:6px; font-style:italic; color:#4A152C;">$1</blockquote>');
  // Bullet points: •, -, * markdown/unicode bullets all normalized
  html = html.replace(/^[ \t]*[•⁃▪][ \t]+(.*?)\n/gm, '<li style="margin-bottom:0.5rem; margin-left:1.5rem; list-style-type:disc;">$1</li>');
  html = html.replace(/^[ \t]*[-*][ \t]+(.*?)\n/gm, '<li style="margin-bottom:0.5rem; margin-left:1.5rem; list-style-type:disc;">$1</li>');
  // Horizontal rules
  html = html.replace(/^---+[ \t]*\n/gm, '<hr style="border:none; border-top:1px solid rgba(212,175,55,.4); margin:2rem auto;">');
  // Numbered lists
  html = html.replace(/\d+\. (.*?)\n/g, '<li style="margin-bottom:0.5rem; margin-left:1.5rem; list-style-type:decimal;">$1</li>');
  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p style="margin-bottom:1.5rem; text-align:justify;">');
  // Wrap
  return `<p style="margin-bottom:1.5rem; text-align:justify;">${html}</p>`;
}

// Structured Artist Record interface
interface ArtistRecord {
  id: string;
  name: string;
  badge?: string;
  also?: string;
  role: string;
  dates?: string;
  bio: string;
  links?: Record<string, string>;
}

let cachedArtists: ArtistRecord[] | null = null;

function getSingersList(): ArtistRecord[] {
  if (cachedArtists && cachedArtists.length > 0) return cachedArtists;

  const possiblePaths = [
    path.join(process.cwd(), "public/singers.html"),
    path.join(process.cwd(), "dist/singers.html"),
    path.join(RUNTIME_DIRNAME, "../public/singers.html"),
    path.join(RUNTIME_DIRNAME, "../dist/singers.html"),
  ];

  let content = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        content = fs.readFileSync(p, "utf8");
        break;
      } catch (_) {}
    }
  }

  if (!content) {
    // Fallback: build-time embedded data (never depend on runtime fs paths)
    cachedArtists = EMBEDDED_ARTISTS as unknown as ArtistRecord[];
    return cachedArtists;
  }

  const artists: ArtistRecord[] = [];
  const seenSlugs = new Set<string>();

  // 1. Historic Pioneer rows
  const pioneerRegex = /<div class="pioneer-row">[\s\S]*?<div class="pioneer-name">([\s\S]*?)<\/div>[\s\S]*?<div class="pioneer-bio">([\s\S]*?)<\/div>/g;
  let pMatch;
  while ((pMatch = pioneerRegex.exec(content)) !== null) {
    const rawName = pMatch[1].replace(/<[^>]+>/g, " ").trim();
    const nameOnly = pMatch[1].replace(/<img\b[^>]*>/gi, "").split("<")[0].trim();
    const bio = pMatch[2].replace(/<[^>]+>/g, "").trim();
    const slug = nameOnly.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
    if (slug && !seenSlugs.has(slug)) {
      seenSlugs.add(slug);
      artists.push({
        id: slug,
        name: nameOnly,
        badge: "Historic Pioneer",
        role: "Historic Pioneer / Patriarch of Gospel",
        dates: rawName.includes("–") || rawName.includes("-") ? rawName.replace(nameOnly, "").trim() : "",
        bio: bio,
        links: {}
      });
    }
  }

  // 2. Artist cards
  const cardBlocks = content.split(/<div class="card\s+/).slice(1);
  for (const block of cardBlocks) {
    const badgeMatch = block.match(/<div class="card-badge[^"]*">([^<]+)<\/div>/);
    const badge = badgeMatch ? badgeMatch[1].replace(/^[^\w]+/, "").trim() : "";
    const nameMatch = block.match(/<div class="card-name">([^<]+)<\/div>/);
    if (!nameMatch) continue;
    const name = nameMatch[1].trim();
    const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
    if (!slug || slug.includes("directory") || slug.includes("collection") || slug.includes("archive") || slug.includes("org") || seenSlugs.has(slug)) {
      continue;
    }
    seenSlugs.add(slug);

    const alsoMatch = block.match(/<div class="card-also">([^<]+)<\/div>/);
    const also = alsoMatch ? alsoMatch[1].trim() : "";
    const roleMatch = block.match(/<div class="card-role">([^<]+)<\/div>/);
    const role = roleMatch ? roleMatch[1].trim() : "Gospel Artist";
    const datesMatch = block.match(/<div class="card-dates">([^<]+)<\/div>/);
    const dates = datesMatch ? datesMatch[1].trim() : "";
    const bioMatch = block.match(/<div class="card-bio">([\s\S]*?)<\/div>/);
    const bio = bioMatch ? bioMatch[1].replace(/<[^>]+>/g, "").trim() : "";

    const links: Record<string, string> = {};
    const linkRegex = /<a class="link-btn[^"]*" href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
    let lMatch;
    while ((lMatch = linkRegex.exec(block)) !== null) {
      const href = lMatch[1];
      const linkLabel = lMatch[2].replace(/^[^\w]+/, "").trim();
      if (href && !href.startsWith("#")) {
        links[linkLabel || "Link"] = href;
      }
    }

    artists.push({
      id: slug,
      name,
      badge,
      also,
      role,
      dates,
      bio,
      links
    });
  }

  // Merge in any embedded artists the HTML parse missed (belt & braces)
  const seenIds = new Set(artists.map(a => a.id));
  for (const e of EMBEDDED_ARTISTS as unknown as ArtistRecord[]) {
    if (!seenIds.has(e.id)) {
      seenIds.add(e.id);
      artists.push(e);
    }
  }

  cachedArtists = artists;
  return artists;
}

function getVolumeSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

function findVolume(identifier: string) {
  if (!identifier) return null;
  const norm = decodeURIComponent(identifier).toLowerCase().trim();
  const padded = norm.padStart(2, '0');

  // Match by id or padded id (e.g. "02", "2", "33")
  let match = CATEGORIES.find(c => c.id === norm || c.id === padded);
  if (match) return match;

  // Match by title slug or c.slug (e.g. "all-bible-stories", "crusades-historical-theological-analysis")
  match = CATEGORIES.find(c => (c.slug && c.slug.toLowerCase() === norm) || getVolumeSlug(c.title) === norm);
  if (match) return match;

  // Match by partial title or slug
  match = CATEGORIES.find(c => (c.slug && (c.slug.includes(norm) || norm.includes(c.slug))) || getVolumeSlug(c.title).includes(norm) || norm.includes(getVolumeSlug(c.title)));
  return match || null;
}

function findArtist(identifier: string) {
  if (!identifier) return null;
  const norm = decodeURIComponent(identifier).toLowerCase().trim();
  const list = getSingersList();

  // 1. Exact slug match
  let match = list.find(a => a.id === norm);
  if (match) return match;

  // 2. Numeric index match (e.g. 01, 1, 02)
  const num = parseInt(norm, 10);
  if (!isNaN(num) && num >= 1 && num <= list.length) {
    return list[num - 1];
  }

  // 3. Partial match
  match = list.find(a => a.id.includes(norm) || norm.includes(a.id));
  return match || null;
}

// Explicit high-priority routes for Google AdSense crawler files
app.get("/ads.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.sendFile(path.join(process.cwd(), "public/ads.txt"));
});

app.get("/robots.txt", (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.sendFile(path.join(process.cwd(), "public/robots.txt"));
});

// Dynamic XML Sitemap Generator with comprehensive, deduplicated URLs
app.get("/sitemap.xml", async (req, res) => {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  try {
    const today = new Date().toISOString().split("T")[0];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.saulspodship.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.saulspodship.com/Pakistanisingersarchive</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;

    // Add all 50 Encyclopedia Volumes cleanly with standard slug URLs
    const seenVolumeSlugs = new Set<string>();
    for (const cat of CATEGORIES) {
      const slug = cat.slug || getVolumeSlug(cat.title);
      if (!seenVolumeSlugs.has(slug)) {
        seenVolumeSlugs.add(slug);
        xml += `
  <url>
    <loc>https://www.saulspodship.com/encyclopedia/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    }

    // Add all Music Archive Artists
    const singers = getSingersList();
    const seenArtistSlugs = new Set<string>();
    for (const artist of singers) {
      if (artist.id && !seenArtistSlugs.has(artist.id)) {
        seenArtistSlugs.add(artist.id);
        xml += `
  <url>
    <loc>https://www.saulspodship.com/music-archive/${artist.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    }

    xml += `\n</urlset>`;
    res.send(xml);
  } catch (err: any) {
    console.error("Failed to generate dynamic sitemap.xml:", err);
    res.status(500).send("Error generating sitemap.xml");
  }
});

// Dynamic route for Pakistani singers archive that appends dedicated bio links
app.get("/Pakistanisingersarchive", (req, res) => {
  // Try every plausible runtime location for the enhanced singers page;
  // NEVER call res.sendFile on a missing path (that threw → 500 on Vercel).
  const candidates = [
    path.join(process.cwd(), "public/singers.html"),
    path.join(process.cwd(), "dist/singers.html"),
    path.join(RUNTIME_DIRNAME, "../public/singers.html"),
    path.join(RUNTIME_DIRNAME, "../dist/singers.html"),
  ];
  const filePath = candidates.find(p => fs.existsSync(p)) || "";

  try {
    if (!filePath) throw new Error("singers.html unavailable");
    let content = fs.readFileSync(filePath, "utf8");

    // Replace each card's biography section to append a link to its dedicated SSR page
    const cardRegex = /<div class="card-name">([^<]+)<\/div>([\s\S]*?)<div class="card-bio">([\s\S]*?)<\/div>/g;

    content = content.replace(cardRegex, (match, name, middle, bio) => {
      const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
      if (slug && !slug.includes("directory") && !slug.includes("collection") && !slug.includes("archive") && !slug.includes("org")) {
        return `<div class="card-name">${name}</div>${middle}<div class="card-bio">${bio} <a href="/music-archive/${slug}" style="color:var(--gold-light); font-weight:bold; text-decoration:underline; display:inline-block; margin-left:0.35rem;">Read Biography &amp; Legacy &rarr;</a></div>`;
      }
      return match;
    });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(content);
  } catch (err) {
    console.error("[SINGERS ARCHIVE FALLBACK]", err);
    // Fully server-rendered fallback archive from embedded data — always works.
    const list = getSingersList();
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pakistani Christian Gospel Singers &amp; Musicians Archive | Saul's Podship</title>
<meta name="description" content="Living archive of Pakistani Christian gospel musicians, composers and the Punjabi Zaboor hymn tradition — biographies, legacies and recordings.">
<link rel="canonical" href="https://www.saulspodship.com/Pakistanisingersarchive" />
<style>
body{font-family:Georgia,'Times New Roman',serif;background:#1A0812;color:#f0eae1;margin:0;padding:3rem 1.5rem;}
h1{color:#D4AF37;font-size:2rem;margin:0 0 .5rem;text-align:center;}
.sub{text-align:center;color:rgba(240,234,225,.7);font-size:.95rem;margin-bottom:2.5rem;}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem;max-width:1100px;margin:0 auto;}
.card{background:rgba(255,255,255,.04);border:1px solid rgba(212,175,55,.25);border-radius:12px;padding:1.2rem;}
.card h2{font-size:1.05rem;margin:0 0 .25rem;color:#E8C96A;}
.role{font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:rgba(240,234,225,.55);margin-bottom:.5rem;}
.bio{font-size:.85rem;line-height:1.55;color:rgba(240,234,225,.85);margin-bottom:.75rem;}
a{color:#D4AF37;text-decoration:none;font-weight:bold;}
a:hover{text-decoration:underline;}
.home{text-align:center;margin-top:2.5rem;}
</style>
</head>
<body>
<h1>Pakistani Christian Gospel Music Archive</h1>
<p class="sub">Pioneers, composers and living voices of the Punjabi Zaboor — ${list.length} profiles documented by Saul's Podship.</p>
<div class="grid">
${list.map(a => `<div class="card"><h2>${a.name}</h2><div class="role">${a.badge || a.role}</div><div class="bio">${String(a.bio || "").slice(0, 260)}${String(a.bio || "").length > 260 ? "…" : ""}</div><a href="/music-archive/${a.id}">Read Biography &amp; Legacy →</a></div>`).join("\n")}
</div>
<div class="home"><a href="/">← Return to Saul's Podship</a></div>
<script src="/assets/bottom-nav.js?v=260911" defer></script>
</body>
</html>`);
  }
});

// Dynamic Server-Side Rendered (SSR) Volume Page for Search Indexing & AdSense Compliance
app.get("/encyclopedia/:slug", async (req, res) => {
  const reqSlug = req.params.slug;
  console.log(`[ENCYCLOPEDIA ROUTE LOG] Received request for /encyclopedia/:slug with slug parameter: "${reqSlug}"`);

  try {
    // 1. Try local data first (fast, reliable, 100% available)
    const localVolume = findVolume(reqSlug);
    
    // 2. Optionally check Firestore for runtime edits (with safe fallback).
    //    Time-boxed: the local corpus is already in memory, so an editor's
    //    Firestore copy may take at most 600 ms before we render local data.
    //    Previously every volume URL waited on this round-trip unconditionally.
    let firestoreVolume: any = null;
    try {
      firestoreVolume = await Promise.race([
        getFirestoreDoc("volumes", reqSlug),
        new Promise((resolve) => setTimeout(() => resolve(null), 600)),
      ]);
    } catch (_) {
      // Ignore Firestore permission/network errors and proceed with local data
    }

    const volume = firestoreVolume || localVolume;

    if (!volume) {
      return res.status(404).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Volume Not Found | Saul's Podship Theological Encyclopedia</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="/src/index.css">
</head>
<body style="background-color:#F8F4E3; color:#1D2D50; font-family:sans-serif; text-align:center; padding:5rem 2rem;">
  <h1 style="color:#4A152C; font-size:2rem; margin-bottom:1rem;">Volume Not Found</h1>
  <p style="margin-bottom:2rem;">The requested encyclopedia volume could not be located.</p>
  <a href="/" style="background-color:#4A152C; color:#D4AF37; padding:0.8rem 1.5rem; text-decoration:none; border-radius:6px; font-weight:bold;">Return to Encyclopedia</a>
<script src="/assets/bottom-nav.js?v=260911" defer></script>
</body>
</html>`);
    }

    const canonicalSlug = volume.slug || getVolumeSlug(volume.title);

    // If requested by ID (e.g. /encyclopedia/32 or /encyclopedia/08) or non-canonical slug, 301 redirect to canonical slug URL
    if (reqSlug.toLowerCase() !== canonicalSlug.toLowerCase()) {
      return res.redirect(301, `/encyclopedia/${canonicalSlug}`);
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    // Let the edge serve the article without re-running the function on every
    // hit (the corpus only changes on deploy or an explicit Firestore edit).
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600, stale-while-revalidate=86400");
    const title = volume.metaTitle || `${volume.title} | Volume ${volume.id || ''} Theological Encyclopedia | Saul's Podship`;
    const description = volume.metaDescription || volume.overview || `Scholarly exegesis, historical context, and comprehensive theological analysis of ${volume.title}.`;
    const volumeNumber = volume.volumeNumber || volume.id || "01";

    // Related links HTML
    let relatedLinksHtml = "";
    const relatedList = volume.relatedVolumes || volume.relatedVolumeIds || [];
    if (relatedList.length > 0) {
      relatedLinksHtml = `<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top:1.5rem;">`;
      for (const relSlug of relatedList) {
        const relVol = findVolume(relSlug);
        const relTitle = relVol ? relVol.title : relSlug.split("-").map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
        const targetSlug = relVol ? (relVol.slug || getVolumeSlug(relVol.title)) : relSlug;
        relatedLinksHtml += `
          <a href="/encyclopedia/${targetSlug}" style="background-color:rgba(74,21,44,0.04); border:1px solid rgba(74,21,44,0.15); border-radius:4px; padding:1.2rem; text-decoration:none; color:#4A152C; transition:all 0.2s;">
            <strong style="display:block; font-family:'Merriweather', serif; font-size:1.05rem; margin-bottom:0.4rem;">${relTitle}</strong>
            <span style="font-size:0.8rem; color:rgba(29,45,80,0.7);">Explore related exegesis &rarr;</span>
          </a>`;
      }
      relatedLinksHtml += `</div>`;
    } else {
      // Generate default related links from adjacent volumes
      relatedLinksHtml = `<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top:1.5rem;">`;
      const curIdx = CATEGORIES.findIndex(c => c.id === volume.id || (c.slug && c.slug === canonicalSlug) || getVolumeSlug(c.title) === canonicalSlug);
      const adjacent = [
        CATEGORIES[(curIdx + 1) % CATEGORIES.length],
        CATEGORIES[(curIdx + 2) % CATEGORIES.length]
      ].filter(Boolean);
      for (const relVol of adjacent) {
        relatedLinksHtml += `
          <a href="/encyclopedia/${relVol.slug || getVolumeSlug(relVol.title)}" style="background-color:rgba(74,21,44,0.04); border:1px solid rgba(74,21,44,0.15); border-radius:4px; padding:1.2rem; text-decoration:none; color:#4A152C; transition:all 0.2s;">
            <strong style="display:block; font-family:'Merriweather', serif; font-size:1.05rem; margin-bottom:0.4rem;">${relVol.title}</strong>
            <span style="font-size:0.8rem; color:rgba(29,45,80,0.7);">Explore related exegesis &rarr;</span>
          </a>`;
      }
      relatedLinksHtml += `</div>`;
    }

    // Convert tables to HTML. A volume's lineage (content.lineage) leads them as one
    // more reference table: this article is the no-JavaScript reading of the volume,
    // so it carries the same facts as the explorer on the volume page.
    const articleTables: any[] = [];
    const lineage = volume.content?.lineage;
    if (lineage && Array.isArray(lineage.nodes) && lineage.nodes.length > 0) {
      try {
        const esc = (s: string) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const { headers, rows } = lineageTable(lineage);
        articleTables.push({
          title: esc(lineage.title || "Lineage"),
          intro: lineage.intro ? esc(lineage.intro) : "",
          headers,
          rows: rows.map((row) => row.map(esc)),
        });
      } catch (_) {
        // A malformed lineage (e.g. a hand-edited Firestore copy) must not cost the article its tables.
      }
    }
    if (volume.content && Array.isArray(volume.content.tables)) articleTables.push(...volume.content.tables);

    let tablesHtml = "";
    if (articleTables.length > 0) {
      for (const tbl of articleTables) {
        tablesHtml += `<div style="margin-top:2.5rem; margin-bottom:2.5rem;">
          <h3 style="font-family:'Merriweather', serif; color:#4A152C; font-size:1.25rem; margin-bottom:1rem; font-weight:700;">${tbl.title || 'Theological Reference'}</h3>
          ${tbl.intro ? `<p style="margin:0 0 1rem 0; font-size:0.9rem; color:rgba(29,45,80,0.75);">${tbl.intro}</p>` : ''}
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; background-color:#ffffff; border:1px solid rgba(74,21,44,0.15); font-size:0.9rem;">
              <thead>
                <tr style="background-color:#4A152C; color:#D4AF37;">`;
        for (const header of (tbl.headers || [])) {
          tablesHtml += `<th style="padding:0.75rem 1rem; border:1px solid rgba(74,21,44,0.15); text-align:left; font-weight:700; text-transform:uppercase; font-size:0.75rem; letter-spacing:0.05em;">${header}</th>`;
        }
        tablesHtml += `</tr></thead><tbody>`;
        for (const row of (tbl.rows || [])) {
          const cells = Array.isArray(row) ? row : (row.cells || []);
          tablesHtml += `<tr style="border-bottom:1px solid rgba(74,21,44,0.1);">`;
          for (const cell of cells) {
            tablesHtml += `<td style="padding:0.75rem 1rem; border:1px solid rgba(74,21,44,0.1); color:#1D2D50; line-height:1.5;">${cell}</td>`;
          }
          tablesHtml += `</tr>`;
        }
        tablesHtml += `</tbody></table></div></div>`;
      }
    }

    // Schema.org Article Structured Data
    const schemaJson = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": volume.title,
      "alternativeHeadline": volume.subtitle || "",
      "description": volume.teaser || description,
      "inLanguage": "en",
      "publisher": {
        "@type": "Organization",
        "name": "Saul's Podship",
        "logo": "https://www.saulspodship.com/logo.svg"
      },
      "author": {
        "@type": "Person",
        "name": "Solat Nadeem / Saul's Podship"
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://www.saulspodship.com/encyclopedia/${canonicalSlug}`
      }
    });

    const analysisContent = volume.content?.analysis || volume.overview || "Scholarly theological analysis in progress.";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="https://www.saulspodship.com/encyclopedia/${canonicalSlug}" />
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="https://www.saulspodship.com/encyclopedia/${canonicalSlug}">
  <meta property="og:type" content="article">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <script type="application/ld+json">${schemaJson}</script>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #F8F4E3;
      color: #1D2D50;
      margin: 0;
      padding: 3rem 1.5rem;
      line-height: 1.8;
    }
  </style>
</head>
<body>
  <div style="max-width: 850px; margin: 0 auto; box-sizing: border-box;">
    <!-- BREADCRUMBS -->
    <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2.5rem; color: rgba(29,45,80,0.6);">
      <a href="/" style="color: #4A152C; text-decoration: none; font-weight: bold;">Home</a> &nbsp;/&nbsp; 
      <a href="/#encyclopedia" style="color: #4A152C; text-decoration: none; font-weight: bold;">Encyclopedia</a> &nbsp;/&nbsp; 
      <span style="color: #1D2D50;">${volume.title}</span>
    </div>

    <h1 style="font-family: 'Merriweather', serif; color: #4A152C; font-size: 2.5rem; margin: 0 0 0.5rem 0; font-weight: 900; line-height: 1.2;">Volume ${volumeNumber}: ${volume.title}</h1>
    ${volume.subtitle ? `<p style="font-style: italic; color: rgba(29,45,80,0.7); font-size: 1.15rem; margin-top: 0; margin-bottom: 2.5rem; border-left: 3px solid #D4AF37; padding-left: 1rem;">${volume.subtitle}</p>` : ''}

    <div style="margin-bottom: 3.5rem;">
      ${markdownToHtml(analysisContent)}
    </div>

    ${tablesHtml}

    <!-- RELATED VOLUMES -->
    <div style="border-top: 2px solid #D4AF37; padding-top: 2rem; margin-top: 4rem;">
      <h3 style="font-family: 'Merriweather', serif; color: #4A152C; font-size: 1.2rem; margin-bottom: 0.5rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Related Volumes</h3>
      ${relatedLinksHtml}
    </div>
  </div>
<script src="/assets/bottom-nav.js?v=260911" defer></script>
</body>
</html>`;
    res.send(html);
  } catch (err: any) {
    console.error("[ENCYCLOPEDIA RENDER ERROR]", err);
    res.status(500).send("Error rendering volume page");
  }
});

// Dynamic Server-Side Rendered (SSR) Artist Page for Search Indexing & AdSense Compliance
app.get("/music-archive/:slug", async (req, res) => {
  const reqSlug = req.params.slug || "";
  console.log(`[MUSIC ARCHIVE ROUTE LOG] Received request for /music-archive/:slug with parameter: "${reqSlug}"`);

  // Direct directory and resource queries to the main archive page
  if (
    reqSlug.includes("directory") ||
    reqSlug.includes("collection") ||
    reqSlug.includes("archive") ||
    reqSlug.includes("pakistani-christian-gospel-singers") ||
    reqSlug.includes("geetandzaboor") ||
    reqSlug.includes("dailygeet") ||
    reqSlug.includes("bonpounou")
  ) {
    return res.redirect(301, "/Pakistanisingersarchive");
  }

  try {
    // 1. Try local parsed singer records
    const localArtist = findArtist(reqSlug);

    // 2. Optionally check Firestore for runtime updates (safely)
    let firestoreArtist: any = null;
    try {
      firestoreArtist = await getFirestoreDoc("musicArchive", reqSlug);
    } catch (_) {
      // Ignore Firestore permission errors safely
    }

    const artist = firestoreArtist || localArtist;

    if (!artist) {
      return res.status(404).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Artist Not Found | Pakistani Gospel Music Archive</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color:#0d0906; color:#f0eae1; font-family:sans-serif; text-align:center; padding:5rem 2rem;">
  <h1 style="color:#d4af37; font-size:2rem; margin-bottom:1rem;">Artist Profile Not Found</h1>
  <p style="margin-bottom:2rem; opacity:0.8;">The requested gospel musician profile could not be found in our archive.</p>
  <a href="/Pakistanisingersarchive" style="background-color:#d4af37; color:#0d0906; padding:0.8rem 1.5rem; text-decoration:none; border-radius:6px; font-weight:bold;">Return to Music Archive</a>
<script src="/assets/bottom-nav.js?v=260911" defer></script>
</body>
</html>`);
    }

    const canonicalSlug = artist.id || reqSlug;

    // If requested with a non-canonical slug, 301 redirect to canonical slug
    if (reqSlug.toLowerCase() !== canonicalSlug.toLowerCase()) {
      return res.redirect(301, `/music-archive/${canonicalSlug}`);
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    const title = artist.metaTitle || `${artist.name} | Pakistani Christian Gospel Music Archive | Saul's Podship`;
    const description = artist.metaDescription || `Biography, musical legacy, and historical recordings of ${artist.name}, ${artist.role} in Pakistani Christian gospel music.`;

    let linksHtml = "";
    if (artist.links && Object.keys(artist.links).length > 0) {
      linksHtml = `<div style="margin-top: 3rem; border-top: 1px solid #D4AF37; padding-top: 1.5rem;">
        <h3 style="font-family:'Merriweather', serif; color:#4A152C; font-size:1.2rem; margin-bottom:1rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">Official Media & Links</h3>
        <div style="display:flex; flex-wrap:wrap; gap:1rem;">`;
      for (const [key, url] of Object.entries(artist.links)) {
        linksHtml += `<a href="${url}" target="_blank" rel="noopener noreferrer" style="background-color:#4A152C; color:#D4AF37; padding:0.6rem 1.2rem; text-decoration:none; font-weight:bold; font-size:0.8rem; border-radius:4px; text-transform:uppercase; letter-spacing:0.05em;">${key}</a>`;
      }
      linksHtml += `</div></div>`;
    }

    // JSON-LD Person Schema
    const personSchema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      "name": artist.name,
      "description": description,
      "jobTitle": artist.role,
      "url": `https://www.saulspodship.com/music-archive/${canonicalSlug}`,
      "mainEntityOfPage": `https://www.saulspodship.com/music-archive/${canonicalSlug}`
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="https://www.saulspodship.com/music-archive/${canonicalSlug}" />
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="https://www.saulspodship.com/music-archive/${canonicalSlug}">
  <meta property="og:type" content="profile">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <script type="application/ld+json">${personSchema}</script>
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background-color: #F8F4E3;
      color: #1D2D50;
      margin: 0;
      padding: 3rem 1.5rem;
      line-height: 1.8;
    }
  </style>
</head>
<body>
  <div style="max-width: 800px; margin: 0 auto; box-sizing: border-box;">
    <!-- BREADCRUMBS -->
    <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2.5rem; color: rgba(29,45,80,0.6);">
      <a href="/" style="color: #4A152C; text-decoration: none; font-weight: bold;">Home</a> &nbsp;/&nbsp; 
      <a href="/Pakistanisingersarchive" style="color: #4A152C; text-decoration: none; font-weight: bold;">Music Archive</a> &nbsp;/&nbsp; 
      <span style="color: #1D2D50;">${artist.name}</span>
    </div>

    ${artist.badge ? `<span style="background-color: #4A152C; color: #D4AF37; font-size: 0.75rem; font-weight: bold; padding: 0.25rem 0.6rem; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block; margin-bottom: 1rem;">${artist.badge}</span>` : ''}
    <h1 style="font-family: 'Merriweather', serif; color: #4A152C; font-size: 2.5rem; margin: 0 0 0.5rem 0; font-weight: 900; line-height: 1.2;">${artist.name}</h1>
    ${artist.also ? `<p style="font-style: italic; color: rgba(29,45,80,0.7); font-size: 1.1rem; margin-top: 0; margin-bottom: 1rem;">Also known as: ${artist.also}</p>` : ''}
    <p style="font-weight: bold; color: #4A152C; margin-bottom: 2rem;">Role: ${artist.role} ${artist.dates ? `· ${artist.dates}` : ''}</p>

    <div style="margin-bottom: 3rem; text-align: justify; font-size: 1.1rem;">
      <p>${artist.bio}</p>
    </div>

    ${linksHtml}
  </div>
<script src="/assets/bottom-nav.js?v=260911" defer></script>
</body>
</html>`;
    res.send(html);
  } catch (err: any) {
    console.error("[ARTIST BIO RENDER ERROR]", err);
    res.status(500).send("Error rendering artist bio page");
  }
});

// Always serve the static local maps/images directory so dynamic map/image paths resolve instantly in both dev and prod
app.use("/src/assets/images", express.static(path.join(process.cwd(), "src/assets/images")));
app.use("/images", express.static(path.join(process.cwd(), "public/images")));

app.get(/.*/, (req, res, next) => {
  const distPath = path.join(process.cwd(), "dist");
  let isContainer = false;
  try {
    isContainer = fs.existsSync(distPath) && fs.statSync(distPath).isDirectory();
  } catch (e) {
    // ignore
  }
  
  if (isContainer) {
    return next();
  }
  
  const hasExtension = /\.[a-z0-9]+$/i.test(req.path);
  const isHtml = req.path.endsWith('.html');
  
  if (!hasExtension || isHtml) {
    return res.redirect(302, "/#" + req.path);
  } else {
    return res.status(404).json({ error: "Not found", path: req.path });
  }
});

// Export Express app for serverless function/local listener usage
export default app;
