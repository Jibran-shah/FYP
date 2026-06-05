import mongoose from "mongoose";

import Review from "../../models/Review.model.js";

import Product from "../../models/product.model.js";
import Service from "../../models/service.model.js";
import ProductSeller from "../../models/ProductSeller.model.js";
import ServiceProvider from "../../models/ServiceProvider.model.js";

import {
  BadRequestError,
  NotFoundError
} from "../../errors/index.js";


/* =========================================================
   ENTITY MODEL MAP
========================================================= */
const ENTITY_MODEL_MAP = {
  Product: Product,
  Service: Service,
  ProductSeller: ProductSeller,
  ServiceProvider: ServiceProvider
};


/* =========================================================
   UPDATE ENTITY RATING SUMMARY
   Updates:
   - ratingSum
   - ratingCount
   - ratingAverage
========================================================= */
export const updateEntityRatingSummary = async ({
  entityType,
  entityId,
  session = null
}) => {
  const EntityModel = ENTITY_MODEL_MAP[entityType];

  if (!EntityModel) {
    throw new BadRequestError("Invalid entity type");
  }

  if (!mongoose.Types.ObjectId.isValid(entityId)) {
    throw new BadRequestError("Invalid entity ID");
  }

  /* =========================================================
     AGGREGATE REVIEWS
  ========================================================= */
  const stats = await Review.aggregate([
    {
      $match: {
        entityType,
        entityId: new mongoose.Types.ObjectId(entityId)
      }
    },
    {
      $group: {
        _id: null,
        ratingSum: { $sum: "$rating" },
        ratingCount: { $sum: 1 }
      }
    }
  ]).session(session);

  const ratingData = stats[0] || {
    ratingSum: 0,
    ratingCount: 0
  };

  const ratingAverage =
    ratingData.ratingCount > 0
      ? Number(
          (ratingData.ratingSum / ratingData.ratingCount).toFixed(2)
        )
      : 0;

  /* =========================================================
     UPDATE TARGET ENTITY
  ========================================================= */
  const updatedEntity = await EntityModel.findByIdAndUpdate(
    entityId,
    {
      ratingSum: ratingData.ratingSum,
      ratingCount: ratingData.ratingCount,
      ratingAverage
    },
    {
      new: true,
      session
    }
  );

  if (!updatedEntity) {
    throw new NotFoundError("Entity not found");
  }

  return {
    ratingSum: updatedEntity.ratingSum,
    ratingCount: updatedEntity.ratingCount,
    ratingAverage: updatedEntity.ratingAverage
  };
};

/* =========================================================
   INCREMENTAL ENTITY RATING UPDATE
   Use when NEW review is created

   Updates:
   - ratingSum += newRating
   - ratingCount += 1
   - ratingAverage recalculated
========================================================= */
export const incrementEntityRating = async ({
  entityType,
  entityId,
  newRating,
  session = null
}) => {
  const EntityModel = ENTITY_MODEL_MAP[entityType];

  if (!EntityModel) {
    throw new BadRequestError("Invalid entity type");
  }

  if (!mongoose.Types.ObjectId.isValid(entityId)) {
    throw new BadRequestError("Invalid entity ID");
  }

  /* =========================================================
     FETCH CURRENT ENTITY RATING DATA
  ========================================================= */
  const entity = await EntityModel.findById(entityId).session(session);

  if (!entity) {
    throw new NotFoundError("Entity not found");
  }

  /* =========================================================
     CALCULATE NEW VALUES
  ========================================================= */
  const updatedRatingSum = entity.ratingSum + newRating;
  const updatedRatingCount = entity.ratingCount + 1;

  const updatedRatingAverage =
    updatedRatingCount > 0
      ? Number(
          (updatedRatingSum / updatedRatingCount).toFixed(2)
        )
      : 0;

  /* =========================================================
     UPDATE ENTITY
  ========================================================= */
  entity.ratingSum = updatedRatingSum;
  entity.ratingCount = updatedRatingCount;
  entity.ratingAverage = updatedRatingAverage;

  await entity.save({ session });

  return {
    ratingSum: entity.ratingSum,
    ratingCount: entity.ratingCount,
    ratingAverage: entity.ratingAverage
  };
};


/* =========================================================
   DECREMENTAL ENTITY RATING UPDATE
   Use when review is DELETED

   Updates:
   - ratingSum -= removedRating
   - ratingCount -= 1
   - ratingAverage recalculated
========================================================= */
export const decrementEntityRating = async ({
  entityType,
  entityId,
  removedRating,
  session = null
}) => {
  const EntityModel = ENTITY_MODEL_MAP[entityType];

  if (!EntityModel) {
    throw new BadRequestError("Invalid entity type");
  }

  if (!mongoose.Types.ObjectId.isValid(entityId)) {
    throw new BadRequestError("Invalid entity ID");
  }

  /* =========================================================
     FETCH CURRENT ENTITY
  ========================================================= */
  const entity = await EntityModel.findById(entityId).session(session);

  if (!entity) {
    throw new NotFoundError("Entity not found");
  }

  /* =========================================================
     CALCULATE NEW VALUES
  ========================================================= */
  const updatedRatingSum = Math.max(0, entity.ratingSum - removedRating);

  const updatedRatingCount = Math.max(
    0,
    entity.ratingCount - 1
  );

  const updatedRatingAverage =
    updatedRatingCount > 0
      ? Number(
          (updatedRatingSum / updatedRatingCount).toFixed(2)
        )
      : 0;

  /* =========================================================
     UPDATE ENTITY
  ========================================================= */
  entity.ratingSum = updatedRatingSum;
  entity.ratingCount = updatedRatingCount;
  entity.ratingAverage = updatedRatingAverage;

  await entity.save({ session });

  return {
    ratingSum: entity.ratingSum,
    ratingCount: entity.ratingCount,
    ratingAverage: entity.ratingAverage
  };
};

/* =========================================================
   UPDATE ENTITY RATING AFTER REVIEW EDIT
   Use when user changes rating value

   Updates:
   - ratingSum = ratingSum - oldRating + newRating
   - ratingCount unchanged
   - ratingAverage recalculated
========================================================= */
export const updateEntityRatingOnReviewEdit = async ({
  entityType,
  entityId,
  oldRating,
  newRating,
  session = null
}) => {
  const EntityModel = ENTITY_MODEL_MAP[entityType];

  if (!EntityModel) {
    throw new BadRequestError("Invalid entity type");
  }

  if (!mongoose.Types.ObjectId.isValid(entityId)) {
    throw new BadRequestError("Invalid entity ID");
  }

  /* =========================================================
     FETCH CURRENT ENTITY
  ========================================================= */
  const entity = await EntityModel.findById(entityId).session(session);

  if (!entity) {
    throw new NotFoundError("Entity not found");
  }

  /* =========================================================
     CALCULATE UPDATED VALUES
  ========================================================= */
  const updatedRatingSum =
    entity.ratingSum - oldRating + newRating;

  const updatedRatingCount = entity.ratingCount;

  const updatedRatingAverage =
    updatedRatingCount > 0
      ? Number(
          (updatedRatingSum / updatedRatingCount).toFixed(2)
        )
      : 0;

  /* =========================================================
     UPDATE ENTITY
  ========================================================= */
  entity.ratingSum = Math.max(0, updatedRatingSum);
  entity.ratingCount = updatedRatingCount;
  entity.ratingAverage = updatedRatingAverage;

  await entity.save({ session });

  return {
    ratingSum: entity.ratingSum,
    ratingCount: entity.ratingCount,
    ratingAverage: entity.ratingAverage
  };
};
