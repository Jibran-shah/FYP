/**
 * Normalizes raw multer file objects into a standardized internal media format.
 *
 * Purpose:
 * - Removes unnecessary multer metadata
 * - Creates consistent upload structure
 * - Standardizes downstream media processing
 * - Simplifies cloud storage pipelines
 *
 * Input:
 * Raw multer file objects
 *
 * Output:
 * [
 *   {
 *     buffer,
 *     mimeType,
 *     size,
 *     originalName
 *   }
 * ]
 *
 * Standardized fields:
 * - buffer: Raw binary file data
 * - mimeType: MIME type
 * - size: File size in bytes
 * - originalName: Original uploaded filename
 *
 * @param {Array<Express.Multer.File>} [files=[]]
 * Array of multer file objects
 *
 * @returns {Array<Object>}
 * Normalized media file objects
 *
 * @example
 * normalizeFiles(req.files.avatar);
 */

export const normalizeFiles = (files = []) => {
  return files.map((file) => ({
    buffer: file.buffer,
    mimeType: file.mimetype,
    size: file.size,
    originalName: file.originalname
  }));
};