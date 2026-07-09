import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { DEFAULT_SETTINGS } from "./src/data/initialData";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  const settingsPath = path.join(process.cwd(), "src", "data", "store_settings_persistent.json");

  // Load settings helper
  const getPersistedSettings = () => {
    try {
      if (fs.existsSync(settingsPath)) {
        const fileContent = fs.readFileSync(settingsPath, "utf-8");
        const parsed = JSON.parse(fileContent);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (err) {
      console.error("Error reading persistent settings, using defaults:", err);
    }
    return DEFAULT_SETTINGS;
  };

  // API endpoints
  app.get("/api/settings", (req, res) => {
    const settings = getPersistedSettings();
    res.json(settings);
  });

  app.post("/api/settings", (req, res) => {
    try {
      const settings = req.body;
      const dirPath = path.dirname(settingsPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf-8");
      res.json({ success: true, settings });
    } catch (err) {
      console.error("Error saving persistent settings:", err);
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
