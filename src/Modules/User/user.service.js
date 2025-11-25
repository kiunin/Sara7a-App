import * as dbService from "../../DB/dbSerivce.js";
import { asymmetricdecrypt } from "../../Utils/Encryption/encryption.utils.js";
import { successResponse } from "../../Utils/successResponse.utils.js";
import userModel, { roleEnum } from "../../DB/Models/user.model.js";
import { cloudinaryConfig } from "../../Utils/multer/cloudinary.config.js";

export const listAllUsers = async (req, res, next) => {
  let users = await dbService.find({
    model: userModel,
    populate: [{ path: "messages", select: "content -_id -receiverId" }],
  });

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

export const freezeAccount = async (req, res, next) => {
  const { userId } = req.params;
  if (userId && req.user.role != roleEnum.ADMIN) {
    return next(new Error("You are not authorized to freeze Account"));
  }
  const updatedUser = await dbService.findOneAndUpdate({
    model: userModel,
    filter: {
      _id: userId || req.user._id,
      freezedAt: { $exists: false },
    },
    data: {
      freezedAt: Date.now(),
      freezedBy: req.user._id,
      $inc: { __v: 1 },
      $unset: { restoredBy: true, restoredAt: true },
    },
  });
  return updatedUser
    ? successResponse({
        res,
        statusCode: 200,
        message: "Profile Freezed succeefully",
        data: { user: updatedUser },
      })
    : next(new Error("Invalid Account"));
};

export const restoreAccount = async (req, res, next) => {
  const user = await dbService.findOne({
    model: userModel,
    filter: {
      _id: req.user._id,
      freezedBy: { $exists: true },
      freezedAt: { $exists: true },
    },
  });
  if (!user) {
    return next(new Error("Account is not freezed"));
  }

  if (req.user._id.toString() != user.freezedBy.toString()) {
    return next(new Error("You are not authorized to restore Account"));
  }

  const updatedUser = await dbService.updateOne({
    model: userModel,
    filter: {
      _id: req.user._id,
    },
    data: {
      $unset: { freezedAt: true, freezedBy: true },
      restoredAt: Date.now(),
      restoredBy: req.user._id,
      $inc: { __v: 1 },
    },
  });
  return updatedUser
    ? successResponse({
        res,
        statusCode: 200,
        message: "Profile Restored succeefully",
        data: { user: updatedUser },
      })
    : next(new Error("Invalid Account"));
};

export const deleteAccount = async (req, res, next) => {
  const { userId } = req.params;
  if (req.user.role != roleEnum.ADMIN) {
    return next(new Error("You are not authorized to delete Accounts"));
  }

  const deletedUser = await dbService.findOneAndDelete({
    model: userModel,
    filter: {
      _id: userId,
    },
  });
  return deletedUser
    ? successResponse({
        res,
        statusCode: 200,
        message: "Profile deleted succeefully",
        data: { user: deletedUser },
      })
    : next(new Error("Invalid Account"));
};
