import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    limit: "16kb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${Date.now() - start}ms`);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    if (res.headersSent) return;

    const type = typeof err?.type === "string" ? err.type : "";
    const status = type === "entity.too.large"
      ? 413
      : err instanceof SyntaxError || type === "entity.parse.failed"
        ? 400
        : Number(err?.status || err?.statusCode) || 500;
    const error = status === 413
      ? "Request is too large."
      : status === 400
        ? "Request could not be read."
        : "Request failed.";
    const code = status >= 500 ? "unavailable" : "invalid_request";

    log(`${req.method} ${req.path} ${status}`);
    res.status(status).json({ error, code });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  const listenOptions: import("net").ListenOptions = {
      port,
      host: "0.0.0.0",
  };

  // Windows does not support reusePort; guard to avoid ENOTSUP.
  if (process.platform !== "win32") {
    (listenOptions as import("net").ListenOptions & { reusePort?: boolean }).reusePort = true;
  }

  httpServer.listen(listenOptions, () => {
      log(`serving on port ${port}`);
  });
})();
