import express from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as productController from "./products.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";

import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  idParamSchema
} from "./products.validation.js";

const router = express.Router();

router.use(protect())

router.post(
  "/",
  validate(createProductSchema),
  asyncHandler(productController.createProduct)
);

router.get(
  "/",
  validate(productQuerySchema,"query"),
  asyncHandler(productController.getProducts)
);

router.get(
  "/seller/me",
  asyncHandler(productController.getProductsBySeller)
);

router.get(
  "/category/:categoryId",
  asyncHandler(productController.getByCategory)
);

router.get(
  "/:id",
  validate(idParamSchema,"params"),
  asyncHandler(productController.getProductById)
);

router.patch(
  "/:id",
  validate(idParamSchema,"params"),
  validate(updateProductSchema,"body"),
  asyncHandler(productController.updateProduct)
);

router.delete(
  "/:id",
  validate(idParamSchema,"param"),
  asyncHandler(productController.deleteProduct)
);

export default router;