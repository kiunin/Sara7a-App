import { Router } from "express";
import * as userService from "./user.service.js";
import { authentication } from "../../Middlewares/auth.middleware.js";
import { localFileUpload } from "../../Utils/multer/local.multer.js";

const router = Router();

router.get("/", userService.listAllUsers);
router.patch("/update", authentication, userService.updateProfile);
router.patch(
  "/profile-image",
  authentication,
  localFileUpload().single("profileImage"),
  userService.updateProfileImage
);

export default router;
