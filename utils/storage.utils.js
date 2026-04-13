import fs from "fs/promises";
import path from "path";
import { InternalServerError } from "../errors/index.js";
import crypto from "crypto";


export const uploadToStorage = async (
  fileBuffer,
  fileName,
  mimeType,
  userId = "anonymous"
) => {
  let folder = "documents";

  const safeUserId = String(userId).replace(/[^a-zA-Z0-9-_]/g, "");

  if (mimeType.startsWith("image/")) folder = "images";
  else if (mimeType.startsWith("video/")) folder = "videos";

  const fullFolderPath = path.join(
    process.cwd(),
    "uploads",
    folder,
    safeUserId
  );

  await fs.mkdir(fullFolderPath, { recursive: true });

  const filePath = path.join(fullFolderPath, fileName);
  await fs.writeFile(filePath, fileBuffer);

  return {
    storageKey: `${folder}/${safeUserId}/${fileName}`,
    url: `/uploads/${folder}/${safeUserId}/${fileName}`
  };
};



export const getFileFormat = (mimeType) => {
  return mimeType?.split("/")[1] || "unknown";
};


export const generateFileName = ({ originalName, prefix = "" }) => {
  const ext = path.extname(originalName).toLowerCase();
  const base = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9-_]/g, "_")   // stronger sanitization
    .replace(/_+/g, "_")               // collapse multiple underscores
    .slice(0, 50);                    // prevent long filenames

  return `${base}_${crypto.randomUUID()}${ext}`;
};



export const deleteFromStorage = async (storageKey) => {
  try {
    const fullPath = path.join(process.cwd(), "uploads", storageKey);

    await fs.unlink(fullPath);

    const dir = path.dirname(fullPath);
    const files = await fs.readdir(dir);

    if (files.length === 0) {
      await fs.rmdir(dir);
    }

  } catch (err) {
    if (err.code !== "ENOENT") {
      throw new InternalServerError(
        `Failed to delete file from storage: ${storageKey}`
      );
    }
  }
};