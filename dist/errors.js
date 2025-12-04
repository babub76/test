"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.UnauthorizedError = exports.NotFoundError = exports.DatabaseError = exports.ValidationError = exports.CustomError = void 0;
class CustomError extends Error {
    constructor(statusCode, message, errorCode, details) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.errorCode = errorCode;
        this.details = details;
        this.name = 'CustomError';
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}
exports.CustomError = CustomError;
class ValidationError extends CustomError {
    constructor(message, details) {
        super(400, message, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class DatabaseError extends CustomError {
    constructor(message, details) {
        super(500, message, 'DATABASE_ERROR', details);
        this.name = 'DatabaseError';
    }
}
exports.DatabaseError = DatabaseError;
class NotFoundError extends CustomError {
    constructor(message, details) {
        super(404, message, 'NOT_FOUND', details);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends CustomError {
    constructor(message, details) {
        super(401, message, 'UNAUTHORIZED', details);
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class InternalServerError extends CustomError {
    constructor(message, details) {
        super(500, message, 'INTERNAL_SERVER_ERROR', details);
        this.name = 'InternalServerError';
    }
}
exports.InternalServerError = InternalServerError;
//# sourceMappingURL=errors.js.map