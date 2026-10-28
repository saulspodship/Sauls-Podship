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
      app.use(vite.middlewares);
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Development server running on http://localhost:${PORT}`);
      });
    });
  });
} else {
  // In production (container build)
  const distPath = path.join(process.cwd(), "dist");
  // Serve the crawler-readable About and FAQ pages at their clean canonical
  // URLs. The in-page boot script still hands JS users to the hash router.
  app.get(["/about", "/faq"], (req, res) => {
    const page = req.path.replace(/\/$/, "").slice(1);
    res.sendFile(path.join(distPath, `${page}.html`));
  });
  app.use(express.static(distPath));
  app.get("*all", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Production server running on http://localhost:${PORT}`);
  });
}

