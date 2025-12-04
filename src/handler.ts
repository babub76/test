import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import logger from './logger';
import { withErrorHandling, ResponseHandler, LambdaRequest } from './utils/response';
import { Validator } from './utils/validator';
import Joi from 'joi';
import postgresConnection from './database/postgres';
import dynamodbConnection from './database/dynamodb';

// Example handler implementation
async function handleRequest(req: LambdaRequest): Promise<APIGatewayProxyResult> {
  const { event, context, requestContext } = req;

  // Validate request body
  if (event.body) {
    const bodySchema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
    });

    const validatedBody = Validator.validateBody(bodySchema, JSON.parse(event.body));
    logger.info('Request body validated', { validatedBody });
  }

  // Example: Query DynamoDB
  try {
    const dynamoResult = await dynamodbConnection.query({
      TableName: 'YourTableName',
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: {
        ':pk': 'example-key',
      },
    });

    logger.info('DynamoDB query result', {
      itemCount: dynamoResult.Items?.length,
    });
  } catch (error) {
    logger.warn('DynamoDB query failed', { error: String(error) });
    // Handle gracefully or rethrow
  }

  // Example: Query PostgreSQL
  try {
    const pgResult = await postgresConnection.query(
      'SELECT * FROM users LIMIT 10'
    );
    logger.info('PostgreSQL query executed', {
      rowCount: (pgResult as any).rowCount,
    });
  } catch (error) {
    logger.warn('PostgreSQL query failed', { error: String(error) });
    // Handle gracefully or rethrow
  }

  return ResponseHandler.success({
    message: 'Request processed successfully',
    requestId: requestContext.requestId,
  });
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return withErrorHandling(handleRequest, event, context);
};
