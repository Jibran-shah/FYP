import mongoose from "mongoose";
import ProductSeller from "../../../models/ProductSeller.model.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError
} from "../../../errors/Http.error.js";
import {mediaService } from "../../media/media.service.js";
import { syncRole } from "../../../utils/roleSync.utils.js";
import { PROFILE_ROLE_TYPES } from "../../../constants/profile.constants.js";

export const createSeller = async ({
  userId,
  shopLogo,
  shopName,
  shopDescription,
  media,
  mediaContext
}) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const existing = await ProductSeller.findOne({ user:userId }).session(session);

    if (existing) {
      throw new BadRequestError("User already has a seller profile");
    }

    const shopLogoAssetId = await mediaService.resolve({
      file: media?.file,
      fileId:shopLogo,
      context: mediaContext,
      userId: mediaContext.owner,
      session
    });

    const seller = await ProductSeller.create(
      [{
        user:userId,
        shopName,
        shopDescription,
        shopLogo: shopLogoAssetId
      }],
      { session }
    );

    await syncRole({
      userId,
      role:PROFILE_ROLE_TYPES.PRODUCT_SELLER,
      Model:ProductSeller,
      session
    })

    await session.commitTransaction();

    return seller[0];

  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

// GET ALL
export const getAllSellers = async (filters = {}) => {
  
  const query = {};
  if (filters.isApproved !== undefined) {
    query.isApproved = filters.isApproved === "true";
  }

  if (filters.shopName){
    query.shopName = filters.shopName
  }

  const page = parseInt(filters.page || "1");
  const limit = parseInt(filters.limit || "20");
  const skip = (page - 1) * limit;

  return ProductSeller.find(query)
    .populate("user")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// GET ONE
export const getSellerById = async (id) => {
  return ProductSeller.findById(id).populate("user");
};

export const getSellerByUser = async (userId) => {
  return ProductSeller.findOne({
    user:userId
  }).populate("user");
};

export const updateSeller = async (id, updates, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const seller = await ProductSeller.findById(id).session(session);
    if (!seller) throw new NotFoundError("Product seller not found");

    if (userId && seller.user.toString() !== userId.toString()) {
      throw new UnauthorizedError("Not allowed to update this seller");
    }

    const {
      shopName,
      shopDescription,
      isApproved,
      fileId,
      media,
      mediaContext
    } = updates;

    if (shopName !== undefined) seller.shopName = shopName;
    if (shopDescription !== undefined) seller.shopDescription = shopDescription;

    // ✅ NEW UPLOAD
    const newLogoId = await mediaService.resolve({
      file: media?.file,
      fileId,
      context: mediaContext,
      userId,
      session
    });

    if (newLogoId && seller.shopLogo) {
      await mediaService.remove(seller.shopLogo, userId, session);  
      seller.shopLogo = newLogoId;
    }

    if (isApproved !== undefined) seller.isApproved = isApproved;

    await seller.save({ session });

    await session.commitTransaction();
    return seller;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};


export const deleteSeller = async (id, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const seller = await ProductSeller.findById(id).session(session);
    if (!seller) throw new NotFoundError("Product seller not found");

    if (userId && seller.user.toString() !== userId.toString()) {
      throw new UnauthorizedError("Not allowed to delete this seller");
    }

    await mediaService.remove(seller.shopLogo, userId, session);

    await ProductSeller.deleteOne({ _id: id }).session(session);

    syncRole({
      userId:userId,
      role:PROFILE_ROLE_TYPES.PRODUCT_SELLER,
      Model:ProductSeller,
      session
    })

    await session.commitTransaction();
    return { success: true };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};



export const bulkDeleteSellers = async (ids, userId) => {

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
      
      syncRole({
        userId:seller.user,
        role:PROFILE_ROLE_TYPES.PRODUCT_SELLER,
        Model:ProductSeller,
        session
      })

      await mediaService.remove(seller.shopLogo, seller.user, session);
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
