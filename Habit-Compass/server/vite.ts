import { createServer as createViteServer, createLogger } from "vite";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";

var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);

var viteLogger = createLogger();

export async function setupVite(server, app) {
  var viteConfig = (await import("../vite.config.js")).default;
  
  var serverOptions = {
    middlewareMode: true,
    hmr: { server: server, path: "/vite-hmr" },
    allowedHosts: true,
  };

  var vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: function(msg, options) {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("*", async function(req, res, next) {
    var url = req.originalUrl;

    try {
      var clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html"
      );

      var template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        'src="/src/main.js"',
        'src="/src/main.js?v=' + nanoid() + '"'
      );
      var page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
