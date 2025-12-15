/**
 * Centralized validation utilities
 * Moved here to avoid duplication across route files - DRY principle
 */
const mongoose = require('mongoose');

/**
 * Validates MongoDB ObjectId format
 * Using mongoose built-in validator rather than regex - more reliable
 * @param {string} id - The ID string to validate
 * @returns {boolean}
 */
const isValidObjectId = (id) => {
    if (!id) return false;
    return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Basic email format validation
 * Not exhaustive - Firebase/backend will do proper validation
 * This is just for quick sanity check
 */
const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    // simple regex - covers most cases
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

/**
 * Phone number validation for BD numbers
 * Accepts formats: 01XXXXXXXXX, +8801XXXXXXXXX
 */
const isValidBDPhone = (phone) => {
    if (!phone) return true; // optional field
    const cleaned = phone.replace(/[\s-]/g, '');
    return /^(\+?880)?1[3-9]\d{8}$/.test(cleaned);
};

/**
 * Salary range validation
 * Business rule: tuition salary should be between 1000-50000 BDT
 */
const isValidSalary = (salary) => {
    const num = Number(salary);
    if (isNaN(num)) return false;
    return num >= 1000 && num <= 50000;
};

module.exports = {
    isValidObjectId,
    isValidEmail,
    isValidBDPhone,
    isValidSalary
};
