import express from "express";
const router = express.Router();

import {
  createProductSeller,
  getAllProductSellers,
  getProductSellerById,
  updateProductSeller,
  deleteProductSeller,
  bulkDeleteProductSellers
} from "./seller.controller.js";

import { validate } from "../../../middlewares/validate.middleware.js";
import {
  createProductSellerSchema,
  updateProductSellerSchema,
  productSellerIdParamSchema,
  bulkDeleteProductSellerSchema
} from "./seller.validation.js";

import { upload } from "../../../middlewares/multer.middleware.js";
import { parseMedia, strictMediaContext } from "../../../middlewares/media.middlware.js";

// ----------------------
// BULK DELETE
// ----------------------
router.post(
  "/bulk-delete",
  validate(bulkDeleteProductSellerSchema),
  bulkDeleteProductSellers
);

// ----------------------
// CREATE
// ----------------------
router.post(
  "/",
  upload.single("file"),
  parseMedia("file", {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"]
  }),
  strictMediaContext({
    entity: "productSeller",
    usageType: "shopLogo",
    namespace: "productSeller"
  }),
  validate(createProductSellerSchema),
  createProductSeller
);

// ----------------------
// GET ALL
// ----------------------
router.get("/", getAllProductSellers);

// ----------------------
// GET ONE
// ----------------------
router.get(
  "/:id",
  validate(productSellerIdParamSchema, "params"),
  getProductSellerById
);

// ----------------------
// UPDATE
// ----------------------
router.put(
  "/:id",
  upload.single("file"),
  parseMedia("file", {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"]
  }),
  strictMediaContext({
    entity: "productSeller",
    usageType: "shopLogo",
    namespace: "productSeller"
  }),
  validate(productSellerIdParamSchema, "params"),
  validate(updateProductSellerSchema),
  updateProductSeller
);

// ----------------------
// DELETE
// ----------------------
router.delete(
  "/:id",
  validate(productSellerIdParamSchema, "params"),
  deleteProductSeller
);

export default router;