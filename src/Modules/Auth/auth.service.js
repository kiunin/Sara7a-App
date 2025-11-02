import userModel, { providerEnum } from "../../DB/Models/user.model.js";
import { successResponse } from "../../Utils/successResponse.utils.js";
import * as dbService from "../../DB/dbSerivce.js";
import { asymmetricEncrypt } from "../../Utils/Encryption/encryption.utils.js";
import { hash, compare } from "../../Utils/Hashing/hashing.utils.js";
import eventEmitter from "../../Utils/Events/email.events.utils.js";
import { customAlphabet } from "nanoid";
import { generateToken, verifyToken } from "../../Utils/Tokens/token.utils.js";
import { v4 as uuid } from "uuid";
import tokenModel from "../../DB/Models/token.model.js";
import { OAuth2Client } from "google-auth-library";

export const signup = async (req, res, next) => {
  const { firstName, lastName, email, password, gender, phone } = req.body;

  const checkUser = await dbService.findOne({
    model: userModel,
    filter: { email },
  });
  if (checkUser) return next(new Error("User already exists", { cause: 409 }));
  const otp = customAlphabet("0123456789qwearszdtxfcgyvbhunjimoklp", 6)();
  const user = await dbService.create({
    model: userModel,
    data: [
      {
        firstName,
        lastName,
        email,
        password: await hash({ plainText: password }),
        gender,
        phone: asymmetricEncrypt(phone),
        confirmEmailOtp: await hash({ plainText: otp }),
        confirmEmailOtpCreatedAt: new Date(),
      },
    ],
  });
  eventEmitter.emit("confirmEmail", { to: email, otp, firstName });
  return successResponse({
    res,
    statusCode: 201,
    message: "User created successfully",
    data: { user },
  });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const checkUser = await dbService.findOne({
    model: userModel,
    filter: { email },
  });
  if (!checkUser) return next(new Error("User not found", { cause: 404 }));
  if (!(await compare({ plainText: password, hash: checkUser.password })))
    return next(new Error("Invalid Email or password", { cause: 400 }));
  if (!checkUser.confirmEmail)
    return next(new Error("Confirm your Email", { cause: 400 }));

  const accessToken = generateToken({
    payload: { id: checkUser._id, email: checkUser.email },
    secretKey: process.env.TOKEN_ACCESS_SECRET,
    options: {
      expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN),
      issuer: "http://localhost:3000",
      audience: "http://localhost:5000",
      jwtid: uuid(),
    },
  });

  const refreshToken = generateToken({
    payload: { id: checkUser._id, email: checkUser.email },
    secretKey: process.env.TOKEN_REFRESH_SECRET,
    options: {
      expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN),
      issuer: "http://localhost:3000",
      audience: "http://localhost:5000",
      jwtid: uuid(),
    },
  });
  return successResponse({
    res,
    statusCode: 200,
    message: "User logged in successfully",
    data: { accessToken, refreshToken },
  });
};

export const confirmEmail = async (req, res, next) => {
  const { email, otp } = req.body;
  const checkUser = await dbService.findOne({
    model: userModel,
    filter: {
      email,
      confirmEmail: { $exists: false },
      confirmEmailOtp: { $exists: true },
    },
  });
  if (!checkUser)
    return next(
      new Error("User not found or email already confirmed", { cause: 404 })
    );
  //timer
  if (
    Date.now() - new Date(checkUser.confirmEmailOtpCreatedAt).getTime() >
    60 * 2 * 1000
  ) {
    const newOtp = customAlphabet("0123456789qwearszdtxfcgyvbhunjimoklp", 6)();
    eventEmitter.emit("confirmEmail", {
      to: email,
      otp: newOtp,
      firstName: checkUser.firstName,
    });
    await dbService.updateOne({
      model: userModel,
      filter: { email },
      data: {
        confirmEmailOtp: await hash({ plainText: newOtp }),
        confirmEmailOtpCreatedAt: new Date(),
        $inc: { __v: 1 },
      },
    });
    return next(new Error("OTP expired", { cause: 400 }));
  }

  if (!(await compare({ plainText: otp, hash: checkUser.confirmEmailOtp })))
    return next(new Error("Invalid OTP", { cause: 400 }));

  await dbService.updateOne({
    model: userModel,
    filter: { email },
    data: {
      confirmEmail: Date.now(),
      $unset: { confirmEmailOtp: 1, confirmEmailOtpCreatedAt: 1 },
      $inc: { __v: 1 },
    },
  });
  return successResponse({
    res,
    statusCode: 200,
    message: "Email confirmed successfully",
  });
};

export const logout = async (req, res, next) => {
  await dbService.create({
    model: tokenModel,
    data: [
      {
        jwtid: req.decoded.jti,
        expiresIn: new Date(req.decoded.exp * 1000),
        userId: req.user._id,
      },
    ],
  });
  return successResponse({
    res,
    statusCode: 200,
    message: "Logged out successfully",
  });
};

export const refreshToken = async (req, res, next) => {
  const { refreshtoken } = req.headers;
  const decoded = verifyToken({
    token: refreshtoken,
    secretKey: process.env.TOKEN_REFRESH_SECRET,
  });
  const accessToken = generateToken({
    payload: { id: decoded.id, email: decoded.email },
    secretKey: process.env.TOKEN_ACCESS_SECRET,
    options: {
      expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN),
      jwtid: uuid(),
    },
  });
  return successResponse({
    res,
    statusCode: 200,
    message: "Token refreshed successfully",
    data: { accessToken },
  });
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const otp = customAlphabet("0123456789qwearszdtxfcgyvbhunjimoklp", 6)();

  const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: { email, confirmEmail: { $exists: true } },
    data: {
      forgetPasswordOtp: await hash({ plainText: otp }),
      resetPasswordcreatedAt: new Date(),
    },
  });

  if (!user)
    return next(
      new Error("User not found or Email not Confirmed", { cause: 404 })
    );
  eventEmitter.emit("forgotPassword", {
    to: email,
    firstName: user.firstName,
    otp,
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Check Your Inbox",
  });
};

export const resetPassword = async (req, res, next) => {
  const { email, otp, password } = req.body;

  const user = await dbService.findOne({
    model: userModel,
    filter: { email, confirmEmail: { $exists: true } },
  });

  if (!user) return next(new Error("User not found", { cause: 404 }));

  if (
    Date.now() - new Date(user.resetPasswordcreatedAt).getTime() >
    60 * 2 * 1000
  ) {
    const newOtp = customAlphabet("0123456789qwearszdtxfcgyvbhunjimoklp", 6)();
    eventEmitter.emit("forgotPassword", {
      to: email,
      firstName: user.firstName,
      otp: newOtp,
    });
    await dbService.updateOne({
      model: userModel,
      filter: { email },
      data: {
        forgetPasswordOtp: await hash({ plainText: newOtp }),
        resetPasswordcreatedAt: new Date(),
      },
    });
    return next(new Error("OTP Expired", { cause: 400 }));
  }

  if (!(await compare({ plainText: otp, hash: user.forgetPasswordOtp })))
    return next(new (Error("Invalid OTP"), { cause: 400 })());

  await dbService.updateOne({
    model: userModel,
    filter: { email },
    data: {
      password: await hash({ plainText: password }),
      $unset: { forgetPasswordOtp: 1, resetPasswordcreatedAt: 1 },
      $inc: { __v: 1 },
    },
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Password Reset Successfully",
  });
};

export const updatePassword = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await dbService.findOne({
    model: userModel,
    filter: { email, confirmEmail: { $exists: true } },
  });

  if (!user) return next(new Error("User not found", { cause: 404 }));

  await dbService.updateOne({
    model: userModel,
    filter: { email },
    data: {
      password: await hash({ plainText: password }),
      $inc: { __v: 1 },
    },
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "Password Updated Successfully",
  });
};

async function verifyGoogleAccount({ idToken }) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}

export const loginWithGoogle = async (req, res, next) => {
  const { idToken } = req.body;
  const { email, email_verified, given_name, family_name, picture } =
    await verifyGoogleAccount({ idToken });

  if (!email_verified)
    return next(new Error("Email not verified", { cause: 401 }));

  const user = await dbService.findOne({
    model: userModel,
    filter: { email },
  });

  if (user) {
    if (user.provider === providerEnum.GOOGLE) {
      const accessToken = generateToken({
        payload: { id: user._id, email: user.email },
        secretKey: process.env.TOKEN_ACCESS_SECRET,
        options: {
          expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN),
          issuer: "http://localhost:3000",
          audience: "http://localhost:5000",
          jwtid: uuid(),
        },
      });

      const refreshToken = generateToken({
        payload: { id: user._id, email: user.email },
        secretKey: process.env.TOKEN_REFRESH_SECRET,
        options: {
          expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN),
          issuer: "http://localhost:3000",
          audience: "http://localhost:5000",
          jwtid: uuid(),
        },
      });
      return successResponse({
        res,
        statusCode: 200,
        message: "User logged in successfully",
        data: { accessToken, refreshToken },
      });
    }
  }

  const newUser = await dbService.create({
    model: userModel,
    data: [
      {
        email,
        firstName: given_name,
        lastName: family_name,
        avatar: picture,
        provider: providerEnum.GOOGLE,
        confirmEmail: Date.now(),
      },
    ],
  });
  const accessToken = generateToken({
    payload: { id: newUser._id, email: newUser.email },
    secretKey: process.env.TOKEN_ACCESS_SECRET,
    options: {
      expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN),
      issuer: "http://localhost:3000",
      audience: "http://localhost:5000",
      jwtid: uuid(),
    },
  });

  const refreshToken = generateToken({
    payload: { id: newUser._id, email: newUser.email },
    secretKey: process.env.TOKEN_REFRESH_SECRET,
    options: {
      expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN),
      issuer: "http://localhost:3000",
      audience: "http://localhost:5000",
      jwtid: uuid(),
    },
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "User created successfully",
    data: { accessToken, refreshToken },
  });
};
