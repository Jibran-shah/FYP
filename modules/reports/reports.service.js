import Report from "../models/Report.model.js";
import { REPORT_ENTITY_TYPES } from "../models/Report.model.js";

/**
 * =========================
 * CREATE REPORT
 * =========================
 */
export const createReportService = async ({
  reporterId,
  entityId,
  entityType,
  description,
}) => {
  // Optional safety check (defensive programming)
  if (!REPORT_ENTITY_TYPES.includes(entityType)) {
    throw new Error("Invalid entity type");
  }

  const report = await Report.create({
    reporter: reporterId,
    entityId,
    entityType,
    description,
  });

  return report;
};

/**
 * =========================
 * GET ALL REPORTS (ADMIN)
 * Supports filtering + pagination
 * =========================
 */
export const getReportsService = async ({ query = {} }) => {
  const {
    status,
    entityType,
    page = 1,
    limit = 20,
  } = query;

  const filter = {};

  if (status) filter.status = status;
  if (entityType) filter.entityType = entityType;

  const skip = (Number(page) - 1) * Number(limit);

  const reports = await Report.find(filter)
    .populate("reporter", "name email")
    .populate("entityId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Report.countDocuments(filter);

  return {
    reports,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * =========================
 * GET SINGLE REPORT
 * =========================
 */
export const getReportByIdService = async ({
  reportId,
}) => {
  const report = await Report.findById(reportId)
    .populate("reporter", "name email")
    .populate("entityId");

  if (!report) {
    throw new Error("Report not found");
  }

  return report;
};

/**
 * =========================
 * UPDATE REPORT STATUS
 * =========================
 */
export const updateReportStatusService = async ({
  reportId,
  status,
  adminId,
}) => {
  const report = await Report.findById(reportId);

  if (!report) {
    throw new Error("Report not found");
  }

  report.status = status;
  report.reviewedBy = adminId; // optional field if you add later
  report.reviewedAt = new Date();

  await report.save();

  return report;
};

/**
 * =========================
 * DELETE REPORT
 * =========================
 */
export const deleteReportService = async ({
  reportId,
  adminId,
}) => {
  const report = await Report.findById(reportId);

  if (!report) {
    throw new Error("Report not found");
  }

  await Report.deleteOne({ _id: reportId });

  return {
    success: true,
    deletedId: reportId,
  };
};