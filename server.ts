import app from "./api/index";
import path from "path";
import express from "express";

const PORT = 3000;

if (process.env.NODE_ENV !== "production") {
  // In development, load Vite dynamically
  import("vite").then(({ createServer: createViteServer }) => {
    createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: "spa",
    }).then((vite) => {
      // Tell the API's catch-all route that Vite is live behind it: anything
      // the API doesn't own must fall through to Vite (public/ files, /src
      // modules, the SPA shell) instead of being 404'd or redirected.
      (globalThis as any).__SP_VITE_DEV = true;
      app.use(vite.middlewares);
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Development server running on http://localhost:${PORT}`);
      });
    });
  });
} else {
  // In production (container build)
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*all", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Production server running on http://localhost:${PORT}`);
  });
}

