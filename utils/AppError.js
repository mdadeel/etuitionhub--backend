/**
 * Custom Error class for operational errors
 * Distinguishes between expected errors (bad input) vs programming bugs
 * 
 * Usage: throw new AppError('Email already exists', 409, 'DUPLICATE_EMAIL')
 */
class AppError extends Error {
    constructor(message, statusCode, errorCode = null) {
        super(message);

        this.statusCode = statusCode;
        this.errorCode = errorCode;  // machine-readable code for frontend
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;  // distinguishes from programming errors

        // Capture stack trace, excluding constructor call
        Error.captureStackTrace(this, this.constructor);
    }
}

// Common error factory methods - makes code more readable
AppError.badRequest = (message, code) => new AppError(message, 400, code);
AppError.unauthorized = (message = 'Not authenticated') => new AppError(message, 401, 'UNAUTHORIZED');
AppError.forbidden = (message = 'Not authorized') => new AppError(message, 403, 'FORBIDDEN');
AppError.notFound = (resource = 'Resource') => new AppError(`${resource} not found`, 404, 'NOT_FOUND');
AppError.conflict = (message, code = 'CONFLICT') => new AppError(message, 409, code);
AppError.internal = (message = 'Something went wrong') => new AppError(message, 500, 'INTERNAL_ERROR');

// Specific business errors
AppError.duplicateEmail = () => new AppError('This email is already registered', 409, 'DUPLICATE_EMAIL');
AppError.invalidId = () => new AppError('Invalid ID format', 400, 'INVALID_ID');
AppError.sessionExpired = () => new AppError('Your session has expired, please login again', 401, 'SESSION_EXPIRED');

module.exports = AppError;
