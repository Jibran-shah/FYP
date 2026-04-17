import express from "express";
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
import { optionalUpload} from "../../../middlewares/multer.middleware.js";
import { parseMedia, strictMediaContext } from "../../../middlewares/media.middlware.js";
import { protect } from "../../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";


const router = express.Router();
router.use(protect())

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
  async(req, res, next) => {
    console.log("HEADERS:", req.headers["content-type"]);
    next();
  },
  optionalUpload("file"),
    async(req, res, next) => {
    console.log("afte multer");
  next();
  }
  ,
  parseMedia("file", {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"]
  }),
  async(req, res, next) => {
    console.log("after parse Media");
    next();
  },
  strictMediaContext({
    entity: "productSeller",
    usageType: "shopLogo",
    namespace: "productSeller"
  }),
  async(req, res, next) => {
  console.log("after Strict Media");
  next();
  },
  validate(createProductSellerSchema),
  asyncHandler(createProductSeller)
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
  optionalUpload("file"),
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