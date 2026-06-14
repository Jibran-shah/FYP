import {
  createReviewService,
  getAllReviewsService,
  getReviewByIdService,
  getEntityReviewsService,
  updateReviewService,
  deleteReviewService,
  getMyReviewsService
} from "./reviews.service.js";
import {asyncHandler} from "../../utils/asyncHandler.js"

/* =========================================================
   CREATE REVIEW
========================================================= */
export const createReview = asyncHandler(async (req, res) => {
  const review = await createReviewService({
    userId: req.user.id,
    ...req.body
  });

  res.status(201).json({
    success: true,
    message: "Review created successfully",
    review
  });
});


/* =========================================================
   GET ALL REVIEWS
========================================================= */
export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await getAllReviewsService(req.query);

  res.status(200).json({
    success: true,
    count: reviews.length,
    reviews
  });
});


/* =========================================================
   GET SINGLE REVIEW
========================================================= */
export const getReviewById = asyncHandler(async (req, res) => {
  const review = await getReviewByIdService(req.params.id);

  res.status(200).json({
    success: true,
    review
  });
});


/* =========================================================
   GET REVIEWS FOR ENTITY
========================================================= */
export const getEntityReviews = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;

  const {own,others,meta} = await getEntityReviewsService({
    entityType,
    entityId,
    query: req.validated?.query,
    userId:req.user?.id
  });

  res.status(200).json({
    success: true,
    count: others.length+(own?1:0),
    data:{
      own,
      others,
      meta
    }
  });
});


/* =========================================================
   GET MY REVIEWS
========================================================= */
export const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await getMyReviewsService(req.user.userId);

  res.status(200).json({
    success: true,
    count: reviews.length,
    reviews
  });
});


/* =========================================================
   UPDATE REVIEW
========================================================= */
export const updateReview = asyncHandler(async (req, res) => {
  const updatedReview = await updateReviewService({
    reviewId: req.params.id,
    userId: req.user?.id,
    updateData: req.body
  });

  res.status(200).json({
    success: true,
    message: "Review updated successfully",
    review: updatedReview
  });
});


/* =========================================================
   DELETE REVIEW
========================================================= */
export const deleteReview = asyncHandler(async (req, res) => {
  await deleteReviewService({
    reviewId: req.params.id,
    userId: req.user.userId
  });

  res.status(200).json({
    success: true,
    message: "Review deleted successfully"
  });
});