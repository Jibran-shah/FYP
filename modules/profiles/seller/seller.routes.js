import express from "express";
import { createUpload } from "../../../middlewares/upload.middleware.js";
import { mediaContext } from "../../../middlewares/mediaContext.middlware.js";

import {
  createProductSeller,
  getAllProductSellers,
  getProductSellerById,
  updateProductSeller,
  deleteProductSeller,
  bulkDeleteProductSellers,
  getMySellerProfile,
  deleteProductSellerAdmin
} from "./seller.controller.js";

import { validate } from "../../../middlewares/validate.middleware.js";
import {
  createProductSellerSchema,
  updateProductSellerSchema,
  productSellerIdParamSchema,
  bulkDeleteProductSellerSchema,
  getAllProductSellerQuerySchema
} from "./seller.validation.js";

import { protect, restrictTo } from "../../../middlewares/protect.middleware.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { USER_ROLES } from "../../../constants/user.constants.js";
import { MEDIA_USAGE_TYPES, NAMESPACES } from "../../../constants/media.constants.js";

const router = express.Router();

/* =========================================================
   BULK DELETE
========================================================= */
router.post(
  "/bulk-delete",
  protect(),
  restrictTo(USER_ROLES.ADMIN),
  validate(bulkDeleteProductSellerSchema),
  asyncHandler(bulkDeleteProductSellers)
);

/* =========================================================
   CREATE SELLER (WITH MEDIA CONTEXT)
========================================================= */
router.post(
  "/",
  protect({ requireBaseProfile: true }),

  // 1. FILE UPLOAD
  createUpload({
    fields: [
      {
        name: "shopLogoFile",
        maxCount: 1,
        required: false
      }
    ]
  }),

  // 2. MEDIA CONTEXT (IMPORTANT)
  mediaContext({
    fields: {
      shopLogoFile: {
        namespace: NAMESPACES.SELLER_LOGO,
        usageType: MEDIA_USAGE_TYPES.SHOP_LOGO
      }
    }
  }),

  // 3. VALIDATION
  validate(createProductSellerSchema),

  // 4. CONTROLLER
  asyncHandler(createProductSeller)
);

/* =========================================================
   GET ALL
========================================================= */
router.get(
  "/",
  validate(getAllProductSellerQuerySchema, "query"),
  asyncHandler(getAllProductSellers)
);

/* =========================================================
   GET MY PROFILE
========================================================= */
router.get(
  "/me",
  protect({ requireProductSellerProfile: true }),
  asyncHandler(getMySellerProfile)
);

/* =========================================================
   GET BY ID
========================================================= */
router.get(
  "/:id",
  validate(productSellerIdParamSchema, "params"),
  asyncHandler(getProductSellerById)
);

/* =========================================================
   UPDATE SELLER (WITH MEDIA CONTEXT)
========================================================= */
router.put(
  "/:id",
  protect(),

  // 1. FILE UPLOAD
  createUpload({
    fields: [
      {
        name: "shopLogoFile",
        maxCount: 1,
        required: false
      }
    ]
  }),

  // 2. MEDIA CONTEXT
  mediaContext({
    fields: {
      shopLogoFile: {
        namespace: NAMESPACES.SELLER_LOGO,
        usageType: MEDIA_USAGE_TYPES.SHOP_LOGO
      }
    }
  }),

  validate(productSellerIdParamSchema, "params"),
  validate(updateProductSellerSchema, "body"),

  asyncHandler(updateProductSeller)
);

/* =========================================================
   DELETE SELLER
========================================================= */
router.delete(
  "/",
  protect(),
  asyncHandler(deleteProductSeller)
);

/* =========================================================
   DELETE SELLER
========================================================= */
router.delete(
  "/admin/:id",
  protect({requireBaseProfile:true}),
  restrictTo("admin"),
  validate(productSellerIdParamSchema,"params"),
  asyncHandler(deleteProductSellerAdmin)
);

export default router;