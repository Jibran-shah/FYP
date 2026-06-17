import * as productSellerService from "./seller.service.js";
import { NotFoundError } from "../../../errors/Http.error.js";
import { parseExpiresToSeconds } from "../../../utils/token.utils.js";
import { setCookie } from "../../../utils/cookie.js";
import { AUTH_CONFIG } from "../../../config/auth.config.js";

let counter = 0;

export const createProductSeller = async (req, res) => {

  console.log("create seller req counter:",counter)
  const {
    seller,
    user,
    refreshToken,
    accessToken
  } = await productSellerService.createSeller({
    ...req.validated?.body,
    user: req.user,
    shopLogoFile: req.media?.shopLogoFile,
    shopLogoId: req.validated?.body?.shopLogoId,
    mediaContext: req.mediaContext
  });

  const refreshTtlSeconds = parseExpiresToSeconds(
    AUTH_CONFIG.REFRESH_TOKEN.EXPIRY
  );

  setCookie(
    res,
    AUTH_CONFIG.REFRESH_TOKEN.COOKIE_NAME,
    refreshToken,
    refreshTtlSeconds
  );

  const accessTtlSeconds = parseExpiresToSeconds(
    AUTH_CONFIG.ACCESS_TOKEN.EXPIRY
  );

  setCookie(
    res,
    AUTH_CONFIG.ACCESS_TOKEN.COOKIE_NAME,
    accessToken,
    accessTtlSeconds
  );

  return res.status(201).json({
    success: true,
    data: {
      user,
      seller
    }
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


export const updateProductSeller = async (req, res) => {
  const updated = await productSellerService.updateSeller(
    req.validated?.params.id,
    {
      ...req.validated?.body,
      shopLogoFile: req.media?.shopLogoFile,
      shopLogoId: req.validated?.body?.shopLogoId,
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
  const {refreshToken,accessToken} = await productSellerService.deleteSellerById(
    req.user
  );
    
  const refreshTtlSeconds = parseExpiresToSeconds(AUTH_CONFIG.REFRESH_TOKEN.EXPIRY);
  setCookie(res, AUTH_CONFIG.REFRESH_TOKEN.COOKIE_NAME, refreshToken, refreshTtlSeconds);
    
  const accessTtlSeconds = parseExpiresToSeconds(AUTH_CONFIG.ACCESS_TOKEN.EXPIRY);
  setCookie(res, AUTH_CONFIG.ACCESS_TOKEN.COOKIE_NAME, accessToken, accessTtlSeconds);

  return res.status(200).json({
    success: true,
    message: "Product seller deleted successfully"
  });
};


// DELETE
export const deleteProductSellerAdmin = async (req, res) => {
  const id = req.validated?.params.id;
  await productSellerService.deleteSellerByIdAdmin(id);
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

