// controllers/serviceProvider.controller.js
import { NotFoundError } from "../../../errors/Http.error.js";
import { 
    createProvider as createProviderService,
    getAllProviders as getAllProvidersService,
    getProviderById as getProviderByIdService,
    updateProvider as updateProviderService,
    deleteProvider as deleteProviderService,
    bulkDeleteProviders as bulkDeleteProvidersService
} from "./provider.service.js";

// ------------------------
// CREATE ServiceProvider
// ------------------------
export const createServiceProvider = async (req, res) => {
    const payload = req.body;
    const userId = req.user ? req.user._id : null;

    const serviceProvider = await createProviderService({
      ...payload,
      user: userId || payload.user
    });

    return res.status(201).json({ serviceProvider });
};

// ------------------------
// READ ALL
// ------------------------
export const getAllServiceProviders = async (req, res) => {
  const filters = req.query || {};

  const providers = await getAllProvidersService(filters);

  return res.status(200).json({ serviceProviders: providers });
};

// ------------------------
// READ ONE
// ------------------------
export const getServiceProviderById = async (req, res) => {
  const { id } = req.params;

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
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user ? req.user._id : null;

    const updatedProvider = await updateProviderService(
      id,
      updates,
      userId
    );

    return res.status(200).json({ serviceProvider: updatedProvider });
};

// ------------------------
// DELETE SINGLE
// ------------------------
export const deleteServiceProvider = async (req, res) => {
    const { id } = req.params;
    const userId = req.user ? req.user._id : null;

    await deleteProviderService(id, userId);

    return res
      .status(200)
      .json({ message: "Service provider deleted successfully" });
};

// ------------------------
// BULK DELETE
// ------------------------
export const bulkDeleteServiceProviders = async (req, res) => {
    const { ids } = req.body;
    const userId = req.user ? req.user._id : null;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No provider IDs provided" });
    }

    await bulkDeleteProvidersService(ids, userId);

    return res.status(200).json({ message: "Bulk delete successful" });
};