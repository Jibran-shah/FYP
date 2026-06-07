import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as productController from "./products.controller.js";
import { protect } from "../../middlewares/protect.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import { createUpload } from "../../middlewares/upload.middleware.js";
import { mediaContext } from "../../middlewares/mediaContext.middlware.js";

import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  idParamSchema
} from "./products.validation.js";

const router = express.Router();

/* =========================================================
   CREATE PRODUCT
========================================================= */
router.post(
  "/",
  protect({ requireProductSellerProfile: true }),

  /* =========================
     FILE UPLOAD
  ========================= */
  createUpload({
    fields: [
      {
        name: "images",
        maxCount: 10,
        required: false
      }
    ]
  }),

  /* =========================
     MEDIA CONTEXT (NEW SYSTEM)
  ========================= */
  mediaContext({
    ownerFrom: "user", // explicitly enforced
    fields: {
      images: {
        namespace: "PRODUCT",
        usageType: "PRODUCT_IMAGE"
      }
    }
  }),

  validate(createProductSchema),
  asyncHandler(productController.createProduct)
);

/* =========================================================
   GET ALL PRODUCTS
========================================================= */
router.get(
  "/",
  validate(productQuerySchema, "query"),
  asyncHandler(productController.getProducts)
);

/* =========================================================
   MY PRODUCTS
========================================================= */
router.get(
  "/seller/me",
  protect({ requireProductSellerProfile: true }),
  asyncHandler(productController.getProductsBySeller)
);

/* =========================================================
   BY CATEGORY
========================================================= */
router.get(
  "/category/:categoryId",
  asyncHandler(productController.getByCategory)
);

/* =========================================================
   SINGLE PRODUCT
========================================================= */
router.get(
  "/:id",
  validate(idParamSchema, "params"),
  asyncHandler(productController.getProductById)
);

/* =========================================================
   UPDATE PRODUCT
========================================================= */
router.patch(
  "/:id",
  protect({ requireProductSellerProfile: true }),

  /* =========================
     FILE UPLOAD
  ========================= */
  createUpload({
    fields: [
      {
        name: "images",
        maxCount: 10,
        required: false
      }
    ]
  }),

  /* =========================
     MEDIA CONTEXT (NEW SYSTEM)
  ========================= */
  mediaContext({
    ownerFrom: "user",
    fields: {
      images: {
        namespace: "PRODUCT",
        usageType: "PRODUCT_IMAGE"
      }
    }
  }),

  validate(idParamSchema, "params"),
  validate(updateProductSchema, "body"),

  asyncHandler(productController.updateProduct)
);

/* =========================================================
   DELETE PRODUCT
========================================================= */
router.delete(
  "/:id",
  protect({ requireProductSellerProfile: true }),
  validate(idParamSchema, "params"),
  asyncHandler(productController.deleteProduct)
);

export default router;