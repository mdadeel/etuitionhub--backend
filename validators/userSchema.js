/**
 * User Validation Schema
 * Joi schemas for user registration and updates
 */
const Joi = require('joi');

// User creation/registration schema
const createUserSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email is required',
            'any.required': 'Email is required'
        }),

    displayName: Joi.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
            'string.min': 'Name must be at least 2 characters'
        }),

    photoURL: Joi.string()
        .uri()
        .optional()
        .allow(''),

    role: Joi.string()
        .valid('student', 'tutor', 'admin')
        .default('student')
        .messages({
            'any.only': 'Role must be student, tutor, or admin'
        }),

    mobileNumber: Joi.string()
        .pattern(/^(\+?880)?1[3-9]\d{8}$/)
        .optional()
        .allow('')
        .messages({
            'string.pattern.base': 'Please provide a valid BD mobile number'
        }),

    isVerified: Joi.boolean().default(false)
});

// User update schema - all fields optional
const updateUserSchema = Joi.object({
    displayName: Joi.string().min(2).max(50),
    photoURL: Joi.string().uri().allow(''),
    role: Joi.string().valid('student', 'tutor', 'admin'),
    mobileNumber: Joi.string().pattern(/^(\+?880)?1[3-9]\d{8}$/).allow(''),
    isVerified: Joi.boolean()
}).min(1);

// Login schema
const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email',
            'any.required': 'Email is required'
        }),

    password: Joi.string()
        .min(6)
        .optional()  // Firebase handles password
});

module.exports = {
    createUserSchema,
    updateUserSchema,
    loginSchema
};
