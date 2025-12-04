"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const _logger_1 = __importDefault(require("@logger"));
const _errors_1 = require("@errors");
const dynamodb = new aws_sdk_1.default.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION || 'us-east-1'
});
class DynamoDBConnection {
    async get(params) {
        try {
            _logger_1.default.debug('DynamoDB get operation', { table: params.TableName, key: params.Key });
            const result = await dynamodb.get(params).promise();
            return result;
        }
        catch (error) {
            _logger_1.default.error('DynamoDB get operation failed', { error: String(error), table: params.TableName });
            throw new _errors_1.DatabaseError('DynamoDB get operation failed', { originalError: String(error) });
        }
    }
    async put(params) {
        try {
            _logger_1.default.debug('DynamoDB put operation', { table: params.TableName });
            const result = await dynamodb.put(params).promise();
            return result;
        }
        catch (error) {
            _logger_1.default.error('DynamoDB put operation failed', { error: String(error), table: params.TableName });
            throw new _errors_1.DatabaseError('DynamoDB put operation failed', { originalError: String(error) });
        }
    }
    async update(params) {
        try {
            _logger_1.default.debug('DynamoDB update operation', { table: params.TableName });
            const result = await dynamodb.update(params).promise();
            return result;
        }
        catch (error) {
            _logger_1.default.error('DynamoDB update operation failed', { error: String(error), table: params.TableName });
            throw new _errors_1.DatabaseError('DynamoDB update operation failed', { originalError: String(error) });
        }
    }
    async delete(params) {
        try {
            _logger_1.default.debug('DynamoDB delete operation', { table: params.TableName });
            const result = await dynamodb.delete(params).promise();
            return result;
        }
        catch (error) {
            _logger_1.default.error('DynamoDB delete operation failed', { error: String(error), table: params.TableName });
            throw new _errors_1.DatabaseError('DynamoDB delete operation failed', { originalError: String(error) });
        }
    }
    async query(params) {
        try {
            _logger_1.default.debug('DynamoDB query operation', { table: params.TableName });
            const result = await dynamodb.query(params).promise();
            return result;
        }
        catch (error) {
            _logger_1.default.error('DynamoDB query operation failed', { error: String(error), table: params.TableName });
            throw new _errors_1.DatabaseError('DynamoDB query operation failed', { originalError: String(error) });
        }
    }
    async scan(params) {
        try {
            _logger_1.default.debug('DynamoDB scan operation', { table: params.TableName });
            const result = await dynamodb.scan(params).promise();
            return result;
        }
        catch (error) {
            _logger_1.default.error('DynamoDB scan operation failed', { error: String(error), table: params.TableName });
            throw new _errors_1.DatabaseError('DynamoDB scan operation failed', { originalError: String(error) });
        }
    }
}
exports.default = new DynamoDBConnection();
//# sourceMappingURL=dynamodb.js.map