import express from "express";
import * as categoryController from "./categories.controller.js";

import { protect, restrictTo } from "../../middlewares/protect.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  createCategorySchema,
  updateCategorySchema,
  idParamSchema,
  categoryTreeQuerySchema,
  categoryQuerySchema
} from "./categories.validation.js";

const router = express.Router();

/* ======================
   AUTH PROTECTION
====================== */
router.use(protect({requireBaseProfile:true}));

/* ======================
   CREATE CATEGORY
====================== */
router.post(
  "/",
  restrictTo("admin"),
  validate(createCategorySchema),
  asyncHandler(categoryController.createCategory)
);

/* ======================
   GET ALL CATEGORIES
====================== */
router.get(
  "/",
  validate(categoryQuerySchema),
  asyncHandler(categoryController.getCategories,"query")
);


router.get(
  "/tree",
  validate(categoryTreeQuerySchema,"query"),
  asyncHandler(categoryController.getCategoryTree)
);

/* ======================
   GET BY ID
====================== */
router.get(
  "/:id",
  validate(idParamSchema, "params"),
  asyncHandler(categoryController.getCategoryById)
);

/* ======================
   UPDATE CATEGORY
====================== */
router.patch(
  "/:id",
  restrictTo("admin"),
  validate(updateCategorySchema),
  asyncHandler(categoryController.updateCategory)
);

/* ======================
   DELETE CATEGORY
====================== */
router.delete(
  "/:id",
  restrictTo("admin"),
  validate(idParamSchema, "params"),
  asyncHandler(categoryController.deleteCategory)
);

export default router;