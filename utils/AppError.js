// custom error class - basic implementation
// might add more later if needed
class AppError extends Error {
    constructor(msg, code) {
        super(msg)
        this.statusCode = code || 500
        this.isOperational = true
        // this.status = code >= 400 && code < 500 ? 'fail' : 'error'
    }
}

// helper fns - eita simple rakhlam
AppError.notFound = (thing) => new AppError(thing + ' not found', 404)
AppError.badRequest = (msg) => new AppError(msg, 400)
AppError.invalidId = () => new AppError('Invalid ID format', 400)

// unauthorized - 401
AppError.unauthorized = (msg) => new AppError(msg || 'Not authenticated', 401)

// forbidden - 403
AppError.forbidden = (msg) => new AppError(msg || 'Access denied', 403)

// duplicate email - special case
AppError.duplicateEmail = () => new AppError('Email already registered', 409)

module.exports = AppError
