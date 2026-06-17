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
import { normalizeId } from "../../../utils/normalizeModel.js";


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

  console.log("shopLogoFIle",shopLogoFile)

  console.log("[createSeller] START", { userId: user?.id });

  try {
    session.startTransaction();

    // ---------------------------
    // 1. Validate user exists
    // ---------------------------
    const userDoc = await UserModel.findById(user.id).session(session);

    console.log("[createSeller] User fetch:", {
      exists: !!userDoc,
      userId: userDoc?._id
    });

    if (!userDoc) {
      throw new Error("User not found");
    }

    // ---------------------------
    // 2. Resolve media
    // ---------------------------
    const [shopLogoAssetId] = await mediaService.resolve({
      files: shopLogoFile,
      fileIds: shopLogoId ? [shopLogoId] : [],
      context: mediaContext?.shopLogoFile,
      userId: user.id,
      session
    });

    console.log("[createSeller] Logo resolved:", shopLogoAssetId);

    // ---------------------------
    // 3. Build location
    // ---------------------------
    const location = buildLocation(
      locationLn,
      locationLat,
      fullAddress
    );

    console.log("[createSeller] Location built:", location);

    // ---------------------------
    // 4. Upsert seller (atomic)
    // ---------------------------
    const seller = await ProductSeller.findOneAndUpdate(
      { user: user.id },
      {
        $setOnInsert: {
          user: user.id,
          shopName,
          shopDescription,
          shopLogo: shopLogoAssetId || null,
          ...(location && { location })
        }
      },
      {
        session,
        upsert: true,
        new: true,
        runValidators: true,
        returnDocument: "after"
      }
    ).populate({
      path:"shopLogo",populate:{
      path:"file"
    }})

    console.log("[createSeller] Seller result:", {
      exists: !!seller,
      sellerId: seller?._id
    });

    if (!seller) {
      throw new Error("Seller creation failed");
    }

    // ---------------------------
    // 5. Sync role
    // ---------------------------
    await syncRole({
      userId: user.id,
      role: PROFILE_ROLE_TYPES.PRODUCT_SELLER,
      Model: ProductSeller,
      session
    });

    console.log("[createSeller] Role synced");

    // ---------------------------
    // 6. Update user reference
    // ---------------------------
    userDoc.productSeller = seller._id;
    await userDoc.save({ session });

    console.log("[createSeller] User updated:", {
      userId: userDoc._id,
      productSeller: userDoc.productSeller
    });

    // ---------------------------
    // 7. Generate tokens (SAFE PAYLOAD)
    // ---------------------------
    const sessionId = refreshSessionSystem.generateId();

    const accessToken = generateAccessToken({
      user: {
        ...(userDoc.toObject() || userDoc),
        productSeller: seller._id
      }
    });

    const refreshToken = generateRefreshToken({
      user: { 
        ...(userDoc.toObject() || userDoc),
        productSeller:seller._id},
      sessionId
    });

    console.log("[createSeller] Tokens generated:", {
      sessionId,
      accessToken: !!accessToken,
      refreshToken: !!refreshToken
    });

    // ---------------------------
    // 8. Save session
    // ---------------------------
    await refreshSessionSystem.save(
      userDoc._id,
      sessionId,
      refreshToken
    );

    console.log("[createSeller] Session saved");

    // ---------------------------
    // 9. Commit transaction
    // ---------------------------
    await session.commitTransaction();

    console.log("[createSeller] SUCCESS");

    return {
      seller: normalizeId(seller),
      user: normalizeId(userDoc),
      accessToken,
      refreshToken
    };

  } catch (err) {
    console.error("[createSeller] ERROR:", {
      message: err.message,
      stack: err.stack
    });

    await session.abortTransaction();

    const error = parseMongoDuplicateError(err);
    if (error) {
      throw new ConflictError(
        `${error.field} already exists`,
        [{ field: error.field, message: error.message }]
      );
    }

    throw err;

  } finally {
    await session.endSession();
    console.log("[createSeller] SESSION ENDED");
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
export const getSellerById = async(id) =>
  await ProductSeller.findById(id).populate("user");

/* =========================================================
   GET BY USER
========================================================= */
export const getSellerByUser = async(userId) =>
  await ProductSeller.findOne({ user: userId }).populate("user");

export const deleteSellerById = async (_user) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ---------------------------
    // 1. Fetch user
    // ---------------------------
    const userDoc = await UserModel.findById(_user.id).session(session);

    if (!userDoc) {
      throw new NotFoundError("User not found");
    }

    // ---------------------------
    // 2. Validate seller exists
    // ---------------------------
    if (!userDoc.productSeller) {
      throw new BadRequestError("User is not a product seller");
    }

    // ---------------------------
    // 3. Delete seller
    // ---------------------------
    await ProductSeller.findByIdAndDelete(userDoc.productSeller).session(session);

    // ---------------------------
    // 4. Unlink from user
    // ---------------------------
    userDoc.productSeller = null;
    await userDoc.save({ session });

    // ---------------------------
    // 5. Generate new session + tokens (same pattern as createSeller)
    // ---------------------------
    const sessionId = refreshSessionSystem.generateId();

    const accessToken = generateAccessToken({
      user: {
        ...(userDoc.toObject() || userDoc),
        productSeller: null
      }
    });

    const refreshToken = generateRefreshToken({
      user: {
        ...(userDoc.toObject() || userDoc),
        productSeller: null
      },
      sessionId
    });

    // ---------------------------
    // 6. Save session
    // ---------------------------
    await refreshSessionSystem.save(
      userDoc._id,
      sessionId,
      refreshToken
    );

    // ---------------------------
    // 7. Commit
    // ---------------------------
    await session.commitTransaction();

    return {
      success: true,
      accessToken,
      refreshToken
    };

  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
};



export const deleteSellerByIdAdmin = async (id) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await ProductSeller.findByIdAndDelete(idParamSchema).session(session);
    const user = await UserModel.findOne({productSeller:id});
    user.productSeller = null
    const deletedProducts = await Product.deleteMany({seller:id},{session});
    await user.save({ session });
    refreshSessionSystem.deleteAll(user._id)
    await session.commitTransaction();
    return {
      success: true
    };

  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
};