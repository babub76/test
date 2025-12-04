"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseHandler = void 0;
exports.withErrorHandling = withErrorHandling;
const _logger_1 = __importDefault(require("@logger"));
const _errors_1 = require("@errors");
class ResponseHandler {
    static success(data, statusCode = 200) {
        return {
            statusCode,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: true,
                data,
                timestamp: new Date().toISOString(),
            }),
        };
    }
    static error(error, requestId) {
        let statusCode = 500;
        let errorCode = 'INTERNAL_SERVER_ERROR';
        let message = 'An unexpected error occurred';
        let details;
        if (error instanceof _errors_1.CustomError) {
            statusCode = error.statusCode;
            errorCode = error.errorCode;
            message = error.message;
            details = error.details;
        }
        else {
            message = error.message || 'An unexpected error occurred';
        }
        _logger_1.default.error('Lambda error response', {
            requestId,
            statusCode,
            errorCode,
            message,
            details,
        });
        return {
            statusCode,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: false,
                error: {
                    code: errorCode,
                    message,
                    ...(details && { details }),
                    requestId,
                },
                timestamp: new Date().toISOString(),
            }),
        };
    }
}
exports.ResponseHandler = ResponseHandler;
async function withErrorHandling(handler, event, context) {
    const requestContext = {
        requestId: context.awsRequestId,
        functionName: context.functionName,
        timestamp: new Date().toISOString(),
    };
    try {
        _logger_1.default.info('Lambda invoked', {
            requestId: requestContext.requestId,
            method: event.httpMethod,
            path: event.path,
        });
        const result = await handler({
            event,
            context,
            requestContext,
        });
        _logger_1.default.info('Lambda execution completed successfully', {
            requestId: requestContext.requestId,
            statusCode: result.statusCode,
        });
        return result;
    }
    catch (error) {
        return ResponseHandler.error(error instanceof Error ? error : new Error(String(error)), requestContext.requestId);
    }
}
//# sourceMappingURL=response.js.map