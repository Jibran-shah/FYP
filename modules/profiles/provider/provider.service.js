import mongoose from "mongoose";
import ServiceProvider from "../../../models/ServiceProvider.model.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../../errors/Http.error.js";
import ProfileModel from "../../../models/BaseProfile.model.js";
import { syncRole } from "../../../utils/roleSync.utils.js";
import { PROFILE_ROLE_TYPES } from "../../../constants/profile.constants.js";
import User from "../../../models/User.model.js";
import { generateAccessToken, generateRefreshToken, parseExpiresToSeconds } from "../../../utils/token.utils.js";
import { refreshSessionSystem } from "../../../utils/session.utils.js";
import { AUTH_CONFIG } from "../../../config/auth.config.js";
export const createProvider = async ({
  user,
  title,
  description,
  skills,
  experienceYears,
  locationLat,
  locationLn,
  fullAddress = ""
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const location =
        locationLat !== undefined && locationLn !== undefined
            ? {
                type: "Point",
                coordinates: [locationLn, locationLat]
            }
        : undefined;

    const provider = await ServiceProvider.create(
      [
        {
          user: user.id,
          title,
          description,
          skills,

          location: {
            ...location,
            address: {
              fullAddress
            }
          },

          experienceYears
        }
      ],
      { session }
    );

    await syncRole({
      userId: user.id,
      role: PROFILE_ROLE_TYPES.SERVICE_PROVIDER,
      Model: ServiceProvider,
      session
    });

    const _user = await User.findOneAndUpdate(
      { _id: user.id},
      { serviceProviderProfile: provider[0]._id },
      { session, new: true }
    );

    const sessionId = refreshSessionSystem .generateId();

    const accessToken = generateAccessToken({ user:_user });

    const refreshToken = generateRefreshToken({ user:_user, sessionId });

    const ttl = parseExpiresToSeconds(AUTH_CONFIG.REFRESH_TOKEN.EXPIRY);

    await refreshSessionSystem .save(user.id, sessionId, token);

    await session.commitTransaction();
    session.endSession();

    return { provider: provider[0], refreshToken, accessToken };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    const error = parseMongoDuplicateError(err);
    if(error){
      throw new ConflictError(`${error.field} already exists`, [
        {
          field:error.field,
          message:error.message,
        },
      ]);
    }else{
          throw err
    }
  }
};


export const getAllProviders = async (filters = {}) => {
  const query = {};

  if (filters.isApproved !== undefined) {
    query.isApproved =
      filters.isApproved === true || filters.isApproved === "true";
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
      : filters.skills.split(",").map(s => s.trim().toLowerCase());

    query.skills = { $in: skillsArray };
  }

  if (filters.minExperience) {
    query.experienceYears = { $gte: Number(filters.minExperience) };
  }

  /* =========================================================
     GEO SEARCH (NEARBY PROVIDERS)
  ========================================================= */
  let geoQuery = null;

  if (filters.lng && filters.lat && filters.radius) {
    geoQuery = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(filters.lng), Number(filters.lat)]
          },
          $maxDistance: Number(filters.radius) // meters
        }
      }
    };
  }

  const finalQuery = geoQuery
    ? { ...query, ...geoQuery }
    : query;

  const page = parseInt(filters.page || "1");
  const limit = parseInt(filters.limit || "20");
  const skip = (page - 1) * limit;

  const providers = await ServiceProvider.find(finalQuery)
    .populate("user", "name email avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return providers;
};

// ------------------------
// GET Provider By ID
// ------------------------
export const getProviderById = async (id) => {
    const provider = await ServiceProvider.findById(id).populate("user", "name email avatar");
    return provider;
}
export const updateProvider = async (id, updates, userId) => {
  const provider = await ServiceProvider.findById(id);
  if (!provider) throw new NotFoundError("Service provider not found");

  if (provider.user.toString() !== userId.toString()) {
    throw new UnauthorizedError("Not allowed to update this service provider");
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

  /* =========================================================
     LOCATION UPDATE (partial safe update)
  ========================================================= */
  if (locationLat !== undefined && locationLn !== undefined) {
    provider.location = {
      ...provider.location,
      type: "Point",
      coordinates: [locationLn, locationLat]
    };
  }

  if (fullAddress !== undefined) {
    provider.location.address = {
      ...provider.location?.address,
      fullAddress
    };
  }

  await provider.save();
  return provider;
};


export const updateProviderByUser = async (updates, userId) => {

    const provider = await ServiceProvider.findOne({user:userId});

    if (!provider) throw new NotFoundError("Service provider not found");

    // Ownership check
    if (provider.user.toString() !== userId.toString()) {
        throw new UnauthorizedError("Not allowed to update this service provider");
    }



    const {
        title,
        description,
        skills,
        experienceYears,
        isApproved,
    } = updates;

    // Allowed updates
    if (title !== undefined) provider.title = title;
    if (description !== undefined) provider.description = description;
    if (skills !== undefined) provider.skills = skills;
    if (experienceYears !== undefined)
        provider.experienceYears = experienceYears;

    // 🔥 Business rules (important)
    // Ideally only admin updates these
    if (isApproved !== undefined) provider.isApproved = isApproved;

    if (locationLat !== undefined && locationLn !== undefined) {
  provider.location = {
    ...provider.location,
    type: "Point",
    coordinates: [locationLn, locationLat]
  };
}

if (fullAddress !== undefined) {
  provider.location.address = {
    ...provider.location?.address,
    fullAddress
  };
}

    await provider.save();
    return provider;
}


// ------------------------
// DELETE Provider
// ------------------------
export const deleteProvider = async (user) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const provider = await ServiceProvider.findById(user.id).session(session);

        if (!provider) throw new NotFoundError("Service provider not found");

        await provider.deleteOne({ session });

        await syncRole({
            userId:user.id,
            role: PROFILE_ROLE_TYPES.SERVICE_PROVIDER,
            Model: ServiceProvider,
            session
        });

        const _user = await UserModel.findOneAndUpdate({_id:user.id},{serviceProviderProfile:null},{session, new: true})

        const sessionId = refreshSessionSystem .generateId();
    
        const accessToken = generateAccessToken({ user:_user });
        
        const refreshToken = generateRefreshToken({ user:_user, sessionId});
    
        const ttl = parseExpiresToSeconds(AUTH_CONFIG.REFRESH_TOKEN.EXPIRY);
        await refreshSessionSystem .save(user.id, sessionId, token);

        await session.commitTransaction();
        session.endSession();

        return {refreshToken,accessToken };

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};


export const bulkDeleteProviders = async (ids) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // ✅ Step 1: get affected providers
        const providers = await ServiceProvider.find({
            _id: { $in: ids }
        }).session(session);

        // ✅ Step 2: unique userIds
        const userIds = [...new Set(providers.map(p => p.user.toString()))];

        // ✅ Step 3: delete
        const deleted = await ServiceProvider.deleteMany({
            _id: { $in: ids }
        }).session(session);

        // ✅ Step 4: sync roles
        for (const userId of userIds) {
            await syncRole({
                userId,
                role: PROFILE_ROLE_TYPES.SERVICE_PROVIDER,
                Model: ServiceProvider,
                session
            });
            await UserModel.findByIdAndUpdate(userId,{
                serviceProviderProfile:null
            },{session})
    
            await refreshSessionSystem .deleteAll(userId);
        }

        await session.commitTransaction();
        session.endSession();

        return { success: true, deletedCount: deleted.deletedCount };

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};