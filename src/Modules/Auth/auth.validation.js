import joi from "joi";

import { generalFields } from "../../Middlewares/validation.middleware.js";
import { roleEnum } from "../../DB/Models/user.model.js";

export const signupSchema = {
  body: joi.object({
    firstName: generalFields.firstName.required(),
    lastName: generalFields.lastName.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmPassword: generalFields.confirmPassword,
    gender: generalFields.gender,
    phone: generalFields.phone,
    role: joi.string().valid("USER", "ADMIN").default(roleEnum.USER),
  }),
};

export const loginSchema = {
  body: joi.object({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
  }),
};

export const confirmEmailSchema = {
  body: joi.object({
    email: generalFields.email.required(),
    otp: generalFields.otp.required(),
  }),
};

export const forgotPasswordSchema = {
  body: joi.object({
    email: generalFields.email.required(),
  }),
};

export const resetPasswordSchema = {
  body: joi.object({
    email: generalFields.email.required(),
    otp: generalFields.otp.required(),
    password: generalFields.password.required(),
    confirmPassword: generalFields.confirmPassword,
  }),
};

export const updatePasswordSchema = {
  body: joi.object({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    confirmPassword: generalFields.confirmPassword,
  }),
};
