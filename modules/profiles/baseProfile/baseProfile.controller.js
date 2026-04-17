import * as profileService from "./baseProfile.service.js";
import { NotFoundError } from "../../../errors/index.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

// CREATE
export const createProfile = asyncHandler(async (req, res) => {

  const profile = await profileService.createProfile(
    req.user.id,
    req.body,
    req.media,
    req.mediaContext
  );

  res.status(201).json({ success: true, data: profile });
});

// GET
export const getProfileById = asyncHandler(async (req, res) => {
  const {id} = req.params;
  const profile = await profileService.getProfileById(id);
  if (!profile) throw new NotFoundError("Profile not found");
  res.json({ success: true, data: profile });
});

export const getProfileByUser = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfileByUser(req.user.id);
  if (!profile) throw new NotFoundError("Profile not found");
  res.json({ success: true, data: profile });
});

export const getProfilesByQuery = async (req,res)=>{
  const filter = req.query;

  const {data,pagination} = await profileService.getProfilesByQuery(filter);

  return res.status(200).json({ success:true, data ,pagination });
};

export const updateProfile = asyncHandler(async (req, res) => {
  const updated = await profileService.updateProfile(
    req.user._id,
    req.body,
    req.media,
    req.mediaContext
  );

  res.json({ success: true, data: updated });
});

// DELETE
export const deleteProfile = asyncHandler(async (req, res) => {
  const deleted = await profileService.deleteProfile(req.user._id);
  if (!deleted) throw new NotFoundError("Profile not found");
  res.json({ success: true, message: "Profile deleted successfully" });
});