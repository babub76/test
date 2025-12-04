import Joi from 'joi';
import { ValidationError } from '../errors';

export interface ValidatedData {
  [key: string]: unknown;
}

export class Validator {
  static validateBody(schema: Joi.ObjectSchema, data: unknown): ValidatedData {
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.reduce(
        (acc, detail) => {
          acc[detail.path.join('.')] = detail.message;
          return acc;
        },
        {} as Record<string, string>
      );

      throw new ValidationError('Request validation failed', details);
    }

    return value as ValidatedData;
  }

  static validateQuery(schema: Joi.ObjectSchema, data: unknown): ValidatedData {
    return this.validateBody(schema, data);
  }

  static validateParams(schema: Joi.ObjectSchema, data: unknown): ValidatedData {
    return this.validateBody(schema, data);
  }
}
