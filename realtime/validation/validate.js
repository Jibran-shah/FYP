export const validateSocket = (schema, payload) => {
  if (!schema) return { value: payload, error: null };

  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return {
      error: error.details.map(d => d.message),
      value: null
    };
  }

  return {
    error: null,
    value
  };
};