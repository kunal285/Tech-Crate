/**
 * Zod Request Validation Middleware
 * Validates request payload against schema and returns formatted errors.
 */

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsed = schema.parse(dataToValidate);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const errorMessages = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return res.status(400).json({
          success: false,
          message: errorMessages[0]?.message || 'Validation error',
          code: 'VALIDATION_FAILED',
          errors: errorMessages,
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Invalid request payload',
        code: 'VALIDATION_FAILED',
      });
    }
  };
};

module.exports = { validate };
