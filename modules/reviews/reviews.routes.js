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
import { asyncHandler } from "../../utils/asyncHandler.js";

const router = express.Router();

// Create a new review
router.post(
   "/", 
   protect({ requireBaseProfile: true }),
   validate(createReviewSchema),
   asyncHandler(createReview)
);

// Get logged-in user's reviews
router.get(
   "/me", 
   protect({ requireBaseProfile: true }), 
   asyncHandler(getMyReviews)
);

// Get all reviews (optional admin/filter support later)
router.get(
   "/",
   validate(reviewQuerySchema), 
   asyncHandler(getAllReviews)
);

// Get reviews for specific entity
router.get(
   "/entity/:entityType/:entityId", 
   protect(),
   validate(entityReviewParamsSchema,"params"), 
   validate(reviewQuerySchema,"query"), 
   asyncHandler(getEntityReviews)
);

// Get single review by review ID
router.get("/:id",
   validate(reviewIdParamSchema,"params"), 
   asyncHandler(getReviewById)
);

// Update own review
router.patch(
   "/:id", 
   protect({ requireBaseProfile: true }), 
   validate(reviewIdParamSchema,"params"), 
   validate(updateReviewSchema), 
   asyncHandler(updateReview)
);

// Delete own review
router.delete(
   "/:id", 
   protect({ requireBaseProfile: true }),
   validate(reviewIdParamSchema,"params"), 
   asyncHandler(deleteReview)
);

export default router;