export class CustomError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errorCode: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CustomError';
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(400, message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(500, message, 'DATABASE_ERROR', details);
    this.name = 'DatabaseError';
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(404, message, 'NOT_FOUND', details);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(401, message, 'UNAUTHORIZED', details);
    this.name = 'UnauthorizedError';
  }
}

export class InternalServerError extends CustomError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(500, message, 'INTERNAL_SERVER_ERROR', details);
    this.name = 'InternalServerError';
  }
}
