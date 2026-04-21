import mongoose from "mongoose";
import {
  BadRequestError,
  NotFoundError
} from "../errors/index.js";

import {
  CATEGORY_HIERARCHY_LEVEL,
  CATEGORY_HIERARCHY_LEVEL_ARRAY,
  CATEGORY_APPLIES_TO,
  CATEGORY_APPLIES_TO_ARRAY
} from "../constants/category.constants.js";

const { Schema } = mongoose;

/* =========================================================
   HELPERS
========================================================= */
const generateSlug = (name) =>
  name.toLowerCase().trim().replace(/\s+/g, "-");

const escapeRegex = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* =========================================================
   SCHEMA
========================================================= */
const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    description: {
      type: String,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true
    },

    path: {
      type: String,
      required: true
    },

    depth: {
      type: Number,
      default: 0,
      index: true
    },

    hierarchyLevel: {
      type: String,
      enum: CATEGORY_HIERARCHY_LEVEL_ARRAY,
      default: CATEGORY_HIERARCHY_LEVEL.ROOT,
      index: true
    },

    appliesTo: {
      type: [String],
      enum: CATEGORY_APPLIES_TO_ARRAY,
      default: [
        CATEGORY_APPLIES_TO.PRODUCT,
        CATEGORY_APPLIES_TO.SERVICE
      ],
      index: true
    }
  },
  {
    timestamps: true
  }
);




/* =========================================================
   PRE VALIDATE
========================================================= */
categorySchema.pre("validate", async function () {
  const slug = generateSlug(this.name);

  /* ROOT */
  if (!this.parentCategory) {
    this.slug = slug;
    this.path = slug;
    this.depth = 0;
    this.hierarchyLevel = CATEGORY_HIERARCHY_LEVEL.ROOT;
    return;
  }

  /* SELF CHECK */
  if (this.parentCategory.equals(this._id)) {
    throw new BadRequestError("Category cannot be its own parent")
  }

  const parent = await this.constructor.findById(this.parentCategory);

  if (!parent) {
    throw new NotFoundError("Parent category not found");
  }

  /* BUILD TREE */
  this.slug = slug;
  this.depth = parent.depth + 1;
  this.path = `${parent.path}/${slug}`;

  /* LEVEL LOGIC */
  if (this.depth === 0) {
    this.hierarchyLevel = CATEGORY_HIERARCHY_LEVEL.ROOT;
  } else if (this.depth === 1) {
    this.hierarchyLevel = CATEGORY_HIERARCHY_LEVEL.CATEGORY;
  } else {
    this.hierarchyLevel = CATEGORY_HIERARCHY_LEVEL.SUBCATEGORY;
  }
});

/* =========================================================
   PRE SAVE
========================================================= */
categorySchema.pre("save", async function () {
  if (!this.isModified("name")) return;

  const old = await this.constructor.findById(this._id);
  if (!old) return;

  const oldPath = old.path;
  const newSlug = generateSlug(this.name);

  let newPath;

  if (!this.parentCategory) {
    newPath = newSlug;
    this.depth = 0;
  } else {
    const parent = await this.constructor.findById(this.parentCategory);

    if (!parent) {
      throw new NotFoundError("Parent category not found");
    }

    newPath = `${parent.path}/${newSlug}`;
    this.depth = parent.depth + 1;
  }

  this.slug = newSlug;
  this.path = newPath;

  /* UPDATE CHILDREN */
  const safeOldPath = escapeRegex(oldPath);

  await this.constructor.updateMany(
    { path: { $regex: `^${safeOldPath}/` } },
    [
      {
        $set: {
          path: {
            $concat: [
              newPath,
              {
                $substrCP: [
                  "$path",
                  oldPath.length,
                  { $strLenCP: "$path" }
                ]
              }
            ]
          }
        }
      }
    ]
  );
});


categorySchema.index(
  { name: 1, parentCategory: 1 },
  { unique: true }
);

categorySchema.index({ path: 1 });

const Category = mongoose.model("Category", categorySchema);
export default Category;