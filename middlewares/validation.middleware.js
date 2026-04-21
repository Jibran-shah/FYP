import { BadRequestError, ValidationError } from "../errors/index.js";

/**
 * Joi validation middleware (body/query/params)
 */
export const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message
      }));

      return next(new ValidationError("Validation failed", errors));
    }

    /**
     * Store validated data separately (safe pattern)
     */
    req.validated = req.validated || {};
    req.validated[property] = value;

    next();
  };
};

/**
 * Validate file OR fileId (mutually exclusive rule)
 */
export const validateFileOrFileId = (req, res, next) => {
  const hasFile = !!req.file;
  const hasFileId = !!req.body.fileId;

  if (hasFile && hasFileId) {
    return next(new BadRequestError("Provide either file or fileId, not both"));
  }

  if (!hasFile && !hasFileId) {
    return next(new BadRequestError("Either file or fileId is required"));
  }
  
  next();
};