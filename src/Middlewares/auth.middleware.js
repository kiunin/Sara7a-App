import * as dbService from "../DB/dbSerivce.js";
import userModel from "../DB/Models/user.model.js";
import { verifyToken } from "../Utils/Tokens/token.utils.js";
import tokenModel from "../DB/Models/token.model.js";

export const authentication = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization)
    return next(new Error("authorization token is missing", { cause: 401 }));
  if (!authorization.startsWith(process.env.TOKEN_PREFIX))
    return next(new Error("Invalid authorization format", { cause: 400 }));

  const token = authorization.split(" ")[1];

  const decoded = verifyToken({
    token,
    secretKey: process.env.TOKEN_ACCESS_SECRET,
  });
  if (!decoded.jti) return next(new Error("Invalid token", { cause: 401 }));

  const revokedToken = await dbService.findOne({
    model: tokenModel,
    filter: { jwtid: decoded.jti },
  });
  if (revokedToken) return next(new Error("Token is revoked", { cause: 400 }));

  const user = await dbService.findById({
    model: userModel,
    id: decoded.id,
  });
  if (!user) return next(new Error("User not found", { cause: 404 }));
  req.user = user;
  req.decoded = decoded;
  next();
};
