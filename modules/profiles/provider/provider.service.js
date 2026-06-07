import mongoose from "mongoose";
import {ServiceProvider} from "../../../models/ServiceProvider.model.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError
} from "../../../errors/Http.error.js";

import User from "../../../models/User.model.js";

import {
  syncRole
} from "../../../utils/roleSync.utils.js";

import {
  PROFILE_ROLE_TYPES
} from "../../../constants/profile.constants.js";

import {
  generateAccessToken,
  generateRefreshToken,
  parseExpiresToSeconds
} from "../../../utils/token.utils.js";

import {
  refreshSessionSystem
} from "../../../utils/session.utils.js";

import {
  parseMongoDuplicateError
} from "../../../utils/errorHandling.utils.js";

/* =========================
   UTILS IMPORT (IMPORTANT)
========================= */
import {
  buildLocation,
  buildGeoNearQuery
} from "../../../utils/location.utils.js";
import { AUTH_CONFIG } from "../../../config/auth.config.js";
import { syncProviderLocationToServices } from "../../services/services.service.js";

/* =========================
   CREATE PROVIDER
========================= */

export const createProvider = async ({
  user,
  title,
  description,
  skills,
  experienceYears,
  locationLat,
  locationLn,
  fullAddress
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const location = buildLocation(
      locationLn,
      locationLat,
      fullAddress
    );

    const provider = await ServiceProvider.create(
      [{
        user: user.id,
        title,
        description,
        skills,
        experienceYears,
        ...(location && { location })
      }],
      { session }
    );

    await syncRole({
      userId: user.id,
      role: PROFILE_ROLE_TYPES.SERVICE_PROVIDER,
      Model: ServiceProvider,
      session
    });

    const _user = await User.findOneAndUpdate(
      { _id: user.id },
      { serviceProvider: provider[0]._id },
      { session, new: true }
    );

    const sessionId = refreshSessionSystem.generateId();

    const accessToken = generateAccessToken({ user: _user});
    const refreshToken = generateRefreshToken({ user: _user, sessionId });

    const ttl = parseExpiresToSeconds(
      AUTH_CONFIG.REFRESH_TOKEN.EXPIRY
    );

    await refreshSessionSystem.save(
      user.id,
      sessionId,
      refreshToken
    );

    await session.commitTransaction();
    session.endSession();

    return { provider: provider[0], refreshToken, accessToken };
  } catch (err) {

    await session.abortTransaction();
    session.endSession();

    const error = parseMongoDuplicateError(err);

    if (error) {

      throw new ConflictError(
        `${error.field} already exists`,
        [
          {
            field: error.field,
            message: error.message
          }
        ]
      );
    }

    throw err;
  }
};

/* =========================
   GET ALL PROVIDERS
========================= */

export const getAllProviders = async (filters = {}) => {
  const query = {};

  if (filters.isApproved !== undefined) {
    query.isApproved =
      filters.isApproved === true ||
      filters.isApproved === "true";
  }

  if (filters.user) {
    if (!mongoose.Types.ObjectId.isValid(filters.user)) {
      throw new Error("Invalid user ID");
    }
    query.user = filters.user;
  }

  if (filters.skills) {
    const skillsArray = Array.isArray(filters.skills)
      ? filters.skills
      : filters.skills
          .split(",")
          .map(s => s.trim().toLowerCase());

    query.skills = { $in: skillsArray };
  }

  if (filters.minExperience) {
    query.experienceYears = {
      $gte: Number(filters.minExperience)
    };
  }

  /* =========================
     GEO QUERY (CLEAN)
  ========================= */

  const geoQuery =
    filters.lng &&
    filters.lat &&
    filters.radius
      ? buildGeoNearQuery(
          filters.lng,
          filters.lat,
          filters.radius
        )
      : null;

  const finalQuery = geoQuery
    ? { ...query, ...geoQuery }
    : query;

  const page = parseInt(filters.page || "1");
  const limit = parseInt(filters.limit || "20");
  const skip = (page - 1) * limit;

  return await ServiceProvider.find(finalQuery)
    .populate("user", "name email avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

/* =========================
   GET BY ID
========================= */

export const getProviderById = async (id) => {
  return ServiceProvider.findById(id).populate(
    "user",
    "name email avatar"
  );
};
export const updateProvider = async (
  id,
  updates,
  userId
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const provider = await ServiceProvider.findById(id).session(session);

    if (!provider) {
      throw new NotFoundError("Service provider not found");
    }

    if (provider.user.toString() !== userId.toString()) {
      throw new UnauthorizedError(
        "Not allowed to update this service provider"
      );
    }

    const {
      title,
      description,
      skills,
      experienceYears,
      isApproved,
      locationLat,
      locationLn,
      fullAddress
    } = updates;

    if (title !== undefined) provider.title = title;
    if (description !== undefined) provider.description = description;
    if (skills !== undefined) provider.skills = skills;
    if (experienceYears !== undefined) provider.experienceYears = experienceYears;
    if (isApproved !== undefined) provider.isApproved = isApproved;

    /* =========================
       LOCATION UPDATE
    ========================= */
    let locationChanged = false;

    const location = buildLocation(
      locationLn,
      locationLat,
      fullAddress
    );

    if (location) {
      provider.location = location;
      locationChanged = true;
    }

    await provider.save({ session });

    /* =========================
       SYNC SERVICES (ONLY IF LOCATION CHANGED)
    ========================= */
    if (locationChanged) {
      await syncProviderLocationToServices({
        providerId: provider._id,
        location: provider.location,
        session
      });
    }

    await session.commitTransaction();
    session.endSession();

    return provider;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};


/* =========================
   UPDATE BY USER
========================= */

export const updateProviderByUser = async (
  updates,
  userId
) => {
  
const session = await mongoose.startSession();
  session.startTransaction();

  try {
    
    const provider =
    await ServiceProvider.findOne({ user: userId }).session(session);

    if (!provider) {
      throw new NotFoundError("Service provider not found");
    }

    if (provider.user.toString() !== userId.toString()) {
      throw new UnauthorizedError(
        "Not allowed to update this service provider"
      );
    }

    const {
      title,
      description,
      skills,
      experienceYears,
      isApproved,
      locationLat,
      locationLn,
      fullAddress
    } = updates;

    if (title !== undefined) provider.title = title;
    if (description !== undefined) provider.description = description;
    if (skills !== undefined) provider.skills = skills;
    if (experienceYears !== undefined) provider.experienceYears = experienceYears;
    if (isApproved !== undefined) provider.isApproved = isApproved;

    /* =========================
       LOCATION UPDATE
    ========================= */
    let locationChanged = false;

    const location = buildLocation(
      locationLn,
      locationLat,
      fullAddress
    );

    if (location) {
      provider.location = location;
      locationChanged = true;
    }

    await provider.save({ session });

    /* =========================
       SYNC SERVICES (ONLY IF LOCATION CHANGED)
    ========================= */
    if (locationChanged) {
      await syncProviderLocationToServices({
        providerId: provider._id,
        location: provider.location,
        session
      });
    }

    await session.commitTransaction();
    session.endSession();

    return provider;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/* =========================
   DELETE PROVIDER
========================= */

export const deleteProvider = async (user) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const provider =
      await ServiceProvider.findById(user.id).session(session);

    if (!provider) {
      throw new NotFoundError(
        "Service provider not found"
      );
    }

    await provider.deleteOne({ session });

    await syncRole({
      userId: user.id,
      role: PROFILE_ROLE_TYPES.SERVICE_PROVIDER,
      Model: ServiceProvider,
      session
    });

    const _user = await User.findOneAndUpdate(
      { _id: user.id },
      { serviceProviderProfile: null },
      { session, new: true }
    );

    const sessionId =
      refreshSessionSystem.generateId();

    const accessToken = generateAccessToken({
      user: _user
    });

    const refreshToken =
      generateRefreshToken({
        user: _user,
        sessionId
      });

    await refreshSessionSystem.deleteAll(user.id);

    await session.commitTransaction();
    session.endSession();

    return { refreshToken, accessToken };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/* =========================
   BULK DELETE
========================= */

export const bulkDeleteProviders = async (
  ids
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const providers = await ServiceProvider.find({
      _id: { $in: ids }
    }).session(session);

    const userIds = [
      ...new Set(
        providers.map(p => p.user.toString())
      )
    ];

    const deleted =
      await ServiceProvider.deleteMany({
        _id: { $in: ids }
      }).session(session);

    for (const userId of userIds) {
      await syncRole({
        userId,
        role: PROFILE_ROLE_TYPES.SERVICE_PROVIDER,
        Model: ServiceProvider,
        session
      });

      await User.findByIdAndUpdate(
        userId,
        { serviceProviderProfile: null },
        { session }
      );

      await refreshSessionSystem.deleteAll(
        userId
      );
    }

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      deletedCount: deleted.deletedCount
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};