import { BadRequestError } from "../errors/index.js";

export const validate = (schema, property = "body") => {
  return (req, res, next) => {
    console.log("\n================ VALIDATION DEBUG ================");
    console.log("📥 Incoming property:", property);
    console.log("📦 Raw req.body:", req.body);
    console.log("📦 Raw req.query:", req.query);
    console.log("📦 Raw req.params:", req.params);

    const payload = req[property];

    // 🚨 HARD BLOCK undefined / null
    if (payload === undefined || payload === null) {
      console.log("❌ VALIDATION BLOCKED: payload is missing");

      return next(
        new BadRequestError(
          `${property} is required but was not provided`
        )
      );
    }

    // Optional extra safety (prevents weird cases like string payloads)
    if (property === "body" && typeof payload !== "object") {
      console.log("❌ VALIDATION BLOCKED: invalid body type", typeof payload);

      return next(
        new BadRequestError("Request body must be a valid JSON object")
      );
    }

    console.log("📨 Payload sent to Joi:", payload);

    const { error, value } = schema.validate(payload, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message,
        type: d.type,
        received: d.context?.value,
      }));

      console.log("❌ VALIDATION FAILED:");
      errors.forEach((e) => {
        console.log(`   → Field: ${e.field}`);
        console.log(`     Message: ${e.message}`);
        console.log(`     Received:`, e.received);
      });

      return next(new BadRequestError("Validation failed", errors));
    }

    console.log("✅ VALIDATION PASSED");
    console.log("✔️ Clean value:", value);
    console.log("================================================\n");

    req.validated = req.validated || {};
    req.validated[property] = value;

    next();
  };
};