import { Router } from "express";
import * as authService from "./auth.service.js";
import { authentication } from "../../Middlewares/auth.middleware.js";
import { validation } from "../../Middlewares/validation.middleware.js";
import {
  signupSchema,
  loginSchema,
  confirmEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from "./auth.validation.js";
import { tokenTypeEnum } from "../../Utils/Tokens/token.utils.js";

const router = Router();
router.post("/signup", validation(signupSchema), authService.signup);
router.post("/login", validation(loginSchema), authService.login);
router.patch(
  "/confirm-email",
  validation(confirmEmailSchema),
  authService.confirmEmail
);
router.post(
  "/revoke-token",
  authentication({ tokenType: tokenTypeEnum.ACCESS }),
  authService.logout
);
router.post(
  "/refresh-token",
  authentication({ tokenType: tokenTypeEnum.REFRESH }),
  authService.refreshToken
);
router.patch(
  "/forgot-password",
  validation(forgotPasswordSchema),
  authService.forgotPassword
);

router.patch(
  "/reset-password",
  validation(resetPasswordSchema),
  authService.resetPassword
);

router.patch(
  "/update-password",
  authentication({ tokenType: tokenTypeEnum.ACCESS }),
  validation(updatePasswordSchema),
  authService.updatePassword
);

router.post("/social-login", authService.loginWithGoogle);
export default router;
