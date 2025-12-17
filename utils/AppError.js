/**
 * Custom Error Class for Operational Errors
 * Distinguishes between expected errors (bad input) vs programming bugs
 */
class AppError extends Error {
    constructor(message, statusCode, errorCode = null) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Factory methods for common error types
AppError.badRequest = (message, code) => new AppError(message, 400, code);
AppError.unauthorized = (message = 'Not authenticated') => new AppError(message, 401, 'UNAUTHORIZED');
AppError.forbidden = (message = 'Not authorized') => new AppError(message, 403, 'FORBIDDEN');
AppError.notFound = (resource = 'Resource') => new AppError(`${resource} not found`, 404, 'NOT_FOUND');
AppError.conflict = (message, code = 'CONFLICT') => new AppError(message, 409, code);
AppError.internal = (message = 'Something went wrong') => new AppError(message, 500, 'INTERNAL_ERROR');

// Common business errors
AppError.duplicateEmail = () => new AppError('This email is already registered', 409, 'DUPLICATE_EMAIL');
AppError.invalidId = () => new AppError('Invalid ID format', 400, 'INVALID_ID');
AppError.sessionExpired = () => new AppError('Your session has expired, please login again', 401, 'SESSION_EXPIRED');

module.exports = AppError;
