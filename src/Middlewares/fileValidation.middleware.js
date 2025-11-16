import { fileTypeFromBuffer } from "file-type";
import fs from "node:fs";
import { fileValidation } from "../Utils/multer/local.multer.js";

export const fileValidationMiddleware = async (req, res, next) => {
  try {
    const filePath = req.file.path;
    const buffer = await fs.readFileSync(filePath);
    const type = await fileTypeFromBuffer(buffer);
    let allowedValues = Object.values(fileValidation).flat();
    if (!type || !allowedValues.includes(type.mime)) {
      return next(new Error("Invalid file type"));
    }
    return next();
  } catch (error) {
    return next(error);
  }
};
