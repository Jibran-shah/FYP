import * as profileService from "./baseProfile.service.js";
import { NotFoundError } from "../../../errors/index.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { parseExpiresToSeconds } from "../../../utils/token.utils.js";
import { clearCookie, setCookie } from "../../../utils/cookie.js";
import { AUTH_CONFIG } from "../../../config/auth.config.js";

// CREATE
export const createProfile = asyncHandler(async (req, res) => {

  const {profile,accessToken,refreshToken} = await profileService.createProfile(
    req.user,
    req.validated?.body,
    req.media,
    req.mediaContext
  );
  
  const refreshTtlSeconds = parseExpiresToSeconds(AUTH_CONFIG.REFRESH_TOKEN.EXPIRY);
  setCookie(res, AUTH_CONFIG.REFRESH_TOKEN.COOKIE_NAME, refreshToken, refreshTtlSeconds);
  
  const accessTtlSeconds = parseExpiresToSeconds(AUTH_CONFIG.ACCESS_TOKEN.EXPIRY);
  setCookie(res, AUTH_CONFIG.ACCESS_TOKEN.COOKIE_NAME, accessToken, accessTtlSeconds);

  res.status(201).json({ success: true, data: profile });
});

// GET
export const getProfileById = asyncHandler(async (req, res) => {
  const {id} = req.validated?.params;
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
  const filter = req.validated?.query;
  const {data,pagination} = await profileService.getProfilesByQuery(filter);
  return res.status(200).json({ success:true, data ,pagination });
};

export const updateProfile = asyncHandler(async (req, res) => {
  const updated = await profileService.updateProfile(
    req.user.id,
    req.validated?.body,
    req.media,
    req.mediaContext
  );

  res.json({ success: true, data: updated });
});

// DELETE
export const deleteProfile = asyncHandler(async (req, res) => {

  await profileService.deleteProfile(req.user.id);
  clearCookie(res,AUTH_CONFIG.REFRESH_TOKEN.COOKIE_NAME);
  clearCookie(res,AUTH_CONFIG.ACCESS_TOKEN.COOKIE_NAME);

  res.json({ success: true, message: "Profile deleted successfully" });
});