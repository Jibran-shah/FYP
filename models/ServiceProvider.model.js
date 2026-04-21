import mongoose from "mongoose";

const { Schema } = mongoose;

const serviceProviderSchema = new Schema(
  {

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },


    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },


    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },


    skills: {
      type: [String],
      set: (arr = []) =>
        [...new Set(arr.map(s => s.trim().toLowerCase()))],
      default: [],
    },

    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },


    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },


    ratingSum: {
      type: Number,
      default: 0,
      min: 0
    },


    ratingCount: {
      type: Number,
      default: 0,
      min: 0
    },


    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true
    }
    
  },
  {
    timestamps: true,
  }
);

serviceProviderSchema.index({ experienceYears: 1 });
serviceProviderSchema.index({ ratingAverage: -1 });
serviceProviderSchema.index({ ratingCount: -1 });

export default mongoose.model("ServiceProvider", serviceProviderSchema);