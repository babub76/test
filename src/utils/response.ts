import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import logger from '@logger';
import { CustomError } from '@errors';

interface RequestContext {
  requestId: string;
  functionName: string;
  timestamp: string;
  userId?: string;
}

export interface LambdaRequest {
  event: APIGatewayProxyEvent;
  context: Context;
  requestContext: RequestContext;
}

export class ResponseHandler {
  static success(data: unknown, statusCode: number = 200): APIGatewayProxyResult {
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

  static error(error: Error | CustomError, requestId: string): APIGatewayProxyResult {
    let statusCode = 500;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details: Record<string, unknown> | undefined;

    if (error instanceof CustomError) {
      statusCode = error.statusCode;
      errorCode = error.errorCode;
      message = error.message;
      details = error.details;
    } else {
      message = error.message || 'An unexpected error occurred';
    }

    logger.error('Lambda error response', {
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

export async function withErrorHandling(
  handler: (req: LambdaRequest) => Promise<APIGatewayProxyResult>,
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const requestContext: RequestContext = {
    requestId: context.awsRequestId,
    functionName: context.functionName,
    timestamp: new Date().toISOString(),
  };

  try {
    logger.info('Lambda invoked', {
      requestId: requestContext.requestId,
      method: event.httpMethod,
      path: event.path,
    });

    const result = await handler({
      event,
      context,
      requestContext,
    });

    logger.info('Lambda execution completed successfully', {
      requestId: requestContext.requestId,
      statusCode: result.statusCode,
    });

    return result;
  } catch (error) {
    return ResponseHandler.error(
      error instanceof Error ? error : new Error(String(error)),
      requestContext.requestId
    );
  }
}
