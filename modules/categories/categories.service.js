import mongoose from "mongoose";
import Category from "../../models/Category.model.js";
import { isValidId } from "../../validationSchemas/mongodb.schemas.js";
import { escapeRegex } from "../../utils/escapeRegex.utils.js";
import {
  BadRequestError,
  NotFoundError
} from "../../errors/index.js";

/* =========================================================
   CREATE CATEGORY
========================================================= */
export const createCategory = async (data) => {
  return await Category.create(data);
};

/* =========================================================
   GET CATEGORIES (FILTER + PAGINATION)
========================================================= */
export const getCategories = async (query) => {
  const {
    page = 1,
    limit = 20,
    parentCategory,
    type,
    sort = "name"
  } = query;

  const pageNum = Number(page);
  const limitNum = Number(limit);

  if (pageNum < 1 || limitNum < 1) {
    throw new BadRequestError("Invalid pagination values");
  }

  const filter = {};

  if (parentCategory) {
    if (!isValidId(parentCategory)) {
      throw new BadRequestError("Invalid parent category id");
    }
    filter.parentCategory = parentCategory;
  }

  if (type) filter.type = type;

  const skip = (pageNum - 1) * limitNum;

  const [categories, total] = await Promise.all([
    Category.find(filter)
      .select("name slug path parentCategory depth appliesTo")
      .sort(sort)
      .skip(skip)
      .limit(limitNum),

    Category.countDocuments(filter)
  ]);

  return {
    data: categories,
    meta: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum
    }
  };
};

export const getCategoryDescendants = async (parentCategory) => {
  if (!isValidId(parentCategory)) {
    throw new BadRequestError("Invalid parent category id");
  }

  const parent = await Category.findById(parentCategory).select("_id");

  if (!parent) {
    throw new NotFoundError("Parent category not found");
  }

  const result = await Category.aggregate([
    { $match: { _id: parent._id } },

    {
      $graphLookup: {
        from: "categories",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parentCategory",
        as: "descendants",
        depthField: "level"
      }
    },

    {
      $project: {
        _id: 0,
        descendants: 1
      }
    }
  ]);

  return result[0]?.descendants || [];
};

export const getCategoryTree = async (parentCategory) => {
  let matchStage = {};

  /* =========================
     ROOT / START NODE
  ========================= */
  if (parentCategory) {
    const parent = await Category.findById(parentCategory).select("_id");

    if (!parent) {
      throw new NotFoundError("Parent category not found");
    }

    matchStage = { _id: parent._id };
  } else {
    matchStage = { parentCategory: null };
  }

  /* =========================
     AGGREGATION
  ========================= */
  const result = await Category.aggregate([
    { $match: matchStage },
    {
      $graphLookup: {
        from: "categories",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parentCategory",
        as: "descendants",
        depthField: "level"
      }
    }
  ]);

  if (!result.length) return [];

  /* =========================
     FLATTEN
  ========================= */
  const allNodes = [];

  for (const root of result) {
    allNodes.push(root, ...root.descendants);
  }

  /* =========================
     BUILD TREE (REMOVE descendants)
  ========================= */
  const map = new Map();
  const tree = [];

  for (const node of allNodes) {
    const { descendants, ...cleanNode } = node; // ✅ remove it here

    map.set(node._id.toString(), {
      ...cleanNode,
      children: []
    });
  }

  for (const node of allNodes) {
    const current = map.get(node._id.toString());

    if (
      !node.parentCategory ||
      (parentCategory &&
        node.parentCategory.toString() === parentCategory.toString())
    ) {
      tree.push(current);
    } else {
      const parent = map.get(node.parentCategory?.toString());
      if (parent) parent.children.push(current);
    }
  }

  return tree;
};

/* =========================================================
   GET CATEGORY BY ID
========================================================= */
export const getCategoryById = async (id) => {
  if (!isValidId(id)) {
    throw new BadRequestError("Invalid category id");
  }

  const category = await Category.findById(id)
    .select("name slug path parentCategory depth appliesTo");

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  return category;
};

/* =========================================================
   UPDATE CATEGORY
========================================================= */
export const updateCategory = async ({ categoryId, data }) => {
  if (!isValidId(categoryId)) {
    throw new BadRequestError("Invalid category id");
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  /* -------------------------
     PARENT VALIDATION
  ------------------------- */
  if (data.parentCategory) {
    if (!isValidId(data.parentCategory)) {
      throw new BadRequestError("Invalid parent category id");
    }

    if (data.parentCategory === categoryId.toString()) {
      throw new BadRequestError("Category cannot be its own parent");
    }

    const parent = await Category.findById(data.parentCategory);

    if (!parent) {
      throw new NotFoundError("Parent category not found");
    }

    // safer circular check
    if (parent.path.includes(category.path)) {
      throw new BadRequestError("Circular category hierarchy detected");
    }
  }

  Object.assign(category, data);

  return await category.save();
};

/* =========================================================
   DELETE CATEGORY (SUBTREE DELETE)
========================================================= */
export const deleteCategory = async (id) => {
  if (!isValidId(id)) {
    throw new BadRequestError("Invalid category id");
  }

  const category = await Category.findById(id);

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  const safePath = escapeRegex(category.path);

  await Category.deleteMany({
    path: { $regex: `^${safePath}` }
  });

  return true;
};