import express from "express";
import * as serviceController from "./services.controller.js";

import { protect } from "../../middlewares/protect.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  createServiceSchema,
  updateServiceSchema,
  serviceQuerySchema,
  idParamSchema
} from "./services.validation.js";

const router = express.Router();

router.post(
  "/",
  protect({requireServiceProviderProfile:true}),
  validate(createServiceSchema),
  asyncHandler(serviceController.createService)
);


router.get(
  "/",
  validate(serviceQuerySchema,"query"),
  asyncHandler(serviceController.getServices)
);


router.get(
  "/me",
  protect({requireServiceProviderProfile:true}),
  asyncHandler(serviceController.getServicesByProvider)
);


router.get(
  "/category/:categoryId",
  validate(idParamSchema,"params"),
  asyncHandler(serviceController.getByCategory)
);


router.get(
  "/:id",
  validate(idParamSchema,"params"),
  asyncHandler(serviceController.getServiceById)
);


router.patch(
  "/:id",
  protect({requireServiceProviderProfile:true}),
  validate(idParamSchema,"params"),
  validate(updateServiceSchema),
  asyncHandler(serviceController.updateService)
);


router.delete(
  "/:id",
  protect({requireServiceProviderProfile:true}),
  validate(idParamSchema,"params"),
  asyncHandler(serviceController.deleteService)
);


export default router;