import { fileTypeFromBuffer } from "file-type";
import { promises as fs } from "node:fs";
import { fileValidation } from "../Utils/multer/local.multer.js";

export const fileValidationMiddleware = async (req, res, next) => {
  try {
    const file = req.file || (req.files && req.files[0]);

    if (!file) {
      return next(new Error("No file uploaded", { cause: 400 }));
    }

    const buffer = await fs.readFile(file.path);
    const type = await fileTypeFromBuffer(buffer);

    const allowedValues = Object.values(fileValidation).flat();

    if (!type || !allowedValues.includes(type.mime)) {
      return next(new Error("Invalid file type", { cause: 400 }));
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
