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

    // FIXED: correct mediaContext usage
    const [shopLogoAssetId] = await mediaService.resolve({
      files: shopLogoFile,
      fileIds: shopLogoId ? [shopLogoId] : [],
      context: mediaContext.shopLogoFile,
      userId: user.id,
      session
    });

    const location =
      locationLat !== undefined && locationLn !== undefined
        ? {
            type: "Point",
            coordinates: [locationLn, locationLat],
            address: {
              fullAddress: fullAddress || ""
            }
          }
        : undefined;

    const sellerArr = await ProductSeller.create(
      [
        {
          user: user.id,
          shopName,
          shopDescription,
          location,
          shopLogo: shopLogoAssetId || null
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
      { productSellerProfile: seller._id },
      { session, new: true }
    );

    const sessionId = refreshSessionSystem.generateId();

    const accessToken = generateAccessToken({ user: _user });
    const refreshToken = generateRefreshToken({ user: _user, sessionId });

    await refreshSessionSystem.save(user.id, sessionId, refreshToken);

    await session.commitTransaction();

    return {
      seller,
      accessToken,
      refreshToken
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/* =========================================================
   GET ALL
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
    query.shopName = {
      $regex: shopName,
      $options: "i"
    };
  }

  const pipeline = [];

  if (locationLat && locationLn) {
    pipeline.push({
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [locationLn, locationLat]
        },
        distanceField: "distance",
        maxDistance: locationRad,
        spherical: true,
        query
      }
    });
  } else {
    pipeline.push({ $match: query });
  }

  pipeline.push(
    {
      $sort:
        locationLat && locationLn
          ? { distance: 1 }
          : { createdAt: -1 }
    },
    { $skip: (Number(page) - 1) * Number(limit) },
    { $limit: Number(limit) }
  );

  return ProductSeller.aggregate(pipeline);
};

/* =========================================================
   GET BY ID
========================================================= */
export const getSellerById = async (id) => {
  return ProductSeller.findById(id).populate("user");
};

/* =========================================================
   GET BY USER
========================================================= */
export const getSellerByUser = async (userId) => {
  return ProductSeller.findOne({ user: userId }).populate("user");
};

/* =========================================================
   UPDATE SELLER
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

    if (shopName !== undefined) seller.shopName = shopName;
    if (shopDescription !== undefined) seller.shopDescription = shopDescription;

    /* FIXED MEDIA CONTEXT */
    if (shopLogoFile.length || shopLogoId) {
      const [newLogoId] = await mediaService.resolve({
        files: shopLogoFile,
        fileIds: shopLogoId ? [shopLogoId] : [],
        context: mediaContext.shopLogoFile,
        userId,
        session
      });

      if (newLogoId && seller.shopLogo) {
        await mediaService.remove(seller.shopLogo, userId, session);
      }

      seller.shopLogo = newLogoId || seller.shopLogo;
    }

    let locationChanged = false;

    if (locationLat !== undefined && locationLn !== undefined) {
      seller.location = {
        ...seller.location,
        type: "Point",
        coordinates: [locationLn, locationLat]
      };

      locationChanged = true;
    }

    if (fullAddress !== undefined) {
      seller.location.address = {
        ...seller.location?.address,
        fullAddress
      };
    }

    if (isApproved !== undefined) {
      seller.isApproved = isApproved;
    }

    await seller.save({ session });

    /* FIXED: update product locations */
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
   DELETE SELLER
========================================================= */
export const deleteSeller = async (user) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const seller = await ProductSeller.findById(user.id).session(session);

    if (!seller) {
      throw new NotFoundError("Product seller not found");
    }

    if (seller.shopLogo) {
      await mediaService.remove(seller.shopLogo, user.id, session);
    }

    await ProductSeller.deleteOne({ _id: seller._id }).session(session);

    await syncRole({
      userId: user.id,
      role: PROFILE_ROLE_TYPES.PRODUCT_SELLER,
      Model: ProductSeller,
      session
    });

    const _user = await UserModel.findOneAndUpdate(
      { _id: user.id },
      { productSellerProfile: null },
      { session, new: true }
    );

    const sessionId = refreshSessionSystem.generateId();

    const accessToken = generateAccessToken({ user: _user });
    const refreshToken = generateRefreshToken({ user: _user, sessionId });

    await refreshSessionSystem.save(user.id, sessionId, refreshToken);

    await session.commitTransaction();

    return { success: true, accessToken, refreshToken };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/* =========================================================
   BULK DELETE
========================================================= */
export const bulkDeleteSellers = async (ids) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sellers = await ProductSeller.find({
      _id: { $in: ids }
    }).session(session);

    await ProductSeller.deleteMany({
      _id: { $in: ids }
    }).session(session);

    for (const seller of sellers) {
      await syncRole({
        userId: seller.user,
        role: PROFILE_ROLE_TYPES.PRODUCT_SELLER,
        Model: ProductSeller,
        session
      });

      await UserModel.findByIdAndUpdate(
        seller.user,
        { productSellerProfile: null },
        { session }
      );

      if (seller.shopLogo) {
        await mediaService.remove(seller.shopLogo, seller.user, session);
      }
    }

    await session.commitTransaction();
    return { success: true };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};