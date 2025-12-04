"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
const errors_1 = require("../errors");
class Validator {
    static validateBody(schema, data) {
        const { error, value } = schema.validate(data, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const details = error.details.reduce((acc, detail) => {
                acc[detail.path.join('.')] = detail.message;
                return acc;
            }, {});
            throw new errors_1.ValidationError('Request validation failed', details);
        }
        return value;
    }
    static validateQuery(schema, data) {
        return this.validateBody(schema, data);
    }
    static validateParams(schema, data) {
        return this.validateBody(schema, data);
    }
}
exports.Validator = Validator;
//# sourceMappingURL=validator.js.map