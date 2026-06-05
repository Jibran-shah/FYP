import * as productService from "./products.service.js";

/* ======================
   CREATE PRODUCT
====================== */
export const createProduct = async (req, res) => {
  const product = await productService.createProduct({
    ...req.validated?.body,

    seller: req.user.id,

    /* ======================
       MEDIA INTEGRATION
    ====================== */
    files: req.media?.multi?.files || [],
    fileIds: req.media?.multi?.fileIds || []
  });

  res.status(201).json({
    success: true,
    data: product
  });
};

/* ======================
   GET ALL PRODUCTS
====================== */
export const getProducts = async (req, res) => {
  const result = await productService.getProducts(req.validated?.query);

  res.json({
    success: true,
    ...result
  });
};

/* ======================
   GET MY PRODUCTS
====================== */
export const getProductsBySeller = async (req, res) => {
  const products = await productService.getProductsBySeller(req.user.id);

  res.json({
    success: true,
    data: products
  });
};

/* ======================
   GET BY CATEGORY
====================== */
export const getByCategory = async (req, res) => {
  const products = await productService.getByCategory(
    req.validated?.params?.categoryId
  );

  res.json({
    success: true,
    data: products
  });
};

/* ======================
   GET SINGLE PRODUCT
====================== */
export const getProductById = async (req, res) => {
  const product = await productService.getProductById(
    req.validated?.params?.id
  );

  res.json({
    success: true,
    data: product
  });
};

/* ======================
   UPDATE PRODUCT
====================== */
export const updateProduct = async (req, res) => {
  const product = await productService.updateProduct({
    productId: req.validated?.params.id,
    userId: req.user.id,

    data: {
      ...req.validated?.body,

      /* ======================
         MEDIA UPDATE SUPPORT
      ====================== */
      files: req.media?.multi?.files || [],
      fileIds: req.media?.multi?.fileIds || []
    }
  });

  res.json({
    success: true,
    data: product
  });
};

/* ======================
   DELETE PRODUCT
====================== */
export const deleteProduct = async (req, res) => {
  await productService.deleteProduct({
    productId: req.validated?.params.id,
    userId: req.user.id
  });

  res.status(204).send();
};