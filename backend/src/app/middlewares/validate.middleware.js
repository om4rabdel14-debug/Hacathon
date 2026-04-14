const BadRequestError = require('../../core/errors/BadRequestError');

/**
 * Creates a validation middleware from a Zod schema.
 * Validates req.body by default, or a custom source.
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const messages = result.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      throw new BadRequestError(`Validation error: ${messages}`);
    }

    // Replace with parsed (and coerced) values
    req[source] = result.data;
    next();
  };
}

module.exports = validate;
