import express from "express";
import * as serviceController from "./services.controller.js";

import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  createServiceSchema,
  updateServiceSchema,
  serviceQuerySchema,
  idParamSchema
} from "./services.validation.js";

const router = express.Router();

router.use(protect())

router.post(
  "/",
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
  validate(idParamSchema,"params"),
  validate(updateServiceSchema),
  asyncHandler(serviceController.updateService)
);


router.delete(
  "/:id",
  validate(idParamSchema),
  asyncHandler(serviceController.deleteService)
);


export default router;