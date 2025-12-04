import { Validator } from '@utils/validator';
import Joi from 'joi';

describe('Validator', () => {
  describe('validateBody', () => {
    it('should validate valid data', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().required(),
      });

      const data = { name: 'John', age: 30 };
      const result = Validator.validateBody(schema, data);

      expect(result.name).toBe('John');
      expect(result.age).toBe(30);
    });

    it('should throw ValidationError for invalid data', () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
      });

      const data = { email: 'invalid-email' };

      expect(() => {
        Validator.validateBody(schema, data);
      }).toThrow();

      // Also test the error properties
      try {
        Validator.validateBody(schema, data);
      } catch (error: any) {
        expect(error.errorCode).toBe('VALIDATION_ERROR');
        expect(error.statusCode).toBe(400);
      }
    });

    it('should throw ValidationError for missing required field', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });

      const data = {};

      expect(() => {
        Validator.validateBody(schema, data);
      }).toThrow();

      // Also test the error properties
      try {
        Validator.validateBody(schema, data);
      } catch (error: any) {
        expect(error.errorCode).toBe('VALIDATION_ERROR');
        expect(error.statusCode).toBe(400);
      }
    });

    it('should strip unknown fields', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });

      const data = { name: 'John', extraField: 'should-be-removed' };
      const result = Validator.validateBody(schema, data);

      expect(result.name).toBe('John');
      expect((result as any).extraField).toBeUndefined();
    });
  });

  describe('validateQuery', () => {
    it('should validate query parameters', () => {
      const schema = Joi.object({
        page: Joi.string().default('1'),
        limit: Joi.string().default('10'),
      });

      const query = { page: '2', limit: '20' };
      const result = Validator.validateQuery(schema, query);

      expect(result.page).toBe('2');
    });
  });
});
