import multer from "multer";
import { BadRequestError } from "../errors/index.js";
import { MAX_SIZE_CAP } from "../constants/media.constants.js";
import { validateFile } from "../utils/media/media.validators.js";
import { normalizeFiles } from "../utils/media/media.normalizers.js";

/**
 * Shared in-memory multer storage engine.
 *
 * Purpose:
 * - Stores uploaded files in RAM as Buffer objects
 * - Enables immediate validation, transformation, or cloud upload
 * - Avoids temporary disk writes
 *
 * Best for:
 * - Cloudinary/S3 uploads
 * - Validation pipelines
 * - Media processing
 *
 * Warning:
 * Large uploads increase memory usage.
 */
const storage = multer.memoryStorage();

/**
 * Base multer uploader instance.
 *
 * Configuration:
 * - Uses memory storage
 * - Enforces global maximum file size cap
 *
 * Security:
 * - Prevents oversized uploads
 * - Centralizes upload constraints
 *
 * @type {multer.Multer}
 */
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_SIZE_CAP
  }
});


/**
 * Detects whether the incoming request is multipart/form-data.
 *
 * Purpose:
 * - Prevents multer from running on non-file requests
 * - Allows standard JSON/form routes to bypass upload parsing
 *
 * @param {import("express").Request} req
 * Express request object
 *
 * @returns {boolean}
 * True if request is multipart/form-data
 */
const isMultipart = (req) =>
  (req.headers["content-type"] || "")
    .toLowerCase()
    .startsWith("multipart/form-data");

/**
 * Creates configurable multipart file upload middleware with:
 * - Dynamic field definitions
 * - Multer parsing
 * - File validation
 * - File normalization
 * - Required field enforcement
 * - Structured media output
 *
 * =========================================================
 * SYSTEM PURPOSE
 * =========================================================
 * Provides a centralized upload pipeline for handling
 * multi-field file uploads safely and consistently.
 *
 * This middleware:
 * - Detects multipart requests
 * - Dynamically configures multer fields
 * - Parses uploads into memory
 * - Validates each file using field rules
 * - Normalizes files into internal structure
 * - Enforces required fields
 * - Outputs sanitized result to req.media
 *
 * =========================================================
 * OUTPUT STRUCTURE
 * =========================================================
 * req.media = {
 *   avatar: [
 *     {
 *       buffer,
 *       mimeType,
 *       size,
 *       originalName
 *     }
 *   ],
 *   gallery: [...]
 * }
 *
 * =========================================================
 * EXECUTION FLOW
 * =========================================================
 * 1. Skip if request is not multipart/form-data
 * 2. Build multer field parser config
 * 3. Parse files into memory
 * 4. Validate each file using validateFile()
 * 5. Normalize files using normalizeFiles()
 * 6. Enforce required fields
 * 7. Attach structured output to req.media
 *
 * =========================================================
 * FIELD CONFIG STRUCTURE
 * =========================================================
 * {
 *   name: string,          // multer field name
 *   maxCount?: number,     // maximum number of files
 *   required?: boolean,    // whether field is mandatory
 *   maxSize?: number,      // optional size override
 *   types?: string[]       // allowed MIME types
 * }
 *
 * =========================================================
 * VALIDATION LAYERS
 * =========================================================
 * - Global multer max file size
 * - Field-specific max file size
 * - MIME type restrictions
 * - Required field enforcement
 *
 * =========================================================
 * DESIGN BENEFITS
 * =========================================================
 * - Centralized upload control
 * - Multi-field support
 * - Security hardening
 * - Cloud upload readiness
 * - Standardized media structure
 * - Extensible validation model
 *
 * =========================================================
 * @param {Object} options
 * Upload middleware configuration
 *
 * @param {Array<Object>} [options.fields=[]]
 * Array of field upload definitions
 *
 * @returns {Function}
 * Express middleware
 *
 * @throws {BadRequestError}
 * - Missing required field
 * - Invalid MIME type
 * - Oversized file
 * - Validation failure
 *
 * @example
 * createUpload({
 *   fields: [
 *     {
 *       name: "avatar",
 *       maxCount: 1,
 *       required: true,
 *       types: ["image/jpeg", "image/png"],
 *       maxSize: 5 * 1024 * 1024
 *     },
 *     {
 *       name: "gallery",
 *       maxCount: 10,
 *       types: ["image/jpeg", "image/png"]
 *     }
 *   ]
 * });
 */

export const createUpload = ({ fields = [] } = {}) => {
  return (req, res, next) => {
    if (!isMultipart(req)) return next();

    const multerFields = fields.map((f) => ({
      name: f.name,
      maxCount: f.maxCount ?? 10
    }));

    upload.fields(multerFields)(req, res, (err) => {
      if (err) return next(err);

      req.media = {};

      try {
        for (const field of fields) {
          const rawFiles = req.files?.[field.name] || [];

          const normalized = [];

          for (const file of rawFiles) {
            validateFile(file, field);
            normalized.push(file);
          }

          const finalFiles = normalizeFiles(normalized);

          if (field.required && finalFiles.length === 0) {
            throw new BadRequestError(`${field.name} is required`);
          }

          req.media[field.name] = finalFiles;
        }

        next();
      } catch (e) {
        next(e);
      }
    });
  };
};