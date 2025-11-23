import multer from "multer";

export const cloudFileUpload = ({ validation = [] }) => {
  const storage = multer.memoryStorage();

  const fileFilter = (req, file, cb) => {
    if (validation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid File Type"), false);
    }
  };

  return multer({ fileFilter, storage, limits: { fileSize: 1024 * 1024 * 5 } });
};
