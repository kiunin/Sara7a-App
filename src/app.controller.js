import authRouter from "./Modules/Auth/auth.controller.js";
import userRouter from "./Modules/User/user.controller.js";
import messageRouter from "./Modules/Message/message.controller.js";
import connectDB from "./DB/connection.js";
import { globalErrorHandler } from "./Utils/globalErrorHandler.utils.js";
import cors from "cors";
import path from "node:path";

const bootstrap = async (app, express) => {
  await connectDB();
  app.use(express.json());
  app.use(cors());

  app.get("/", (req, res) => {
    return res.status(200).json({ message: " Server is runningggg" });
  });

  app.use("/uploads", express.static(path.resolve("./src/uploads")));
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/message", messageRouter);

  app.all("/*dummy", (req, res) => {
    return res.status(404).json({ message: " Handler not Found" });
  });
  app.use(globalErrorHandler);
};

export default bootstrap;
