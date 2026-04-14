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
export const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfileByUser(req.user._id);
  if (!profile) throw new NotFoundError("Profile not found");
  res.json({ success: true, data: profile });
});


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