// Verifies the codex artifact is intact. Exit 1 on any failure.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const ARTIFACT = "public/comparative-apologetics/codex.html";
const candidates = [
  resolve(here, "../" + ARTIFACT),
  resolve(process.cwd(), ARTIFACT),
];
let html = null, used = null;
for (const p of candidates) { try { html = readFileSync(p, "utf8"); used = p; break; } catch {} }
if (!html) { console.error("FAIL: codex artifact not found (expected " + ARTIFACT + ")"); process.exit(1); }
const ids = [...html.matchAll(/<article class="qcard" id="(q-([a-z]+)-(\d+))"/g)];
const byRel = {};
for (const m of ids) byRel[m[2]] = (byRel[m[2]] || 0) + 1;
const unique = new Set(ids.map(m => m[1])).size;
const problems = [];
if (ids.length !== 400) problems.push(`expected 400 cards, found ${ids.length}`);
if (unique !== ids.length) problems.push("duplicate card ids");
for (const r of ["islam", "judaism", "hinduism", "sikhism"]) if (byRel[r] !== 100) problems.push(`${r}: ${byRel[r] || 0}/100`);
if (!html.includes('id="toolbar"')) problems.push("toolbar missing");
if (!html.includes('id="qsort"')) problems.push("sort control missing");
if (!/id="sec-(islam|judaism|hinduism|sikhism)"/.test(html)) problems.push("section anchors missing");
if (!html.includes("ENHANCED-UX v1")) problems.push("UX enhancement marker missing");
if (problems.length) { console.error("FAIL:", problems.join("; ")); process.exit(1); }
console.log(`OK: 400/400 cards (islam ${byRel.islam}, judaism ${byRel.judaism}, hinduism ${byRel.hinduism}, sikhism ${byRel.sikhism}), toolbar present\n  ${used}`);
