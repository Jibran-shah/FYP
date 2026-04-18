import { ValidationError } from "../errors/index.js";

/**
 * Middleware to validate request body using a Joi schema
 */

export const validate = (schema, property = "body") => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path.join("."),
      message: d.message,
    }));

    throw new ValidationError("Validation failed", errors);
  }

  // safe assignment for all cases
  Object.assign(req[property], value);

  next();
};



export const validateFileOrFileId = (req, res, next) => {
  const hasFile = !!req.file;
  const hasFileId = !!req.body.fileId;

  if (hasFile && hasFileId) {
    return res.status(400).json({
      success: false,
      message: "Provide either file or fileId, not both"
    });
  }

  if (!hasFile && !hasFileId) {
    return res.status(400).json({
      success: false,
      message: "Either file or fileId is required"
    });
  }

  next();
};