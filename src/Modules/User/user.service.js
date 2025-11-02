import * as dbService from "../../DB/dbSerivce.js";
import { asymmetricdecrypt } from "../../Utils/Encryption/encryption.utils.js";
import { successResponse } from "../../Utils/successResponse.utils.js";
import userModel from "../../DB/Models/user.model.js";

export const listAllUsers = async (req, res, next) => {
  let users = await dbService.find({
    model: userModel,
    populate: [{ path: "messages", select: "content -_id -receiverId" }],
  });
  // users = users.map((user) => {
  //   return { ...user._doc, phone: asymmetricdecrypt(user.phone) };
  // });
  return successResponse({
    res,
    statusCode: 200,
    message: "Users fetched successfully",
    data: { users },
  });
};

export const updateProfile = async (req, res, next) => {
  const { firstName, lastName, gender } = req.body;

  const user = await dbService.findByIdAndUpdate({
    model: userModel,
    id: req.decoded.id,
    data: { firstName, lastName, gender, $inc: { __v: 1 } },
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Users updated successfully",
    data: { user },
  });
};

export const updateProfileImage = async (req, res, next) => {
  return successResponse({
    res,
    statusCode: 200,
    message: "Profile Image updated successfully",
    data: { file: req.file },
  });
};
