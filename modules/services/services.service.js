import mongoose from "mongoose";
import Service from "../../models/Service.model.js";
import Category from "../../models/Category.model.js";
import { isValidId } from "../../validationSchemas/mongodb.schemas.js";
import { escapeRegex } from "../../utils/escapeRegex.utils.js";

import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError
} from "../../errors/index.js";

/* =========================
   LOCATION UTILS
========================= */
import {
  buildLocation,
  buildGeoNearQuery
} from "../../utils/location.utils.js";
import {
  ServiceProvider
} from "../../models/ServiceProvider.model.js";

/* =========================================================
   CREATE SERVICE
========================================================= */
export const createService = async (data) => {
  const category = await Category.findById(data.category);

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  if(!data.user.serviceProvider){
    return new UnauthorizedError("Not a provider");
  }

  const provider = await ServiceProvider.findOne({user:data.user.id});

  if(!provider){
    return new UnauthorizedError("Not a provider");
  }

  const location = buildLocation(
    provider.locationLn,
    provider.locationLat,
    provider.fullAddress
  );
  const service = await Service.create({
    ...data,
    provider:provider._id,
    category: category._id,
    categoryPath: category.path,
    location
  });

  return service;
};


export const getServices = async (query) => {
  let {
    page = 1,
    limit = 10,
    minPrice,
    maxPrice,
    category,
    status,
    provider,
    sort = "-createdAt",
    locationLn,
    locationLat,
    radius
  } = query;

  page = Math.max(Number(page), 1);
  limit = Math.min(Math.max(Number(limit), 1), 100);

  const filter = {};

  /* =========================
     PRICE FILTER
  ========================= */
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  /* =========================
     CATEGORY FILTER
  ========================= */
  if (category) {
    if (!isValidId(category)) {
      throw new BadRequestError("Invalid category id");
    }

    const cat = await Category.findById(category);

    if (!cat) {
      throw new NotFoundError("Category not found");
    }

    const safePath = escapeRegex(cat.path);

    filter.categoryPath = {
      $regex: `^${safePath}`
    };
  }

  /* =========================
     STATUS / PROVIDER
  ========================= */
  if (status) filter.status = status;

  if (provider) {
    if (!isValidId(provider)) {
      throw new BadRequestError("Invalid provider id");
    }
    filter.provider = provider;
  }

  /* =========================
     GEO SEARCH (OPTIONAL)
  ========================= */
  const geoQuery =
    locationLn !== undefined &&
    locationLat !== undefined &&
    radius !== undefined
      ? buildGeoNearQuery(locationLn, locationLat, radius)
      : null;

  const finalQuery = geoQuery
    ? { ...filter, ...geoQuery }
    : filter;

  const [services, total] = await Promise.all([
    Service.find(finalQuery)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("provider", "name")
      .populate("category", "name"),

    Service.countDocuments(finalQuery)
  ]);

  return {
    data: services,
    meta: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    }
  };
};


export const getServicesByProvider = async (provider) => {
  if (!isValidId(provider)) {
    throw new BadRequestError("Invalid provider id");
  }

  return await Service.find({ provider })
    .sort("-createdAt")
    .populate("category", "name");
};

/* =========================================================
   GET SERVICES BY CATEGORY (SUBTREE)
========================================================= */
export const getByCategory = async (categoryId) => {
  if (!isValidId(categoryId)) {
    throw new BadRequestError("Invalid category id");
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  const safePath = escapeRegex(category.path);

  return await Service.find({
    categoryPath: { $regex: `^${safePath}` }
  })
    .sort("-createdAt")
    .populate("provider", "name");
};

export const getServiceById = async (serviceId) => {
  if (!isValidId(serviceId)) {
    throw new BadRequestError("Invalid service id");
  }

  const service = await Service.findById(serviceId)
    .populate("provider", "name email")
    .populate("category", "name");

  if (!service) {
    throw new NotFoundError("Service not found");
  }

  return service;
};

export const updateService = async ({
  serviceId,
  userId,
  data
}) => {
  if (!isValidId(serviceId)) {
    throw new BadRequestError("Invalid service id");
  }

  const service = await Service.findById(serviceId);

  if (!service) {
    throw new NotFoundError("Service not found");
  }

  if (service.provider.toString() !== userId) {
    throw new UnauthorizedError(
      "Not allowed to update this service"
    );
  }

  const forbiddenFields = [
    "provider",
    "category",
    "categoryPath",
    "bookedCount",
    "ratingSum",
    "ratingCount",
    "ratingAverage"
  ];

  for (const field of forbiddenFields) {
    if (field in data) {
      throw new BadRequestError(
        `Cannot update field: ${field}`
      );
    }
  }

  Object.assign(service, data);

  await service.save();
  return service;
};


export const deleteService = async ({
  serviceId,
  userId
}) => {
  if (!isValidId(serviceId)) {
    throw new BadRequestError("Invalid service id");
  }

  const service = await Service.findById(serviceId);

  if (!service) {
    throw new NotFoundError("Service not found");
  }

  if (service.provider.toString() !== userId) {
    throw new UnauthorizedError("Not allowed to delete this service");
  }

  await service.deleteOne();

  return true;
};


/**
 * Sync ServiceProvider location to all Services
 *
 * @param {Object} params
 * @param {ObjectId} params.providerId
 * @param {Object} params.location - GeoJSON { type, coordinates, fullAddress }
 * @param {ClientSession} [params.session]
 */
export const syncProviderLocationToServices = async ({
  providerId,
  location,
  session
}) => {
  if (!providerId || !location) return;

  // ensure we never write invalid geo data
  const hasCoords =
    Array.isArray(location.coordinates) &&
    location.coordinates.length === 2 &&
    Number.isFinite(location.coordinates[0]) &&
    Number.isFinite(location.coordinates[1]);

  const update = {
    location: {
      type: "Point",
      ...(hasCoords ? { coordinates: location.coordinates } : {}),
      fullAddress: location.fullAddress || ""
    }
  };

  await Service.updateMany(
    { provider: providerId },
    { $set: update },
    { session }
  );
};