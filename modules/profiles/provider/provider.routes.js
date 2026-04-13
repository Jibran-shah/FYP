import express from "express";
const router = express.Router();

import {
  createServiceProvider,
  getAllServiceProviders,
  getServiceProviderById,
  updateServiceProvider,
  deleteServiceProvider,
  bulkDeleteServiceProviders
} from "./provider.controller.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { bulkDeleteServiceProviderSchema, createServiceProviderSchema, serviceProviderIdParamSchema, updateServiceProviderSchema } from "./provider.validation.js";

// 🔥 STATIC ROUTES FIRST
router.post("/bulk-delete",validate(bulkDeleteServiceProviderSchema) , bulkDeleteServiceProviders);

// GET ALL + CREATE
router.get("/", getAllServiceProviders);
router.post("/",validate(createServiceProviderSchema), createServiceProvider);

// 🔥 DYNAMIC ROUTES LAST
router.put(
  "/:id",
  validate(serviceProviderIdParamSchema, "params"),
  validate(updateServiceProviderSchema),
  updateServiceProvider
);

router.delete(
  "/:id",
  validate(serviceProviderIdParamSchema, "params"),
  deleteServiceProvider
);

router.get(
  "/:id",
  validate(serviceProviderIdParamSchema, "params"),
  getServiceProviderById
);

export default router;