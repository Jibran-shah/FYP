import {
  createReportService,
  getReportsService,
  getReportByIdService,
  updateReportStatusService,
  deleteReportService,
} from "./reports.service.js";

/**
 * =========================
 * CREATE REPORT
 * =========================
 */
export const createReport = async (req, res) => {
  const result = await createReportService({
    reporterId: req.user._id,
    ...req.body,
  });

  return res.status(201).json({
    success: true,
    data: result,
  });
};

/**
 * =========================
 * GET ALL REPORTS
 * =========================
 * Supports admin moderation listing
 */
export const getReports = async (req, res) => {
  const result = await getReportsService({
    query: req.query,
  });

  return res.status(200).json({
    success: true,
    data: result,
  });
};

/**
 * =========================
 * GET SINGLE REPORT
 * =========================
 */
export const getReportById = async (req, res) => {
  const result = await getReportByIdService({
    reportId: req.params.reportId,
  });

  return res.status(200).json({
    success: true,
    data: result,
  });
};

/**
 * =========================
 * UPDATE REPORT STATUS
 * =========================
 */
export const updateReportStatus = async (req, res) => {
  const result = await updateReportStatusService({
    reportId: req.params.reportId,
    status: req.body.status,
    adminId: req.user._id,
  });

  return res.status(200).json({
    success: true,
    data: result,
  });
};

/**
 * =========================
 * DELETE REPORT
 * =========================
 */
export const deleteReport = async (req, res) => {
  const result = await deleteReportService({
    reportId: req.params.reportId,
    adminId: req.user._id,
  });

  return res.status(200).json({
    success: true,
    data: result,
  });
};