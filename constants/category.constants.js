export const CATEGORY_HIERARCHY_LEVEL = Object.freeze({
  ROOT: "root",
  CATEGORY: "category",
  SUBCATEGORY: "subcategory"
});

export const CATEGORY_HIERARCHY_LEVEL_ARRAY = Object.freeze(
  Object.values(CATEGORY_HIERARCHY_LEVEL)
);

/* ======================
   BUSINESS USAGE
====================== */
export const CATEGORY_APPLIES_TO = Object.freeze({
  PRODUCT: "product",
  SERVICE: "service"
});

export const CATEGORY_APPLIES_TO_ARRAY = Object.freeze(
  Object.values(CATEGORY_APPLIES_TO)
);