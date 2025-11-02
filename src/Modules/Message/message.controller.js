import { Router } from "express";
import * as messageService from "./message.service.js";
import { validation } from "../../Middlewares/validation.middleware.js";
import { messageSchema } from "./message.validation.js";

const router = Router();

router.post(
  "/send-message/:receiverId",
  validation(messageSchema),
  messageService.sendMessage
);
router.get("/get-message", messageService.getMessage);

export default router;
