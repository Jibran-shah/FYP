import mongoose, { connections } from "mongoose";
import Profile from "../../../models/Profile.model.js";
import User from "../../../models/User.model.js";
import { BadRequestError, InternalServerError, NotFoundError } from "../../../errors/index.js";
import { mediaService } from "../../media/media.service.js";

export const createProfile = async (userId, profileData, media, context) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const assetId = await mediaService.resolve({
          file: media?.file,
          context,
          userId,
          session
      });


    console.log(userId);

    const [profile] = await Profile.create(
      [
        {
          user: userId,
          ...profileData,
          profileImage: assetId,
        },
      ],
      { session }
    );

    console.log(profile)
    await User.updateOne(
      { _id: userId },
      { profileStatus: "COMPLETE" },
      { session }
    );

    await session.commitTransaction();
    return profile;

  } catch (err) {

    await session.abortTransaction();
    throw err;

  } finally {

    session.endSession();

  }
};

export const getProfileByUser = async (userId) => {
  return Profile.findOne({ user: userId })
    .populate("profileImage");
};

export const updateProfile = async (
  userId,
  profileData,
  media,
  context
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const profile = await Profile.findOne({ user: userId }).session(session);
    if (!profile) throw new NotFoundError("Profile not found");

    
        if (newLogoId && seller.shopLogo) {
          
          seller.shopLogo = newLogoId;
        }

    const newAssetId = await mediaService.resolve({
          file: media?.file,
          fileId,
          context,
          userId,
          session
      });

    // IMPORTANT: replace old asset safely
    if (newAssetId && profile.profileImage) {
      await mediaService.remove(profile.profileImage, userId, session);  
    }

    const updated = await Profile.findOneAndUpdate(
      { user: userId },
      {
        ...profileData,
        ...(newAssetId && { profileImage: newAssetId }),
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
    if (!profile) return null;

    await mediaService.remove(profile.profileImage, userId, session);

    // STEP 2: delete profile
    await Profile.deleteOne({ _id: profile._id }).session(session);

    await User.updateOne(
      { _id: userId },
      { profileStatus: "INCOMPLETE" },
      { session }
    );

    await session.commitTransaction();
    return profile;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};