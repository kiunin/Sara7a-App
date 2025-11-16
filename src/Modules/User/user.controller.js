import { Router } from "express";
import * as userService from "./user.service.js";
import {
  authentication,
  authorization,
} from "../../Middlewares/auth.middleware.js";
import { tokenTypeEnum } from "../../Utils/Tokens/token.utils.js";
import {
  fileValidation,
  localFileUpload,
} from "../../Utils/multer/local.multer.js";

import { validation } from "../../Middlewares/validation.middleware.js";
import { profileImageSchema, profileCoverSchema } from "./user.validation.js";
import { fileValidationMiddleware } from "../../Middlewares/fileValidation.middleware.js";
import { cloudFileUpload } from "../../Utils/multer/cloud.multer.js";

const router = Router();

router.get("/", userService.listAllUsers);

router.patch(
  "/update",
  authentication({ tokenType: tokenTypeEnum.ACCESS }),
  authorization({ accessRoles: ["USER"] }),
  userService.updateProfile
);

router.patch(
  "/profile-image",
  authentication({ tokenType: tokenTypeEnum.ACCESS }),
  authorization({ accessRoles: ["USER"] }),
  localFileUpload({
    customPath: "User",
    validation: fileValidation.images,
  }).single("profileImage"),
  fileValidationMiddleware,
  validation(profileImageSchema),
  userService.updateProfileImage
);

router.patch(
  "/cloud-profile-image",
  authentication({ tokenType: tokenTypeEnum.ACCESS }),
  authorization({ accessRoles: ["USER"] }),
  cloudFileUpload({
    validation: fileValidation.images,
  }).single("profileImage"),
  fileValidationMiddleware,
  userService.updateCloudProfileImage
);

router.patch(
  "/cover-image",
  authentication({ tokenType: tokenTypeEnum.ACCESS }),
  authorization({ accessRoles: ["USER"] }),
  localFileUpload({
    customPath: "User",
    validation: fileValidation.images,
  }).array("coverImage", 4),
  fileValidationMiddleware,
  validation(profileCoverSchema),
  userService.updateCoverImage
);

router.patch(
  "/cloud-cover-image",
  authentication({ tokenType: tokenTypeEnum.ACCESS }),
  authorization({ accessRoles: ["USER"] }),
  cloudFileUpload({
    validation: fileValidation.images,
  }).array("coverImage", 4),
  fileValidationMiddleware,
  userService.updateCloudCoverImage
);

export default router;
