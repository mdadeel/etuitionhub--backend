/**
 * Validation Middleware Factory
 * 
 * Creates Express middleware from Joi schemas
 * Replaces inline if-checks with proper schema validation
 * 
 * Usage in routes:
 *   router.post('/', validate(createTuitionSchema), controller.create);
 */
const AppError = require('../utils/AppError');

/**
 * Creates validation middleware from a Joi schema
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const dataToValidate = req[property];

        const { error, value } = schema.validate(dataToValidate, {
            abortEarly: false,  // Return all errors, not just first one
            stripUnknown: true  // Remove unknown fields
        });

        if (error) {
            // Format error messages nicely
            const errorMessages = error.details.map(detail => detail.message);

            // Use first error as main message
            const mainError = errorMessages[0];

            return res.status(400).json({
                error: mainError,
                errorCode: 'VALIDATION_ERROR',
                details: errorMessages.length > 1 ? errorMessages : undefined
            });
        }

        // Replace body with validated/sanitized data
        req[property] = value;
        next();
    };
};

/**
 * Shorthand validators for common schemas
 */
const { createTuitionSchema, updateTuitionSchema } = require('./tuitionSchema');
const { createUserSchema, updateUserSchema, loginSchema } = require('./userSchema');

module.exports = {
    validate,

    // Pre-configured middleware
    validateCreateTuition: validate(createTuitionSchema),
    validateUpdateTuition: validate(updateTuitionSchema),
    validateCreateUser: validate(createUserSchema),
    validateUpdateUser: validate(updateUserSchema),
    validateLogin: validate(loginSchema)
};
