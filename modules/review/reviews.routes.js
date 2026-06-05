import express from "express";
import {
  createReview,
  getAllReviews,
  getReviewById,
  getEntityReviews,
  updateReview,
  deleteReview,
  getMyReviews
} from "./reviews.controller.js";

import { protect } from "../../middlewares/protect.middleware.js";
import { createReviewSchema, entityReviewParamsSchema, reviewIdParamSchema, reviewQuerySchema, updateReviewSchema } from "./reviews.validation.js";
import {validate} from "../../middlewares/validate.middleware.js"

const router = express.Router();

/* =========================================================
   USER ROUTES
========================================================= */

// Create a new review
router.post("/", protect({ requireBaseProfile: true }),validate(createReviewSchema), createReview);

// Get logged-in user's reviews
router.get("/me", protect({ requireBaseProfile: true }),  getMyReviews);


/* =========================================================
   PUBLIC ROUTES
========================================================= */

// Get all reviews (optional admin/filter support later)
router.get("/",validate(reviewQuerySchema), getAllReviews);

// Get reviews for specific entity
router.get("/entity/:entityType/:entityId", validate(entityReviewParamsSchema,"params"), validate(reviewQuerySchema), getEntityReviews);

// Get single review by review ID
router.get("/:id",validate(reviewIdParamSchema,"params"), getReviewById);


/* =========================================================
   PROTECTED ROUTES
========================================================= */

// Update own review
router.patch("/:id", protect({ requireBaseProfile: true }), validate(reviewIdParamSchema,"params"), validate(updateReviewSchema), updateReview);

// Delete own review
router.delete("/:id", protect({ requireBaseProfile: true }),validate(reviewIdParamSchema,"params"), deleteReview);

export default router;