import joi from "joi";
import { generalFields } from "../../Middlewares/validation.middleware.js";

export const messageSchema = {
  body: joi.object({
    content: joi.string().min(2).max(500).required(),
  }),
  params: joi.object({
    receiverId: generalFields.id.required(),
  }),
};
