import * as categoryService from "./categories.service.js";

/* =========================================================
   CREATE CATEGORY
========================================================= */
export const createCategory = async (req, res) => {
  const category = await categoryService.createCategory(
    req.validated.body
  );

  res.status(201).json({
    success: true,
    data: category
  });
};


/* =========================================================
   GET ALL CATEGORIES
========================================================= */
export const getCategories = async (req, res) => {
  const result = await categoryService.getCategories(
    req.validated.query
  );

  res.json({
    success: true,
    ...result
  });
};

/* =========================================================
   GET CATEGORY TREE
========================================================= */
export const getCategoryTree = async (req, res) => {

  const tree = await categoryService.getCategoryTree(req.validated.query.parentCategory);
  res.json({
    success: true,
    data: tree
  });

};

/* =========================================================
   GET CATEGORY BY ID
========================================================= */
export const getCategoryById = async (req, res) => {

  const category = await categoryService.getCategoryById(
    req.validated.params.id
  );

  res.json({
    success: true,
    data: category
  });
};

/* =========================================================
   UPDATE CATEGORY
========================================================= */
export const updateCategory = async (req, res) => {
  const updated = await categoryService.updateCategory({
    categoryId: req.validated.params.id,
    data: req.validated.body
  });

  res.json({
    success: true,
    data: updated
  });
};

/* =========================================================
   DELETE CATEGORY
========================================================= */
export const deleteCategory = async (req, res) => {
  await categoryService.deleteCategory(
    req.validated.params.id
  );

  res.status(204).send();
};