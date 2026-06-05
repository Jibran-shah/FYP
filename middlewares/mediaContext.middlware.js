import { BadRequestError } from "../errors/index.js";

/**
 * Creates middleware that generates structured per-file media upload context
 * for multi-field multer uploads.
 *
 * This middleware:
 * - Resolves the media owner from req.user, req.params, or req.body
 * - Processes all uploaded multer fields dynamically
 * - Generates context per field
 * - Stores result in req.mediaContext
 *
 * Result structure:
 * req.mediaContext = {
 *   fieldName: {
 *     usageType: string,
 *     namespace: string,
 *     owner: string
 *   }
 * }
 *
 * @param {Object} options - Media context configuration
 * @param {Object.<string, {usageType: string, namespace: string}>} options.fields
 * Field-level configuration keyed by multer field name.
 *
 * Example:
 * {
 *   avatar: { usageType: "profile", namespace: "users" },
 *   cover: { usageType: "banner", namespace: "users" }
 * }
 *
 * @param {"user"|"params"|"body"} [options.ownerFrom="user"]
 * Source location for owner identifier.
 *
 * @param {string} [options.ownerField="id"]
 * Property name used to resolve owner from selected source.
 *
 * @returns {Function}
 * Express middleware that attaches structured media context to req.mediaContext
 *
 * @throws {BadRequestError}
 * If owner cannot be resolved.
 *
 * @example
 * router.post(
 *   "/profile",
 *   auth(),
 *   upload.fields([
 *     { name: "avatar", maxCount: 1 },
 *     { name: "cover", maxCount: 1 }
 *   ]),
 *   mediaContext({
 *     fields: {
 *       avatar: { usageType: "profile", namespace: "users" },
 *       cover: { usageType: "banner", namespace: "users" }
 *     }
 *   }),
 *   controller
 * );
 */

export const mediaContext = ({
  fields = {}, // { avatar: { usageType, namespace }, cover: { usageType, namespace } }
  ownerFrom = "user",
  ownerField = "id",
}) => {
  return (req, res, next) => {
    try {
      let owner = null;

      if (ownerFrom === "user") {
        owner = req.user?.[ownerField];
      } else if (ownerFrom === "params") {
        owner = req.params?.[ownerField];
      } else if (ownerFrom === "body") {
        owner = req.body?.[ownerField];
      }

      if (!owner) {
        return next(new BadRequestError("Media context owner not found"));
      }

      /* =========================================
         Validate multer files
      ========================================= */
      if (!req.files || typeof req.files !== "object") {
        req.mediaContext = {};
        return next();
      }

      /* =========================================
         Build per-field context
      ========================================= */
      req.mediaContext = {};

      for (const fieldName of Object.keys(req.files)) {
        const fieldConfig = fields[fieldName];

        if (!fieldConfig) {
          continue; // Skip unknown fields
        }

        req.mediaContext[fieldName] = {
          usageType: fieldConfig.usageType,
          namespace: fieldConfig.namespace,
          owner,
        };
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};