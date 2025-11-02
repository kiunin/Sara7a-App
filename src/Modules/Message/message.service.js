import * as dbService from "../../DB/dbSerivce.js";
import userModel from "../../DB/Models/user.model.js";
import messageModel from "../../DB/Models/message.model.js";
import { successResponse } from "../../Utils/successResponse.utils.js";

export const sendMessage = async (req, res, next) => {
  const { content } = req.body;
  const { receiverId } = req.params;
  const user = await dbService.findById({ model: userModel, id: receiverId });
  if (!user) {
    return next(new Error("Receiver not found", { cause: 404 }));
  }
  const message = await dbService.create({
    model: messageModel,
    data: [{ content, receiverId: user._id }],
  });
  return successResponse({
    res,
    statusCode: 201,
    message: "Message sent successfully",
    data: { message },
  });
};

export const getMessage = async (req, res, next) => {
  const messages = await dbService.find({
    model: messageModel,
    populate: [
      { path: "receiverId", select: "firstName lastName email gender _id" },
    ],
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Messages fetched successfully",
    data: { messages },
  });
};
