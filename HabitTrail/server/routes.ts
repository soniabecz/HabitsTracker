import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from client/public directory
  const publicPath = path.join(process.cwd(), 'client', 'public');
  app.use(express.static(publicPath));

  // Serve index.html for all routes (single page application)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });

  const httpServer = createServer(app);

  return httpServer;
}
