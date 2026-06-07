import Product from "../../models/Product.model.js";
import ProductSeller from "../../models/ProductSeller.model.js";
import Category from "../../models/Category.model.js";

import {
  NotFoundError,
  UnauthorizedError,
  BadRequestError
} from "../../errors/index.js";

import { isValidId } from "../../validationSchemas/mongodb.schemas.js";
import { escapeRegex } from "../../utils/escapeRegex.utils.js";
import { CATEGORY_APPLIES_TO } from "../../constants/category.constants.js";

import { mediaService } from "../media/media.service.js";

/* =========================
   LOCATION UTILS
========================= */
import {
  buildLocation,
  buildGeoNearQuery,
  isValidCoordinates
} from "../../utils/location.utils.js";

/* =========================================================
   CREATE PRODUCT (NEW MEDIA SYSTEM)
========================================================= */
export const createProduct = async (payload, mediaContext = {}) => {
  const {
    data,
    user,
    sellerId,
    categoryId,
    files = [],
    fileIds = []
  } = payload;

  /* =========================
     VALIDATE CATEGORY
  ========================= */
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new BadRequestError("Category doesn't exist");
  }

  if (!category.appliesTo.includes(CATEGORY_APPLIES_TO.PRODUCT)) {
    throw new BadRequestError("Must provide a product category");
  }

  /* =========================
     VALIDATE SELLER
  ========================= */
  const seller = await ProductSeller.findById(sellerId).select(
    "location user"
  );

  if (!seller) {
    throw new BadRequestError("Seller does not exist");
  }

  /* =========================
     MEDIA RESOLUTION
  ========================= */
  const images = await mediaService.resolve({
    files,
    fileIds,
    context: mediaContext,
    userId: user.id
  });

  /* =========================
     LOCATION INHERITANCE
  ========================= */
  const coords = seller?.location?.coordinates;

  const location =
    Array.isArray(coords) &&
    isValidCoordinates(coords[0], coords[1])
      ? buildLocation(coords[0], coords[1], "")
      : undefined;

  /* =========================
     FINAL PRODUCT PAYLOAD
  ========================= */
  const productPayload = {
    ...data,

    user: user.id,

    seller: sellerId,

    category: categoryId,

    categoryPath: category.path,

    images,

    ...(location && { location })
  };

  return Product.create(productPayload);
};

/* =========================================================
   SYNC SELLER LOCATION → PRODUCTS
========================================================= */
export const syncSellerProductLocations = async (
  sellerId,
  session = null
) => {
  const seller = await ProductSeller.findById(
    sellerId
  ).select("location");

  const coords = seller?.location?.coordinates;

  if (
    !Array.isArray(coords) ||
    coords.length !== 2 ||
    !isValidCoordinates(coords[0], coords[1])
  ) {
    return;
  }

  const update = {
    location: buildLocation(coords[0], coords[1], "")
  };

  const query = { seller: sellerId };

  return session
    ? Product.updateMany(query, update).session(session)
    : Product.updateMany(query, update);
};

/* =========================================================
   GET PRODUCTS (UNCHANGED LOGIC)
========================================================= */
export const getProducts = async (query) => {
  let {
    page = 1,
    limit = 10,
    minPrice,
    maxPrice,
    category,
    status,
    seller,
    locationLn,
    locationLat,
    locationRad = 50000,
    sort = "-createdAt"
  } = query;

  page = Math.max(Number(page), 1);
  limit = Math.min(Math.max(Number(limit), 1), 100);

  const filter = {};

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (category) {
    if (!isValidId(category)) {
      throw new BadRequestError("Invalid category id");
    }

    const cat = await Category.findById(category);
    if (!cat) throw new NotFoundError("Category not found");

    const safePath = escapeRegex(cat.path);

    filter.categoryPath = { $regex: `^${safePath}` };
  }

  if (status) filter.status = status;

  if (seller) {
    if (!isValidId(seller)) {
      throw new BadRequestError("Invalid seller id");
    }
    filter.seller = seller;
  }

  const geoQuery =
    locationLn !== undefined &&
    locationLat !== undefined
      ? buildGeoNearQuery(
          locationLn,
          locationLat,
          locationRad
        )
      : null;

  const finalQuery = geoQuery
    ? { ...filter, ...geoQuery }
    : filter;

  const [products, total] = await Promise.all([
    Product.find(finalQuery)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("seller", "name")
      .populate("category", "name"),

    Product.countDocuments(finalQuery)
  ]);

  return {
    data: products,
    meta: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    }
  };
};

/* =========================================================
   GET BY SELLER
========================================================= */
export const getProductsBySeller = async (
  seller
) => {
  if (!isValidId(sellerId)) {
    throw new BadRequestError("Invalid seller id");
  }

  return Product.find({seller})
    .sort("-createdAt")
    .populate("category", "name");
};

/* =========================================================
   GET BY CATEGORY
========================================================= */
export const getByCategory = async (
  categoryId
) => {

  if (!isValidId(categoryId)) {
    throw new BadRequestError("Invalid category id");
  }

  const category = await Category.findById(categoryId);
  
  if (!category)
    throw new NotFoundError("Category not found");

  const safePath = escapeRegex(category.path);

  return Product.find({
    categoryPath: { $regex: `^${safePath}` }
  })
    .sort("-createdAt")
    .populate("seller", "name");
};

/* =========================================================
   GET BY ID
========================================================= */
export const getProductById = async (
  productId
) => {
  if (!isValidId(productId)) {
    throw new BadRequestError("Invalid product id");
  }

  const product = await Product.findById(productId)
    .populate("seller", "name email")
    .populate("category", "name")
    .populate("images");

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  return product;
};

/* =========================================================
   UPDATE PRODUCT
========================================================= */
export const updateProduct = async ({
  productId,
  userId,
  data,
  context = {}
}) => {
  if (!isValidId(productId)) {
    throw new BadRequestError("Invalid product id");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  if (product.seller.toString() !== String(userId)) {
    throw new UnauthorizedError(
      "Not allowed to update this product"
    );
  }

  const forbiddenFields = [
    "seller",
    "category",
    "categoryPath",
    "soldCount",
    "ratingSum",
    "ratingCount",
    "ratingAverage"
  ];

  for (const field of forbiddenFields) {
    if (field in data) {
      throw new BadRequestError(
        `Cannot update field: ${field}`
      );
    }
  }

  /* =========================
     MEDIA UPDATE (NEW SYSTEM)
  ========================= */
  if (data.files || data.fileIds) {
    const images = await mediaService.resolve({
      files: data.files || [],
      fileIds: data.fileIds || [],
      context,
      userId
    });

    product.images = images;
  }

  Object.assign(product, data);

  await product.save();
  return product;
};

/* =========================================================
   DELETE PRODUCT
========================================================= */
export const deleteProduct = async ({
  productId,
  userId
}) => {
  if (!isValidId(productId)) {
    throw new BadRequestError("Invalid product id");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  if (product.seller.toString() !== String(userId)) {
    throw new UnauthorizedError(
      "Not allowed to delete this product"
    );
  }

  await product.deleteOne();
  return true;
};