import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

/**
 * Allowed entity types mapped to actual Mongoose models
 */
export const REPORT_ENTITY_TYPES = {
  USER: "User",
  PRODUCT: "Product",
  POST: "Post",
  COMMENT: "Comment",
  MESSAGE: "Message",
};

export const REPORT_ENTITY_TYPES_ARRAY = Object.keys(
  REPORT_ENTITY_TYPES
);

const ReportSchema = new Schema(
  {
    reporter: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * The actual entity being reported
     * This will dynamically reference different models
     */
    entityId: {
      type: Types.ObjectId,
      required: true,
      refPath: "entityType", // 👈 MAGIC FIELD
      index: true,
    },

    /**
     * This tells Mongoose which model to use for entityId
     */
    entityType: {
      type: String,
      required: true,
      enum: REPORT_ENTITY_TYPES_ARRAY,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: ["PENDING", "REVIEWED", "RESOLVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Prevent duplicate reports from same user
 */
ReportSchema.index(
  { reporter: 1, entityId: 1, entityType: 1 },
  { unique: true }
);

const Report = model("Report", ReportSchema);

export default Report;