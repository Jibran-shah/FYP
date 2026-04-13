import mongoose from "mongoose";
import ServiceProvider from "../../../models/ServiceProvider.model.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../../errors/Http.error.js";

// ------------------------
// CREATE Provider
// ------------------------
export const createProvider = async ({
    user,
    title,
    description,
    skills,
    experienceYears
}) => {

    try{
        const provider = await ServiceProvider.create({
            user,
            title,
            description,
            skills,
            experienceYears
        });
        return provider;
    }
    catch (err) {
        if (err.code === 11000) {
            throw new BadRequestError("Service provider already exists");
        }
        throw err;
    }
}

// ------------------------
// GET ALL Providers
// ------------------------
export const getAllProviders = async (filters = {}) => {
    const query = {};

    // Filter by approval
    if (filters.isApproved !== undefined) {
        query.isApproved =
        filters.isApproved === true || filters.isApproved === "true";
    }

    // Filter by user
    if (filters.user) {
        if (!mongoose.Types.ObjectId.isValid(filters.user)) {
        throw new Error("Invalid user ID");
        }
        query.user = filters.user;
    }

    // Filter by skills (any match)
    if (filters.skills) {
        const skillsArray = Array.isArray(filters.skills)
            ? filters.skills
            : filters.skills.split(",").map(s => s.trim().toLowerCase());
        query.skills = { $in: skillsArray };
    }

    // Filter by experience
    if (filters.minExperience) {
        query.experienceYears = { $gte: Number(filters.minExperience) };
    }

    const page = parseInt(filters.page || "1");
    const limit = parseInt(filters.limit || "20");
    const skip = (page - 1) * limit;

    const providers = await ServiceProvider.find(query)
        .populate("user", "name email avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return providers;
}

// ------------------------
// GET Provider By ID
// ------------------------
export const getProviderById = async (id) => {
    const provider = await ServiceProvider.findById(id).populate("user", "name email avatar");
    return provider;
}

// ------------------------
// UPDATE Provider
// ------------------------
export const updateProvider = async (id, updates, userId) => {

    const provider = await ServiceProvider.findById(id);
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


    await provider.save();
    return provider;
}

// ------------------------
// DELETE Provider
// ------------------------
export const deleteProvider = async (id, userId) => {

    const provider = await ServiceProvider.findById(id);
    if (!provider) throw new NotFoundError("Service provider not found");

    // Ownership check
    if (provider.user.toString() !== userId.toString()) {
        throw new UnauthorizedError("Not allowed to delete this service provider");
    }

    await provider.deleteOne();

    return { success: true };
}

// ------------------------
// BULK DELETE Providers
// ------------------------
export const bulkDeleteProviders = async (ids, userId) => {
    const deleted = await ServiceProvider.deleteMany({
        _id: { $in: ids },
        user: userId
    });

    return { success: true, deletedCount: deleted.deletedCount };
}