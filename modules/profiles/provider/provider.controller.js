// controllers/serviceProvider.controller.js
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

// ------------------------
// CREATE ServiceProvider
// ------------------------
export const createServiceProvider = async (req, res) => {
    const payload = req.validated?.body;

    const {provider,refreshToken,accessToken} = await createProviderService({
      ...payload,
      user:req.user
    });
      
    const refreshTtlSeconds = parseExpiresToSeconds(AUTH_CONFIG.REFRESH_TOKEN.EXPIRY);
    setCookie(res, AUTH_CONFIG.REFRESH_TOKEN.COOKIE_NAME, refreshToken, refreshTtlSeconds);
      
    const accessTtlSeconds = parseExpiresToSeconds(AUTH_CONFIG.ACCESS_TOKEN.EXPIRY);
    setCookie(res, AUTH_CONFIG.ACCESS_TOKEN.COOKIE_NAME, accessToken, accessTtlSeconds);

    return res.status(201).json({ provider });
};

// ------------------------
// READ ALL
// ------------------------
export const getAllServiceProviders = async (req, res) => {
  const filters = req.validated?.query || {};

  const providers = await getAllProvidersService(filters);

  return res.status(200).json({ serviceProviders: providers });
};

// ------------------------
// READ ONE
// ------------------------
export const getServiceProviderById = async (req, res) => {
  const { id } = req.validated?.params;

  const provider = await getProviderByIdService(id);

  if (!provider) {
    throw new NotFoundError("Service provider not found");
  }

  return res.status(200).json({ serviceProvider: provider });
};

// ------------------------
// UPDATE
// ------------------------
export const updateServiceProvider = async (req, res) => {
    const { id } = req.validated?.params;
    const updates = req.validated?.body;
    const userId = req.user?.id || null;
    const updatedProvider = await updateProviderService(
      id,
      updates,
      userId
    );

    return res.status(200).json({ serviceProvider: updatedProvider });
};

export const updateServiceProviderByUser = async (req, res) => {
    const updates = req.validated?.body;
    const userId = req.user?.id || null;

    const updatedProvider = await updateProviderByUserService(
      updates,
      userId
    );

    return res.status(200).json({ serviceProvider: updatedProvider });
};

// ------------------------
// DELETE SINGLE
// ------------------------
export const deleteServiceProvider = async (req, res) => {

    const {refreshToken,accessToken} =  await deleteProviderService(req.user);
      
    const refreshTtlSeconds = parseExpiresToSeconds(AUTH_CONFIG.REFRESH_TOKEN.EXPIRY);
    setCookie(res, AUTH_CONFIG.REFRESH_TOKEN.COOKIE_NAME, refreshToken, refreshTtlSeconds);
      
    const accessTtlSeconds = parseExpiresToSeconds(AUTH_CONFIG.ACCESS_TOKEN.EXPIRY);
    setCookie(res, AUTH_CONFIG.ACCESS_TOKEN.EXPIRY, accessToken, accessTtlSeconds);

    return res
      .status(200)
      .json({ message: "Service provider deleted successfully" });
};

// ------------------------
// BULK DELETE
// ------------------------
export const bulkDeleteServiceProviders = async (req, res) => {
    const { ids } = req.validated?.body;
    const userId = req.user?.id || null;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No provider IDs provided" });
    }

    await bulkDeleteProvidersService(ids, userId);

    return res.status(200).json({ message: "Bulk delete successful" });
};