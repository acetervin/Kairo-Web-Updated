"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const express = require("express");
function log(message, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
    console.log(`${formattedTime} [${source}] ${message}`);
}
function serveStatic(app) {
    // Frontend builds to root dist/public, backend compiles to packages/backend/dist
    // So from packages/backend/dist/utils.js, we go up three levels to repo root, then into dist/public
    const distPath = path.resolve(__dirname, "../../..", "dist", "public");
    if (!fs.existsSync(distPath)) {
        console.warn(`Static build directory not found: ${distPath}. Skipping static file serving.`);
        return;
    }
    // Serve static files, but exclude API routes
    const staticMiddleware = express.static(distPath);
    app.use((req, res, next) => {
        if (req.path.startsWith("/api/")) {
            return next();
        }
        staticMiddleware(req, res, next);
    });
    // fall through to index.html if the file doesn't exist, but exclude API routes
    app.use("*", (req, res, next) => {
        // Don't serve index.html for API routes - let them return 404 or be handled by API routes
        if (req.path.startsWith("/api/")) {
            return next();
        }
        res.sendFile(path.resolve(distPath, "index.html"));
    });
}
module.exports = { log, serveStatic };
