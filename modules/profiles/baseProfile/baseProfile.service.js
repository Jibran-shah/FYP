import mongoose, { connections } from "mongoose";
import Profile from "../../../models/Profile.model.js";
import User from "../../../models/User.model.js";
import { BadRequestError, InternalServerError, NotFoundError } from "../../../errors/index.js";
import { mediaService } from "../../media/media.service.js";
import { parseMongoDuplicateError } from "../../../utils/errorHandling.utils.js";
import { generateAccessToken, generateRefreshToken, parseExpiresToSeconds } from "../../../utils/token.utils.js";
import { refreshSessionSystem } from "../../../utils/session.utils.js";
import {ServiceProvider} from "../../../models/ServiceProvider.model.js";
import ProductSeller from "../../../models/ProductSeller.model.js";
import { AUTH_CONFIG } from "../../../config/auth.config.js";
import {normalizeId} from "../../../utils/normalizeModel.js"


export const createProfile = async (
  user,
  profileData,
  media,
  contextMap
) => {
  const session = await mongoose.startSession();

  console.log("[createProfile] START", {
    userId: user?.id,
  });

  console.log(media)

  try {
    session.startTransaction();
    console.log("[createProfile] Transaction started");

    // ---------------------------
    // 1. Validate user exists
    // ---------------------------
    console.log("[createProfile] Fetching user...");

    const userDoc = await User.findById(user.id).session(session);

    console.log("[createProfile] User fetch result:", {
      exists: !!userDoc,
      userId: userDoc?._id,
    });

    if (!userDoc) {
      console.error("[createProfile] ERROR: User not found");
      throw new Error("User not found");
    }

    // ---------------------------
    // 2. Resolve media assets
    // ---------------------------
    console.log("[createProfile] Resolving media...");

    const avatarFile = media?.profileAvatar || [];
    const coverFile = media?.profileCover || [];

    console.log("[createProfile] Media input:", {
      avatarCount: avatarFile.length,
      coverCount: coverFile.length,
    });

    const avatarAssetIds = await mediaService.resolve({
      files: avatarFile,
      fileIds: [],
      context: contextMap.profileAvatar,
      userId: user.id,
      session,
    });

    console.log("[createProfile] Avatar assets resolved:", avatarAssetIds);

    const coverAssetIds = await mediaService.resolve({
      files: coverFile,
      fileIds: [],
      context: contextMap.profileCover,
      userId: user.id,
      session,
    });

    console.log("[createProfile] Cover assets resolved:", coverAssetIds);

    // ---------------------------
    // 3. Create / Upsert profile
    // ---------------------------
    console.log("[createProfile] Upserting profile...");
    console.log("asset Ids",coverAssetIds,avatarAssetIds)

    const profile = await Profile.findOneAndUpdate(
      { user: user.id },
      {
        $setOnInsert: {
          user: user.id,
          ...profileData,
          profileAvatar: avatarAssetIds[0] || null,
          profileCover: coverAssetIds[0] || null,
        },
      },
      {
        session,
        upsert: true,
        new: true,
        returnDocument: "after",
      }
    ).populate([
      {
        path:"profileCover",
        populate:{
          path:"file"
        }
      },
      {
        path:"profileAvatar",
        populate:{
          path:"file"
        }
      },
    ]
    )

    console.log("[createProfile] Profile result:", {
      exists: !!profile,
      profileId: profile?._id,
      userMatch: profile?.user,
    });

    if (!profile) {
      console.error("[createProfile] ERROR: Profile creation failed");
      throw new Error("Profile creation failed");
    }

    // ---------------------------
    // 4. Link profile to user
    // ---------------------------
    console.log("[createProfile] Linking profile to user...");

    userDoc.baseProfile = profile._id;

    await userDoc.save({ session });

    console.log("[createProfile] User updated with baseProfile:", {
      userId: userDoc._id,
      baseProfile: userDoc.baseProfile,
    });

    // ---------------------------
    // 5. Generate session + tokens
    // ---------------------------
    console.log("[createProfile] Generating tokens...");

    const sessionId = refreshSessionSystem.generateId();

    const accessToken = generateAccessToken({
      user: {
        ...(userDoc.toObject() || userDoc),
        baseProfile: profile._id,
      },
    });

    const refreshToken = generateRefreshToken({
      user: {
        ...(userDoc.toObject() || userDoc),
        baseProfile: profile._id,
      },
      sessionId,
    });

    console.log("[createProfile] Tokens generated:", {
      sessionId,
      accessTokenExists: !!accessToken,
      refreshTokenExists: !!refreshToken,
    });

    // ---------------------------
    // 6. Save session
    // ---------------------------
    console.log("[createProfile] Saving session...");

    await refreshSessionSystem.save(
      userDoc._id,
      sessionId,
      refreshToken
    );

    console.log("[createProfile] Session saved");

    // ---------------------------
    // 7. Commit transaction
    // ---------------------------
    console.log("[createProfile] Committing transaction...");

    await session.commitTransaction();

    console.log("[createProfile] SUCCESS");

    return {
      accessToken,
      refreshToken,
      profile: normalizeId(profile),
      user: normalizeId(userDoc),
    };
  } catch (err) {
    console.error("[createProfile] FAILED:", {
      message: err.message,
      stack: err.stack,
    });

    await session.abortTransaction();

    console.log("[createProfile] Transaction aborted");

    throw err;
  } finally {
    await session.endSession();
    console.log("[createProfile] Session ended");
  }
};

export const getProfileByUser = async (id) => {
  const profile = await Profile.findOne({user:id})
  .populate([
      {
        path: "profileAvatar",select:"file namespace slug",
          populate:{
            path:"file",
            select:"url formate size mimeType"
      }},
      {
        path: "profileCover",select:"file namespace slug",
          populate:{
            path:"file",
            select:"url formate size mimeType"
      }}
    ])
  .lean()

  
  return normalizeId(profile)
};

export const getProfileById = async (id)=>{
  const profile = await  Profile.findById(id)
  .populate([
      {
        path: "profileAvatar",select:"file namespace slug",
          populate:{
            path:"file",
            select:"url formate size mimeType"
      }},
      {
        path: "profileCover",select:"file namespace slug",
          populate:{
            path:"file",
            select:"url formate size mimeType"
      }}
    ])
  .lean()
  return normalizeId(profile);
}

export const getProfilesByQuery = async (filters)=>{
  const query = {};

  if (filters.user) {
    query.user = filters.user;
  }

  if(filters.roles){
    query.roles = Array.isArray(filters.roles)
    ? filters.roles
    : filters.roles?.split(",");
  }

  if(filters.country){
    query.country = filters.country
  }

  if(filters.city){
    query.city = filters.city
  }

  if(filters.address){
    query.address = filters.address
  }

  const page = parseInt(filters.page || "1");
  const limit = parseInt(filters.limit || "20");
  const skip = (page - 1) * limit;


  const [docs, total] = await Promise.all([
    Profile.find(query)
      .populate([
        {
          path: "profileAvatar",select:"file namespace slug",
            populate:{
              path:"file",
              select:"url formate size mimeType"
        }},
        {
          path: "profileCover",select:"file namespace slug",
            populate:{
              path:"file",
              select:"url formate size mimeType"
        }}
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Profile.countDocuments(query)
  ]);


  const data = docs;

  const pages = Math.ceil(total / limit);
  

  const pagination = {
    total,
    page,
    limit,
    pages,
    hasNextPage: page < pages,
    hasPrevPage: page > 1
  };

  
  return {
    data,
    pagination
  };
}

export const updateProfile = async (
  userId,
  profileData,
  media,
  contextMap
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const profile = await Profile.findOne({ user: userId }).session(session);
    if (!profile) throw new NotFoundError("Profile not found");

    const avatarFile = media?.profileAvatar || [];
    const coverFile = media?.profileCover || [];


    const avatarAssetIds = await mediaService.resolve({
      files: avatarFile,
      fileIds: [],
      context: contextMap.profileAvatar,
      userId,
      session
    });

    const coverAssetIds = await mediaService.resolve({
      files: coverFile,
      fileIds: [],
      context: contextMap.profileCover,
      userId,
      session
    });

    // IMPORTANT: replace old asset safely
    if (avatarAssetIds.length && profile.profileAvatar) {
      await mediaService.remove(profile.profileAvatar, userId, session);  
    }

    if (coverAssetIds.length && profile.profileCover) {
      await mediaService.remove(profile.profileCover, userId, session);  
    }

    const updated = await Profile.findOneAndUpdate(
      { user: userId },
      {
        ...profileData,
        ...(avatarAssetIds.length && { profileAvatar: avatarAssetIds[0] }),
        ...(coverAssetIds.length && { profileCover: coverAssetIds[0] }),
      },
      { new: true, session }
    ).lean()

    await session.commitTransaction();
    return normalizeId(updated);
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};


export const deleteProfile = async (userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const profile = await Profile.findOne({ user: userId }).session(session);
    if (!profile) throw new NotFoundError("profile doesn't exists");
    await mediaService.remove(profile.profileAvatar, userId, session);
    await mediaService.remove(profile.profileCover, userId, session);

    await Profile.deleteOne({ _id: profile._id }).session(session);

    await ServiceProvider.deleteOne({ user: userId }).session(session);
    await ProductSeller.deleteOne({ user: userId }).session(session);

    await User.findByIdAndDelete(userId);

    refreshSessionSystem.deleteAll(userId);

    await session.commitTransaction();
    return true;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};


// import User from "../user/user.model.js";
// import BaseProfile from "../baseProfile/baseProfile.model.js";
// import { ServiceProvider } from "../serviceProvider/serviceProvider.model.js";
// import ProductSeller from "../productSeller/productSeller.model.js";

export const getFullProfileService = async (id) => {

  const user = await User.findById(id)
  .populate({
    path:"baseProfile",
    populate:[{
        path:"profileCover",
        populate:{
          path:"file"
        }
      },
      {
        path:"profileAvatar",
        populate:{
          path:"file"
        }
      }
    ]
  })
  .populate("serviceProvider")
  .populate({
    path:"productSeller",
    populate:{
      path:"shopLogo"
    }
  })
  .select("-password -__v")
  .lean()


  const baseProfile = user.baseProfile;
  const serviceProvider = user.serviceProvider
  const productSeller = user.productSeller

  // 3. Compose final object
  return {
    user:normalizeId(user),
    baseProfile: baseProfile || null,
    serviceProvider: serviceProvider || null,
    productSeller: productSeller || null,
  };
};