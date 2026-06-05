import { BadRequestError } from "../../errors/index.js";
import { MAX_SIZE_CAP } from "../../constants/media.constants.js";


/**
 * Validates a single uploaded file against field-specific constraints.
 *
 * Validation checks:
 * - MIME type whitelist
 * - Maximum file size
 *
 * Purpose:
 * - Enforces upload security
 * - Prevents invalid formats
 * - Blocks oversized uploads
 * - Supports field-level restrictions
 *
 * Validation priority:
 * 1. Allowed MIME types
 * 2. File size cap
 *
 * Field config options:
 * - types: Allowed MIME types
 * - maxSize: Field-specific max file size
 *
 * Fallback:
 * - Uses global MAX_SIZE_CAP if maxSize not provided
 *
 * @param {Express.Multer.File} file
 * Raw multer file object
 *
 * @param {Object} field
 * Field upload configuration
 *
 * @param {string} field.name
 * Field identifier
 *
 * @param {string[]} [field.types=[]]
 * Allowed MIME types
 *
 * @param {number} [field.maxSize]
 * Maximum allowed size in bytes
 *
 * @throws {BadRequestError}
 * - Invalid MIME type
 * - File exceeds size limit
 *
 * @example
 * validateFile(file, {
 *   name: "avatar",
 *   types: ["image/jpeg", "image/png"],
 *   maxSize: 5 * 1024 * 1024
 * });
 */

export const validateFile = (file, field) => {
  const maxSize = field.maxSize ?? MAX_SIZE_CAP;
  const types = field.types || [];

  if (types.length && !types.includes(file.mimetype)) {
    throw new BadRequestError(
      `Invalid file type in "${field.name}": ${file.mimetype}`
    );
  }

  if (file.size > maxSize) {
    throw new BadRequestError(
      `File too large in "${field.name}". Max ${Math.round(
        maxSize / (1024 * 1024)
      )}MB`
    );
  }
};