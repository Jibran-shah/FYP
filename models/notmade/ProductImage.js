import mongoose from "mongoose";

const productImageSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true
    },

    url: {
      type: String,
      required: true
    },

    isPrimary: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const ProductImage = mongoose.model("ProductImage", productImageSchema);

export default ProductImage;
