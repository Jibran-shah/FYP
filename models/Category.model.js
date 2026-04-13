import mongoose from "mongoose";

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    /* ======================
       CORE INFO
    ====================== */
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

    /* ======================
       TREE STRUCTURE
    ====================== */
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true
    },

    /*
      Materialized path examples:

      products
      products/electronics
      products/electronics/laptops
      services
      services/web-development
      services/web-development/react
    */
    path: {
      type: String,
      required: true,
      index: true
    },

    /* ======================
       TYPE CONTROL (ROOT LEVEL ONLY)
    ====================== */
    type: {
      type: String,
      enum: ["root", "product", "service"],
      default: "product",
      index: true
    },

    /* ======================
       SOFT DELETE
    ====================== */
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

/* ======================
   UNIQUE NAME UNDER SAME PARENT
====================== */
categorySchema.index(
  { name: 1, parentCategory: 1 },
  { unique: true }
);

/* ======================
   FAST SUBTREE QUERIES
====================== */
categorySchema.index({ path: 1 });

/* ======================
   PATH GENERATION
====================== */
categorySchema.pre("validate", async function (next) {
  const slug = this.name.toLowerCase().replace(/\s+/g, "-");

  // Root category
  if (!this.parentCategory) {
    this.slug = slug;
    this.path = slug;
    this.type = "root";
    return next();
  }

  // Prevent self-parenting
  if (this.parentCategory.equals(this._id)) {
    return next(new Error("Category cannot be its own parent"));
  }

  // Load parent
  const parent = await this.constructor.findById(this.parentCategory);

  if (!parent) {
    return next(new Error("Parent category not found"));
  }

  this.slug = slug;
  this.type = parent.type;

  this.path = parent.path + "/" + slug;

  next();
});

/* ======================
   UPDATE CHILD PATHS IF NAME CHANGES
====================== */
categorySchema.pre("save", async function (next) {
  if (!this.isModified("name")) return next();

  const old = await this.constructor.findById(this._id);
  if (!old) return next();

  const oldPath = old.path;
  const newSlug = this.name.toLowerCase().replace(/\s+/g, "-");

  if (!this.parentCategory) {
    this.path = newSlug;
  } else {
    const parent = await this.constructor.findById(this.parentCategory);
    this.path = parent.path + "/" + newSlug;
  }

  // Update children
  await this.constructor.updateMany(
    { path: { $regex: `^${oldPath}/` } },
    [
      {
        $set: {
          path: {
            $concat: [
              this.path,
              {
                $substrCP: ["$path", oldPath.length, { $strLenCP: "$path" }]
              }
            ]
          }
        }
      }
    ]
  );

  next();
});

/* ======================
   AUTO FILTER SOFT-DELETED
====================== */
categorySchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category;