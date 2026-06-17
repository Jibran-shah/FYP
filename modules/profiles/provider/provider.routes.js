import express from "express";
const router = express.Router();

import {
  createServiceProvider,
  getAllServiceProviders,
  getServiceProviderById,
  updateServiceProvider,
  deleteServiceProvider,
  bulkDeleteServiceProviders,
  updateServiceProviderByUser,
  deleteServiceProviderAdmin
} from "./provider.controller.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { bulkDeleteServiceProviderSchema, createServiceProviderSchema, serviceProviderIdParamSchema, updateServiceProviderSchema } from "./provider.validation.js";
import { protect, restrictTo } from "../../../middlewares/protect.middleware.js";
import { USER_ROLES } from "../../../constants/user.constants.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";



router.post("/bulk-delete",
  protect(),
  restrictTo(USER_ROLES.ADMIN),
  validate(bulkDeleteServiceProviderSchema) , 
  asyncHandler(bulkDeleteServiceProviders)
);


router.get("/", asyncHandler(getAllServiceProviders));

router.post("/",
  protect({requireBaseProfile:true}),
  validate(createServiceProviderSchema), 
  asyncHandler(createServiceProvider));

router.put(
  "/byUser",
  protect({requireServiceProvider:true}),
  validate(updateServiceProviderSchema),
  asyncHandler(updateServiceProviderByUser)
);

router.put(
  "/:id",
  protect({requireServiceProvider:true}),
  validate(serviceProviderIdParamSchema, "params"),
  validate(updateServiceProviderSchema),
  asyncHandler(updateServiceProvider)
);

router.delete(
  "/",
  protect({requireServiceProvider:true}),
  asyncHandler(deleteServiceProvider)
);

router.delete(
  "/:id",
  protect({requireServiceProvider:true}),
  restrictTo("admin"),
  validate(serviceProviderIdParamSchema,"params"),
  asyncHandler(deleteServiceProviderAdmin)
);

router.get(
  "/:id",
  validate(serviceProviderIdParamSchema, "params"),
  asyncHandler(getServiceProviderById)
);

export default router;