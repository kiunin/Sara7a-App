import morgan from "morgan";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.resolve();

export function attachRouterWithLogger(app, routerPath, router, logFileName) {
  const logStream = fs.createWriteStream(
    path.join(__dirname, "./src/Logs", logFileName),
    { flags: "a" }
  );
  app.use(morgan("dev"));
  app.use(routerPath, morgan("combined", { stream: logStream }), router);
}
