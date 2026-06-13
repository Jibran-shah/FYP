import { AUTH_CONFIG } from "../../../config/auth.config.js";
import { NotFoundError } from "../../../errors/Http.error.js";
import { setCookie } from "../../../utils/cookie.js";
import { parseExpiresToSeconds } from "../../../utils/token.utils.js";

import {
  createProvider as createProviderService,
  getAllProviders as getAllProvidersService,
  getProviderById as getProviderByIdService,
  updateProvider as updateProviderService,
  deleteProvider as deleteProviderService,
  bulkDeleteProviders as bulkDeleteProvidersService,
  updateProviderByUser as updateProviderByUserService
} from "./provider.service.js";

/* =========================================================
   CREATE
========================================================= */

let counter = 0;

export const createServiceProvider = async (req, res) => {
  const payload = req.validated?.body;


  console.log("create provider req counter:",counter);

  const {
    provider,
    user,
    refreshToken,
    accessToken
  } = await createProviderService({
    ...payload,
    user: req.user
  });

  const refreshTtlSeconds = parseExpiresToSeconds(
    AUTH_CONFIG.REFRESH_TOKEN.EXPIRY
  );

  setCookie(
    res,
    AUTH_CONFIG.REFRESH_TOKEN.COOKIE_NAME,
    refreshToken,
    refreshTtlSeconds
  );

  const accessTtlSeconds = parseExpiresToSeconds(
    AUTH_CONFIG.ACCESS_TOKEN.EXPIRY
  );

  setCookie(
    res,
    AUTH_CONFIG.ACCESS_TOKEN.COOKIE_NAME,
    accessToken,
    accessTtlSeconds
  );

  return res.status(201).json({
    success: true,
    data: {
      provider,
      user
    }
  });
};

/* =========================================================
   GET ALL
========================================================= */
export const getAllServiceProviders = async (req, res) => {
  const filters = req.validated?.query || {};
  const providers = await getAllProvidersService(filters);

  return res.status(200).json({ serviceProviders: providers });
};

/* =========================================================
   GET ONE
========================================================= */
export const getServiceProviderById = async (req, res) => {
  const { id } = req.validated?.params;

  const provider = await getProviderByIdService(id);

  if (!provider) {
    throw new NotFoundError("Service provider not found");
  }

  return res.status(200).json({ serviceProvider: provider });
};

/* =========================================================
   UPDATE (ADMIN / DIRECT)
========================================================= */
export const updateServiceProvider = async (req, res) => {
  const { id } = req.validated?.params;
  const updates = req.validated?.body;

  const updatedProvider = await updateProviderService(
    id,
    updates,
    req.user?.id || null
  );

  return res.status(200).json({ serviceProvider: updatedProvider });
};

/* =========================================================
   UPDATE BY USER
========================================================= */
export const updateServiceProviderByUser = async (req, res) => {
  const updates = req.validated?.body;
  console.log(updates)
  const updatedProvider = await updateProviderByUserService(
    updates,
    req.user?.id || null
  );

  return res.status(200).json({ serviceProvider: updatedProvider });
};

/* =========================================================
   DELETE
========================================================= */
export const deleteServiceProvider = async (req, res) => {
  const { refreshToken, accessToken,user } = await deleteProviderService(req.user);
  const refreshTtlSeconds = parseExpiresToSeconds(
    AUTH_CONFIG.REFRESH_TOKEN.EXPIRY
  );

  setCookie(
    res,
    AUTH_CONFIG.REFRESH_TOKEN.COOKIE_NAME,
    refreshToken,
    refreshTtlSeconds
  );

  const accessTtlSeconds = parseExpiresToSeconds(
    AUTH_CONFIG.ACCESS_TOKEN.EXPIRY
  );

  setCookie(
    res,
    AUTH_CONFIG.ACCESS_TOKEN.COOKIE_NAME,
    accessToken,
    accessTtlSeconds
  );

  return res.status(200).json({
    success:true,
    data:{
      user
    }
  });
};

/* =========================================================
   BULK DELETE
========================================================= */
export const bulkDeleteServiceProviders = async (req, res) => {
  const { ids } = req.validated?.body;

  if (!ids?.length) {
    return res.status(400).json({ error: "No provider IDs provided" });
  }

  await bulkDeleteProvidersService(ids, req.user?.id || null);

  return res.status(200).json({ message: "Bulk delete successful" });
};