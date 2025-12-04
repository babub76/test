"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const _logger_1 = __importDefault(require("@logger"));
const response_1 = require("@utils/response");
const validator_1 = require("@utils/validator");
const joi_1 = __importDefault(require("joi"));
const postgres_1 = __importDefault(require("@database/postgres"));
const dynamodb_1 = __importDefault(require("@database/dynamodb"));
// Example handler implementation
async function handleRequest(req) {
    const { event, requestContext } = req;
    // Validate request body
    if (event.body) {
        const bodySchema = joi_1.default.object({
            name: joi_1.default.string().required(),
            email: joi_1.default.string().email().required(),
        });
        const validatedBody = validator_1.Validator.validateBody(bodySchema, JSON.parse(event.body));
        _logger_1.default.info('Request body validated', { validatedBody });
    }
    // Example: Query DynamoDB
    try {
        const dynamoResult = await dynamodb_1.default.query({
            TableName: 'YourTableName',
            KeyConditionExpression: 'pk = :pk',
            ExpressionAttributeValues: {
                ':pk': 'example-key',
            },
        });
        _logger_1.default.info('DynamoDB query result', {
            itemCount: dynamoResult.Items?.length,
        });
    }
    catch (error) {
        _logger_1.default.warn('DynamoDB query failed', { error: String(error) });
        // Handle gracefully or rethrow
    }
    // Example: Query PostgreSQL
    try {
        const pgResult = await postgres_1.default.query('SELECT * FROM users LIMIT 10');
        _logger_1.default.info('PostgreSQL query executed', {
            rowCount: pgResult.rowCount,
        });
    }
    catch (error) {
        _logger_1.default.warn('PostgreSQL query failed', { error: String(error) });
        // Handle gracefully or rethrow
    }
    return response_1.ResponseHandler.success({
        message: 'Request processed successfully',
        requestId: requestContext.requestId,
    });
}
const handler = async (event, context) => {
    return (0, response_1.withErrorHandling)(handleRequest, event, context);
};
exports.handler = handler;
//# sourceMappingURL=handler.js.map