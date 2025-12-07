import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);

export function serveStatic(app) {
  var distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      "Could not find the build directory: " + distPath + ", make sure to build the client first"
    );
  }

  app.use(express.static(distPath));

  app.use("*", function(_req, res) {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
