import fs from "fs";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export function log(message, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
    console.log(`${formattedTime} [${source}] ${message}`);
}
export function serveStatic(app) {
    // Frontend builds to root dist/public, backend compiles to packages/backend/dist
    // So from packages/backend/dist/utils.js, we go up three levels to repo root, then into dist/public
    const distPath = path.resolve(__dirname, "../../..", "dist", "public");
    if (!fs.existsSync(distPath)) {
        console.warn(`Static build directory not found: ${distPath}. Skipping static file serving.`);
        return;
    }
    app.use(express.static(distPath));
    // fall through to index.html if the file doesn't exist
    app.use("*", (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
    });
}
