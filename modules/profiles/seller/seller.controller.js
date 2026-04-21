import * as productSellerService from "./seller.service.js";
import { NotFoundError } from "../../../errors/Http.error.js";

// CREATE
export const createProductSeller = async (req, res) => {
  const seller = await productSellerService.createSeller({
    ...req.validated?.body,
    userId: req.user?.id,
    media: req.media,
    mediaContext: req.mediaContext
  });

  return res.status(201).json({
    success: true,
    productSeller: seller
  });
};

// READ ALL
export const getAllProductSellers = async (req, res) => {
  const sellers = await productSellerService.getAllSellers(req.validated?.query || {});

  return res.status(200).json({
    success: true,
    productSellers: sellers
  });
};

// READ ONE
export const getProductSellerById = async (req, res) => {
  const seller = await productSellerService.getSellerById(req.validated?.params.id);

  if (!seller) {
    throw new NotFoundError("Product seller not found");
  }

  return res.status(200).json({
    success: true,
    productSeller: seller
  });
};

export const getMySellerProfile = async(req,res) =>{
  const seller = await productSellerService.getSellerByUser(req.user?.id);
  if (!seller) {
    throw new NotFoundError("Product seller not found");
  }
  return res.status(200).json({
    success:true,
    productSeller:seller
  });
}

// UPDATE
export const updateProductSeller = async (req, res) => {
  const updated = await productSellerService.updateSeller(
    req.validated?.params.id,
    {
      ...req.validated?.body,
      media: req.media,
      mediaContext: req.mediaContext
    },
    req.user?.id
  );

  return res.status(200).json({
    success: true,
    productSeller: updated
  });
};

// DELETE
export const deleteProductSeller = async (req, res) => {
  await productSellerService.deleteSeller(
    req.validated?.params.id,
    req.user?.id
  );

  return res.status(200).json({
    success: true,
    message: "Product seller deleted successfully"
  });
};

// BULK DELETE
export const bulkDeleteProductSellers = async (req, res) => {
  await productSellerService.bulkDeleteSellers(
    req.validated?.body.ids,
    req.user?.id
  );

  return res.status(200).json({
    success: true,
    message: "Bulk delete successful"
  });
};

