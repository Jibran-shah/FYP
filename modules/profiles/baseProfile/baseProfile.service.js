import mongoose, { connections } from "mongoose";
import Profile from "../../../models/BaseProfile.model.js";
import User from "../../../models/User.model.js";
import { BadRequestError, InternalServerError, NotFoundError } from "../../../errors/index.js";
import { mediaService } from "../../media/media.service.js";
import { parseMongoDuplicateError } from "../../../utils/errorHandling.utils.js";
import { generateAccessToken, generateRefreshToken, parseExpiresToSeconds } from "../../../utils/token.utils.js";
import { refreshSessionSystem } from "../../../utils/session.utils.js";
import {ServiceProvider} from "../../../models/ServiceProvider.model.js";
import ProductSellerModel from "../../../models/ProductSeller.model.js";
import { AUTH_CONFIG } from "../../../config/auth.config.js";

export const createProfile = async (user, profileData, media, contextMap) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {


    const avatarFile = media?.profileAvatar || [];
    const coverFile = media?.profileCover || [];


    const avatarAssetIds = await mediaService.resolve({
      files: avatarFile,
      fileIds: [],
      context: contextMap.profileAvatar,
      userId: user.id,
      session
    });

    const coverAssetIds = await mediaService.resolve({
      files: coverFile,
      fileIds: [],
      context: contextMap.profileCover,
      userId: user.id,
      session
    });



    const [profile] = await Profile.create(
      [
        {
          user: user.id,
          ...profileData,
          profileAvatar: avatarAssetIds[0],
          profileCover: coverAssetIds[0] 
        },
      ],
      { session }
    );

    const _user = await User.findOneAndUpdate(
      { _id: user.id },
      { baseProfile: profile._id },
      { session, new:true }
    );

    const sessionId = refreshSessionSystem.generateId();

    const accessToken = generateAccessToken({ user:_user });
  
    const refreshToken = generateRefreshToken({ user:_user, sessionId });

    const ttl = parseExpiresToSeconds(AUTH_CONFIG.REFRESH_TOKEN.EXPIRY);
    await refreshSessionSystem.save(_user._id, sessionId, refreshToken);
    await session.commitTransaction();

    return {
      accessToken,
      refreshToken,
      profile
    };

  } catch (err) {

    const duplicate = parseMongoDuplicateError(err);
    if(duplicate){
      const message = 
      duplicate.field==="user"?
      "Profile already exist for this user":duplicate.message;
      throw new BadRequestError(message)
    }

    await session.abortTransaction();
    throw err;

  } finally {

    session.endSession();

  }
};

export const getProfileByUser = async (id) => {
  return Profile.findOne({user:id})
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
    ]);
};

export const getProfileById = async (id)=>{
  return Profile.findById(id)
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
    ]);
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
    );

    await session.commitTransaction();
    return updated;
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

    await {ServiceProvider}.deleteOne({ user: userId }).session(session);
    await ProductSellerModel.deleteOne({ user: userId }).session(session);

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