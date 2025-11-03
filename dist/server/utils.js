import fs from "fs";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
export function log(message, source) {
    if (source === void 0) { source = "express"; }
    var formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
    console.log("".concat(formattedTime, " [").concat(source, "] ").concat(message));
}
export function serveStatic(app) {
    var distPath = path.resolve(__dirname, "..", "dist", "public");
    if (!fs.existsSync(distPath)) {
        throw new Error("Could not find the build directory: ".concat(distPath, ", make sure to build the client first"));
    }
    app.use(express.static(distPath));
    // fall through to index.html if the file doesn't exist
    app.use("*", function (_req, res) {
        res.sendFile(path.resolve(distPath, "index.html"));
    });
}
