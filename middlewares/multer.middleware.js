import multer from "multer";
import { BadRequestError } from "../errors/index.js";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  }
});

// ✅ Helper to check multipart
const isMultipart = (req) => {
  const type = req.headers["content-type"];
  return type && type.startsWith("multipart/form-data");
};

// --------------------------------------------------
// 🔴 STRICT: Must be multipart/form-data
// --------------------------------------------------
export const requireUpload = (fieldName = "file") => {
  return (req, res, next) => {
    if (!isMultipart(req)) {
      return next(
        new BadRequestError("Content-Type must be multipart/form-data")
      );
    }

    return upload.single(fieldName)(req, res, next);
  };
};

// --------------------------------------------------
// 🟢 OPTIONAL: Only run multer if multipart
// --------------------------------------------------
export const optionalUpload = (field = "file") => {
  return (req, res, next) => {
    if (!isMultipart(req)) {
      return next(); // skip multer COMPLETELY
    }

    upload.single(field)(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  };
};