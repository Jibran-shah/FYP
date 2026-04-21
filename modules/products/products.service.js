import Product from "../../models/Product.model.js";
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


export const createProduct = async (data) => {
  const category = await Category.findById(data.category);
  if(!category){
    throw new BadRequestError("Category doesn't exist")
  }

  if(!category.appliesTo.includes(CATEGORY_APPLIES_TO.PRODUCT)){
    throw new BadRequestError("must provide a products category")
  }

  const images = [];

  if(data.images){
    for(image in data.images){
      const image = await mediaService.resolve({
        fileId:image,
        context:data.context,
        userId:data.seller
      });
      images.push(image);
    }
  }

  data.categoryPath = category.path;
  data.images = images;
  
  const product = await Product.create(data);
  return product;
};


export const getProducts = async (query) => {
  let {
    page = 1,
    limit = 10,
    minPrice,
    maxPrice,
    category,
    status,
    seller,
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

    filter.categoryPath = {
      $regex: `^${safePath}`
    };
  }

  if (status) filter.status = status;

  if (seller) {
    if (!isValidId(seller)) {
      throw new BadRequestError("Invalid seller id");
    }
    filter.seller = seller;
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("seller", "name")
      .populate("category", "name"),

    Product.countDocuments(filter)
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

export const getProductsBySeller = async (sellerId) => {
  if (!isValidId(sellerId)) {
    throw new BadRequestError("Invalid seller id");
  }

  return await Product.find({ seller: sellerId })
    .sort("-createdAt")
    .populate("category", "name");
};


export const getByCategory = async (categoryId) => {
  if (!isValidId(categoryId)) {
    throw new BadRequestError("Invalid category id");
  }

  const category = await Category.findById(categoryId);
  if (!category) throw new NotFoundError("Category not found");

  const safePath = escapeRegex(category.path);

  return await Product.find({
    categoryPath: { $regex: `^${safePath}` }
  })
    .sort("-createdAt")
    .populate("seller", "name");
};

/* ======================
   GET SINGLE PRODUCT
====================== */
export const getProductById = async (productId) => {
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

/* ======================
   UPDATE PRODUCT
====================== */
export const updateProduct = async ({
  productId,
  userId,
  data
}) => {
  if (!isValidId(productId)) {
    throw new BadRequestError("Invalid product id");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  /* ======================
     OWNERSHIP CHECK
  ====================== */
  if (product.seller.toString() !== userId) {
    throw new UnauthorizedError("Not allowed to update this product");
  }

  /* ======================
     BLOCK DANGEROUS FIELDS
  ====================== */
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
      throw new BadRequestError(`Cannot update field: ${field}`);
    }
  }

  Object.assign(product, data);

  await product.save();

  return product;
};

/* ======================
   DELETE PRODUCT (SOFT READY)
====================== */
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

  if (product.seller.toString() !== userId) {
    throw new UnauthorizedError("Not allowed to delete this product");
  }

  await product.deleteOne();

  return true;
};