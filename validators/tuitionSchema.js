/**
 * Tuition Validation Schema
 * Using Joi for proper input validation instead of inline if-checks
 */
const Joi = require('joi');

// Create tuition schema
const createTuitionSchema = Joi.object({
    subject: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Subject is required',
            'string.min': 'Subject must be at least 2 characters',
            'any.required': 'Subject is required'
        }),

    class_name: Joi.string()
        .required()
        .messages({
            'string.empty': 'Class is required',
            'any.required': 'Class is required'
        }),

    location: Joi.string()
        .min(3)
        .max(200)
        .required()
        .messages({
            'string.empty': 'Location is required',
            'any.required': 'Location is required'
        }),

    salary: Joi.number()
        .min(1000)
        .max(50000)
        .default(5000)
        .messages({
            'number.min': 'Salary must be at least ৳1000',
            'number.max': 'Salary cannot exceed ৳50000'
        }),

    student_email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Invalid email format',
            'any.required': 'Student email is required'
        }),

    days_per_week: Joi.number()
        .min(1)
        .max(7)
        .optional(),

    status: Joi.string()
        .valid('pending', 'approved', 'rejected')
        .default('pending')
});

// Update tuition schema - all fields optional
const updateTuitionSchema = Joi.object({
    subject: Joi.string().min(2).max(100),
    class_name: Joi.string(),
    location: Joi.string().min(3).max(200),
    salary: Joi.number().min(1000).max(50000),
    days_per_week: Joi.number().min(1).max(7),
    status: Joi.string().valid('pending', 'approved', 'rejected')
}).min(1); // At least one field required for update

module.exports = {
    createTuitionSchema,
    updateTuitionSchema
};
