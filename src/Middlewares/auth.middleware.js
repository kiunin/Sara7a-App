import * as dbService from "../DB/dbSerivce.js";
import userModel from "../DB/Models/user.model.js";
import { getSignature, verifyToken } from "../Utils/Tokens/token.utils.js";
import tokenModel from "../DB/Models/token.model.js";

export const tokenTypeEnum = {
  ACCESS: "ACCESS",
  REFRESH: "REFRESH",
};

export const decodedToken = async ({
  authorization,
  tokenType = tokenTypeEnum.ACCESS,
  next,
} = {}) => {
  const [bearer, token] = authorization.split(" ");
  if (!bearer || !token)
    return next(new Error("Invalid token", { cause: 400 }));
  let signature = await getSignature({ signatureLevel: bearer });

  const decoded = verifyToken({
    token,
    secretKey:
      tokenType === tokenTypeEnum.ACCESS
        ? signature.accessSignature
        : signature.refreshSignature,
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
  if (!user) return next(new Error("Account Not Registered", { cause: 404 }));
  return { user, decoded };
};

export const authentication = ({ tokenType = tokenTypeEnum.ACCESS } = {}) => {
  return async (req, res, next) => {
    const { user, decoded } =
      (await decodedToken({
        authorization: req.headers.authorization,
        tokenType,
        next,
      })) || {};
    req.user = user;
    req.decoded = decoded;
    return next();
  };
};

export const authorization = ({ accessRoles = [] } = {}) => {
  return (req, res, next) => {
    if (!accessRoles.includes(req.user.role))
      return next(new Error("Unauthorized Access", { cause: 403 }));
    return next();
  };
};
