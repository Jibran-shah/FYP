import * as serviceService from "./services.service.js";

/* =========================================================
   CREATE SERVICE
========================================================= */
export const createService = async (req, res) => {
  const service = await serviceService.createService({
    ...req.validated?.body,
    provider: req.user.id
  });

  res.status(201).json({
    success: true,
    data: service
  });
};

/* =========================================================
   GET ALL SERVICES
========================================================= */
export const getServices = async (req, res) => {
  const result = await serviceService.getServices(req.validated?.query);

  res.json({
    success: true,
    ...result
  });
};

/* =========================================================
   GET MY SERVICES (SELLER)
========================================================= */
export const getServicesByProvider = async (req, res) => {
  const services = await serviceService.getServicesByProvider(req.user.id);

  res.json({
    success: true,
    data: services
  });
};

/* =========================================================
   GET SERVICES BY CATEGORY
========================================================= */
export const getByCategory = async (req, res) => {
  const services = await serviceService.getByCategory(
    req.validated?.params.categoryId
  );

  res.json({
    success: true,
    data: services
  });
};

/* =========================================================
   GET SINGLE SERVICE
========================================================= */
export const getServiceById = async (req, res) => {
  const service = await serviceService.getServiceById(req.validated?.params?.id);

  res.json({
    success: true,
    data: service
  });
};

/* =========================================================
   UPDATE SERVICE
========================================================= */
export const updateService = async (req, res) => {
  const service = await serviceService.updateService({
    serviceId: req.validated?.params.id,
    userId: req.user.id,
    data: req.validated?.body
  });

  res.json({
    success: true,
    data: service
  });
};

/* =========================================================
   DELETE SERVICE
========================================================= */
export const deleteService = async (req, res) => {
  await serviceService.deleteService({
    serviceId: req.validated?.params.id,
    userId: req.user.id
  });

  res.status(204).send();
};