import Joi from "joi"
import { objectId } from "../../../validationSchemas/mongodb.schemas.js";

/* =========================================================
   🔹 PARAMS: /:id (GET, PATCH, DELETE)
========================================================= */
export const mediaFileIdSchema = Joi.object({
  id: Joi.string().custom(objectId).required()
});

/* =========================================================
   🔹 QUERY: GET / (pagination + filters)
========================================================= */
export const getAllMediaFilesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  mimeType: Joi.string().optional(),
  format: Joi.string().optional()
});

/* =========================================================
   🔹 BODY: POST / (create media file)
   (file comes from multer, so no body validation needed)
========================================================= */
export const createMediaFileSchema = Joi.object({});


/* =========================================================
   🔹 BODY: POST /bulk-delete
========================================================= */
export const bulkDeleteSchema = Joi.object({
  ids: Joi.array()
    .items(Joi.string().custom(objectId))
    .min(1)
    .max(100)
    .required()
});