import joi from "joi";
import { genderEnum } from "../DB/Models/user.model.js";
import { Types } from "mongoose";

export const validation = (schema) => {
  return (req, res, next) => {
    const validationErrors = [];
    for (const key of Object.keys(schema)) {
      const validationResult = schema[key].validate(req[key], {
        abortEarly: false,
      });
      if (validationResult.error) {
        validationErrors.push({ key, details: validationResult.error.details });
      }
      if (validationErrors.length)
        return res
          .status(400)
          .json({ message: "Validation Error", details: validationErrors });
    }
    return next();
  };
};

export const generalFields = {
  firstName: joi.string().min(2).max(20),
  lastName: joi.string().min(2).max(20),
  email: joi.string().email({
    minDomainSegments: 2,
    maxDomainSegments: 5,
    tlds: { allow: ["com", "net", "org", "io"] },
  }),
  password: joi.string(),
  confirmPassword: joi.ref("password"),
  gender: joi.string().valid(...Object.values(genderEnum)),
  phone: joi.string().pattern(new RegExp(/^01[0125][0-8]{8}$/)),
  otp: joi.string(),
  id: joi.string().custom((value, helper) => {
    return (
      Types.ObjectId.isValid(value) || helper.message("Invalid objectId format")
    );
  }),
};
