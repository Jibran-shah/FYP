import { Router } from "express";

import {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  deleteReport,
} from "./reports.controller.js";

// Joi schemas (you said you'll add later)
import {
  createReportSchema,
  updateReportStatusSchema,
  reportIdParamSchema,
} from "./reports.validation.js";
import { protect } from "../../middlewares/protect.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

const router = Router();

/**
 * =========================
 * CREATE REPORT
 * =========================
 * User reports an entity
 */
router.post(
  "/",
  protect(),
  validate(createReportSchema, "body"),
  createReport
);

/**
 * =========================
 * GET ALL REPORTS
 * =========================
 * Admin/moderation use
 */
router.get(
  "/",
  protect(),
  getReports
);

/**
 * =========================
 * GET SINGLE REPORT
 * =========================
 */
router.get(
  "/:reportId",
  protect(),
  validate(reportIdParamSchema, "params"),
  getReportById
);

/**
 * =========================
 * UPDATE REPORT STATUS
 * =========================
 * Admin updates status (PENDING → RESOLVED etc.)
 */
router.patch(
  "/:reportId/status",
  protect(),
  validate(reportIdParamSchema, "params"),
  validate(updateReportStatusSchema, "body"),
  updateReportStatus
);

/**
 * =========================
 * DELETE REPORT
 * =========================
 */
router.delete(
  "/:reportId",
  protect(),
  validate(reportIdParamSchema, "params"),
  deleteReport
);

export default router;