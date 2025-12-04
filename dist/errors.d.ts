export declare class CustomError extends Error {
    statusCode: number;
    message: string;
    errorCode: string;
    details?: Record<string, unknown> | undefined;
    constructor(statusCode: number, message: string, errorCode: string, details?: Record<string, unknown> | undefined);
}
export declare class ValidationError extends CustomError {
    constructor(message: string, details?: Record<string, unknown>);
}
export declare class DatabaseError extends CustomError {
    constructor(message: string, details?: Record<string, unknown>);
}
export declare class NotFoundError extends CustomError {
    constructor(message: string, details?: Record<string, unknown>);
}
export declare class UnauthorizedError extends CustomError {
    constructor(message: string, details?: Record<string, unknown>);
}
export declare class InternalServerError extends CustomError {
    constructor(message: string, details?: Record<string, unknown>);
}
//# sourceMappingURL=errors.d.ts.map