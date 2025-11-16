import * as dbService from "../../DB/dbSerivce.js";
import { asymmetricdecrypt } from "../../Utils/Encryption/encryption.utils.js";
import { successResponse } from "../../Utils/successResponse.utils.js";
import userModel from "../../DB/Models/user.model.js";
import { cloudinaryConfig } from "../../Utils/multer/cloudinary.config.js";

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
  const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    data: { profilePhoto: req.file.finalPath },
  });
  return successResponse({
    res,
    statusCode: 200,
    message: "Profile Image updated successfully",
    data: { user },
  });
};

export const updateCloudProfileImage = async (req, res, next) => {
  const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(
    req.file.path,
    {
      folder: `Sara7aApp/Users/${req.user._id}`,
    }
  );
  const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    data: { cloudProfilePhoto: { public_id, secure_url } },
  });
  if (req.user.cloudProfilePhoto?.public_id) {
    await cloudinaryConfig().uploader.destroy(
      req.user.cloudProfilePhoto.public_id
    );
  }

  return successResponse({
    res,
    statusCode: 200,
    message: "Profile Image updated successfully",
    data: { user },
  });
};

export const updateCoverImage = async (req, res, next) => {
  const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    data: { coverPhoto: req.files.map((file) => file.finalPath) },
  });
  return successResponse({
    res,
    statusCode: 200,
    message: "Cover Image updated successfully",
    data: { user },
  });
};

export const updateCloudCoverImage = async (req, res, next) => {
  const attachments = [];
  for (const file of req.files) {
    const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(
      file.path,
      {
        folder: `Sara7aApp/Users/${req.user._id}`,
      }
    );
    attachments.push({ public_id, secure_url });
  }
  const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    data: { cloudCoverPhoto: attachments },
  });
  if (user.cloudCoverPhoto) {
    for (const image of user.cloudCoverPhoto) {
      await cloudinaryConfig().uploader.destroy(image.public_id);
    }
  }
  return successResponse({
    res,
    statusCode: 200,
    message: "Cover Image updated successfully",
    data: { attachments },
  });
};

//destroy imagess
