import logger from '../../logger';
import { CustomError, ValidationError, DatabaseError } from '../../errors';

describe('Errors', () => {
  describe('CustomError', () => {
    it('should create a custom error with all properties', () => {
      const error = new CustomError(
        400,
        'Test error',
        'TEST_ERROR',
        { field: 'value' }
      );

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Test error');
      expect(error.errorCode).toBe('TEST_ERROR');
      expect(error.details).toEqual({ field: 'value' });
    });
  });

  describe('ValidationError', () => {
    it('should create a validation error with 400 status code', () => {
      const error = new ValidationError('Invalid input', { field: 'error' });

      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
    });
  });

  describe('DatabaseError', () => {
    it('should create a database error with 500 status code', () => {
      const error = new DatabaseError('Connection failed');

      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe('DATABASE_ERROR');
    });
  });
});
