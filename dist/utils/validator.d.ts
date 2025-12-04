import Joi from 'joi';
export interface ValidatedData {
    [key: string]: unknown;
}
export declare class Validator {
    static validateBody(schema: Joi.ObjectSchema, data: unknown): ValidatedData;
    static validateQuery(schema: Joi.ObjectSchema, data: unknown): ValidatedData;
    static validateParams(schema: Joi.ObjectSchema, data: unknown): ValidatedData;
}
//# sourceMappingURL=validator.d.ts.map