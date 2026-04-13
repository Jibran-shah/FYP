import mongoose from "mongoose";
const { Schema } = mongoose;



/**
 * Address Schema
 * Supports multiple addresses per user
 */
const addressSchema = new Schema(
  {
    // Owner of the address
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Street / house / apartment info
    streetAddress: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    // City name
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // State / province / region
    state: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    // ZIP / postal code
    zipCode: {
      type: String,
      trim: true,
      maxlength: 20,
    },

    // Country name or code
    country: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // Default address for user
    isPrimary: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Soft delete support (optional)
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);


addressSchema.pre("save", async function (next) {
  if (!this.isPrimary) return next();

  // If this address is set as primary,
  // unset previous primary addresses for the same user
  await this.constructor.updateMany(
    {
      user: this.user,
      _id: { $ne: this._id },
    },
    {
      isPrimary: false,
    }
  );

  next();
});


const Address = mongoose.model("Address", addressSchema);
export default Address;
