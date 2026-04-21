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

export const createService = async (data) => {

  const category = await Category.findById(data.category);
  if (!category) {
    throw new NotFoundError("Category not found");
  }

  const service = await Service.create({
    ...data,
    category: category._id,
    categoryPath: category.path
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
    sort = "-createdAt"
  } = query;

  page = Math.max(Number(page), 1);
  limit = Math.min(Math.max(Number(limit), 1), 100);

  const filter = {};

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

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

  if (status) filter.status = status;

  if (provider) {
    if (!isValidId(provider)) {
      throw new BadRequestError("Invalid provider id");
    }
    filter.provider = provider;
  }

  const [services, total] = await Promise.all([
    Service.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("provider", "name")
      .populate("category", "name"),

    Service.countDocuments(filter)
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

export const getServicesByProvider = async (providerId) => {
  if (!isValidId(providerId)) {
    throw new BadRequestError("Invalid provider id");
  }

  return await Service.find({ provider: providerId })
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
    throw new UnauthorizedError("Not allowed to update this service");
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
      throw new BadRequestError(`Cannot update field: ${field}`);
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