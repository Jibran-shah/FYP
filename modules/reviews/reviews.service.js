import mongoose from "mongoose";

import Review from "../../models/Review.model.js";

import {
  BadRequestError,
  NotFoundError,
  ForbiddenError
} from "../../errors/index.js";

import {
  incrementEntityRating,
  decrementEntityRating,
  updateEntityRatingOnReviewEdit
} from "./reviews.utils.js";

const reviewDeepPopulate = {
  path:"user",
  populate: {
      path:"baseProfile",
      populate:[
        { 
          path:"fullName"},
        {
          path:"profileAvatar",
          populate:{
            path:"file"}
        }
      ]
  }
}

/* =========================================================
   CREATE REVIEW
========================================================= */
export const createReviewService = async ({
  userId,
  entityId,
  entityType,
  rating,
  comment
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingReview = await Review.findOne({
      user: userId,
      entityId,
      entityType
    }).session(session);

    if (existingReview) {
      throw new BadRequestError(
        "You have already reviewed this entity"
      );
    }

    const review = await Review.create(
      [
        {
          user: userId,
          entityId,
          entityType,
          rating,
          comment
        }
      ],
      { session }
    );

    await incrementEntityRating({
      entityType,
      entityId,
      newRating: rating,
      session
    });

    await session.commitTransaction();
    session.endSession();

    return review[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


/* =========================================================
   GET ALL REVIEWS
========================================================= */
export const getAllReviewsService = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    entityType,
    rating,
    sort = "-createdAt"
  } = queryParams;

  const filter = {};

  if (entityType) filter.entityType = entityType;
  if (rating) filter.rating = Number(rating);

  return await Review.find(filter)
    .populate("user", "name profileImage")
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit));
};


/* =========================================================
   GET REVIEW BY ID
========================================================= */
export const getReviewByIdService = async (reviewId) => {
  const review = await Review.findById(reviewId)
    .populate("user", "name profileImage");

  if (!review) {
    throw new NotFoundError("Review not found");
  }

  return review;
};

export const getEntityReviewsService = async ({
  entityType,
  entityId,
  query,
  userId,
}) => {
  const {
    page = 1,
    limit = 10,
    sort = "-createdAt",
  } = query;

  const pageNum = Number(page);
  const limitNum = Number(limit);

  // Fetch current user's review separately
  let own = null;

  if (userId) {
    own = await Review.findOne({
      entityType,
      entityId,
      user: userId,
    }).populate(reviewDeepPopulate);
  }

  console.log(own);

  // Build filter for other users' reviews
  const filter = {
    entityType,
    entityId,
  };

  if (userId) {
    filter.user = { $ne: userId };
  }

  // Total reviews excluding own review
  const total = await Review.countDocuments(filter);

  const others = await Review.find(filter)
    .populate(reviewDeepPopulate)
    .sort(sort)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const pages = Math.ceil(total / limitNum);

  return {
    own,

    others,

    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages,
      hasNextPage: pageNum < pages,
      hasPrevPage: pageNum > 1,
    },
  };
};
/* =========================================================
   GET MY REVIEWS
========================================================= */
export const getMyReviewsService = async (userId) => {
  return await Review.find({ user: userId })
    .populate("entityId")
    .sort("-createdAt");
};


/* =========================================================
   UPDATE REVIEW
========================================================= */
export const updateReviewService = async ({
  reviewId,
  userId,
  updateData
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const review = await Review.findById(reviewId).session(session);

    if (!review) {
      throw new NotFoundError("Review not found");
    }

    if (review.user.toString() !== userId.toString()) {
      throw new ForbiddenError(
        "You are not allowed to update this review"
      );
    }

    const oldRating = review.rating;

    if (updateData.rating !== undefined) {
      review.rating = updateData.rating;
    }

    if (updateData.comment !== undefined) {
      review.comment = updateData.comment;
    }

    await review.save({ session });

    if (
      updateData.rating !== undefined &&
      oldRating !== updateData.rating
    ) {
      await updateEntityRatingOnReviewEdit({
        entityType: review.entityType,
        entityId: review.entityId,
        oldRating,
        newRating: updateData.rating,
        session
      });
    }

    await session.commitTransaction();
    session.endSession();

    return review;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


/* =========================================================
   DELETE REVIEW
========================================================= */
export const deleteReviewService = async ({
  reviewId,
  userId
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const review = await Review.findById(reviewId).session(session);

    if (!review) {
      throw new NotFoundError("Review not found");
    }

    if (review.user.toString() !== userId.toString()) {
      throw new ForbiddenError(
        "You are not allowed to delete this review"
      );
    }

    await decrementEntityRating({
      entityType: review.entityType,
      entityId: review.entityId,
      removedRating: review.rating,
      session
    });

    await review.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    return true;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};