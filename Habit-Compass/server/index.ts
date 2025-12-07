import express from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

app.use(
  express.json({
    verify: function(req, _res, buf) {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message, source) {
  if (!source) source = "express";
  var formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(formattedTime + " [" + source + "] " + message);
}

app.use(function(req, res, next) {
  var start = Date.now();
  var path = req.path;
  var capturedJsonResponse = undefined;

  var originalResJson = res.json;
  res.json = function(bodyJson) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, arguments);
  };

  res.on("finish", function() {
    var duration = Date.now() - start;
    if (path.startsWith("/api")) {
      var logLine = req.method + " " + path + " " + res.statusCode + " in " + duration + "ms";
      if (capturedJsonResponse) {
        logLine += " :: " + JSON.stringify(capturedJsonResponse);
      }

      log(logLine);
    }
  });

  next();
});

(async function() {
  await registerRoutes(httpServer, app);

  app.use(function(err, _req, res, _next) {
    var status = err.status || err.statusCode || 500;
    var message = err.message || "Internal Server Error";

    res.status(status).json({ message: message });
    throw err;
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    var viteModule = await import("./vite");
    await viteModule.setupVite(httpServer, app);
  }

  var port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port: port,
      host: "0.0.0.0",
      reusePort: true,
    },
    function() {
      log("serving on port " + port);
    },
  );
})();
