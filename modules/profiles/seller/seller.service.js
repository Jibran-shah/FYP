import mongoose from "mongoose";
import ProductSeller from "../../../models/ProductSeller.model.js";

import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError
} from "../../../errors/Http.error.js";

import { mediaService } from "../../media/media.service.js";
import { syncRole } from "../../../utils/roleSync.utils.js";
import { PROFILE_ROLE_TYPES } from "../../../constants/profile.constants.js";

import UserModel from "../../../models/User.model.js";

import {
  generateAccessToken,
  generateRefreshToken
} from "../../../utils/token.utils.js";

import { refreshSessionSystem } from "../../../utils/session.utils.js";

import { syncSellerProductLocations } from "../../products/products.service.js";

/* =========================
   LOCATION UTILS
========================= */
import {
  buildLocation,
  buildGeoNearQuery,
  isValidCoordinates
} from "../../../utils/location.utils.js";

/* =========================================================
   CREATE SELLER
========================================================= */
export const createSeller = async ({
  user,
  locationLn,
  locationLat,
  fullAddress,
  shopLogoId,
  shopLogoFile = [],
  shopName,
  shopDescription,
  mediaContext
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existing = await ProductSeller.findOne({
      user: user.id
    }).session(session);

    if (existing) {
      throw new BadRequestError("User already has a seller profile");
    }

    const [shopLogoAssetId] = await mediaService.resolve({
      files: shopLogoFile,
      fileIds: shopLogoId ? [shopLogoId] : [],
      context: mediaContext?.shopLogoFile,
      userId: user.id,
      session
    });

    const location = buildLocation(
      locationLn,
      locationLat,
      fullAddress
    );

    const sellerArr = await ProductSeller.create(
      [
        {
          user: user.id,
          shopName,
          shopDescription,
          shopLogo: shopLogoAssetId || null,
          ...(location && { location })
        }
      ],
      { session }
    );

    const seller = sellerArr[0];

    await syncRole({
      userId: user.id,
      role: PROFILE_ROLE_TYPES.PRODUCT_SELLER,
      Model: ProductSeller,
      session
    });

    const _user = await UserModel.findOneAndUpdate(
      { _id: user.id },
      { productSeller: seller._id },
      { session, new: true }
    );

    const sessionId = refreshSessionSystem.generateId();

    const accessToken = generateAccessToken({ user: _user });
    const refreshToken = generateRefreshToken({ user: _user, sessionId });

    await refreshSessionSystem.save(user.id, sessionId, refreshToken);

    await session.commitTransaction();

    return { seller, accessToken, refreshToken };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/* =========================================================
   UPDATE SELLER (CLEAN + UTILS BASED)
========================================================= */
export const updateSeller = async (id, updates, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const seller = await ProductSeller.findById(id).session(session);

    if (!seller) {
      throw new NotFoundError("Product seller not found");
    }

    if (seller.user.toString() !== userId.toString()) {
      throw new UnauthorizedError("Not allowed to update this seller");
    }

    const {
      shopName,
      shopDescription,
      isApproved,
      shopLogoId,
      shopLogoFile = [],
      locationLat,
      locationLn,
      fullAddress,
      mediaContext
    } = updates;

    /* =========================
       BASIC FIELDS
    ========================= */
    if (shopName !== undefined) seller.shopName = shopName;
    if (shopDescription !== undefined) seller.shopDescription = shopDescription;
    if (isApproved !== undefined) seller.isApproved = isApproved;

    /* =========================
       MEDIA UPDATE
    ========================= */
    if (shopLogoFile.length || shopLogoId) {
      const [newLogoId] = await mediaService.resolve({
        files: shopLogoFile,
        fileIds: shopLogoId ? [shopLogoId] : [],
        context: mediaContext?.shopLogoFile,
        userId,
        session
      });

      if (newLogoId && seller.shopLogo) {
        await mediaService.remove(seller.shopLogo, userId, session);
      }

      seller.shopLogo = newLogoId || seller.shopLogo;
    }

    /* =========================
       LOCATION UPDATE (UTIL-BASED)
    ========================= */
    const newLocation = buildLocation(
      locationLn,
      locationLat,
      fullAddress
    );

    let locationChanged = false;

    if (newLocation) {
      seller.location = {
        ...seller.location,
        ...newLocation
      };
      locationChanged = true;
    }

    await seller.save({ session });

    /* =========================
       SYNC PRODUCTS IF LOCATION CHANGED
    ========================= */
    if (locationChanged) {
      await syncSellerProductLocations(seller._id, session);
    }

    await session.commitTransaction();
    return seller;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/* =========================================================
   GET ALL SELLERS
========================================================= */
export const getAllSellers = async (filters = {}) => {
  const {
    locationLn,
    locationLat,
    locationRad = 50000,
    shopName,
    isApproved,
    page = 1,
    limit = 10
  } = filters;

  const query = {};

  if (isApproved !== undefined) {
    query.isApproved = isApproved === "true";
  }

  if (shopName) {
    query.shopName = { $regex: shopName, $options: "i" };
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
    ? { ...query, ...geoQuery }
    : query;

  return ProductSeller.find(finalQuery)
    .populate("user")
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .sort({ createdAt: -1 });
};

/* =========================================================
   GET BY ID
========================================================= */
export const getSellerById = (id) =>
  ProductSeller.findById(id).populate("user");

/* =========================================================
   GET BY USER
========================================================= */
export const getSellerByUser = (userId) =>
  ProductSeller.findOne({ user: userId }).populate("user");