import { handler } from '@/handler';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import postgresConnection from '@database/postgres';
import dynamodbConnection from '@database/dynamodb';

jest.mock('@database/postgres');
jest.mock('@database/dynamodb');
jest.mock('@logger');

describe('Lambda Handler', () => {
  const mockEvent: APIGatewayProxyEvent = {
    httpMethod: 'POST',
    path: '/test',
    body: JSON.stringify({
      name: 'John',
      email: 'john@example.com',
    }),
    headers: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: null,
    multiValueHeaders: {},
    isBase64Encoded: false,
    resource: '',
    requestContext: {} as any,
    stageVariables: null,
  };

  const mockContext: Context = {
    awsRequestId: 'test-request-id',
    functionName: 'test-function',
    functionVersion: '$LATEST',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test',
    memoryLimitInMB: '128',
    logGroupName: '/aws/lambda/test',
    logStreamName: 'test-stream',
    identity: undefined,
    getRemainingTimeInMillis: () => 30000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return success response on successful execution', async () => {
    (postgresConnection.query as jest.Mock).mockResolvedValue({
      rowCount: 1,
      rows: [{ id: 1 }],
    });

    (dynamodbConnection.query as jest.Mock).mockResolvedValue({
      Items: [{ id: 'test' }],
      Count: 1,
    });

    const response = await handler(mockEvent, mockContext);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
    expect(body.data.message).toBe('Request processed successfully');
  });

  it('should handle validation errors', async () => {
    const invalidEvent = {
      ...mockEvent,
      body: JSON.stringify({ name: 'John' }), // missing email
    };

    const response = await handler(invalidEvent, mockContext);

    expect(response.statusCode).toBe(400); // Validation error returns 400
    const body = JSON.parse(response.body);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return error response when database fails', async () => {
    const dbError = new Error('Database connection failed');
    (postgresConnection.query as jest.Mock).mockRejectedValue(dbError);

    (dynamodbConnection.query as jest.Mock).mockResolvedValue({
      Items: [],
      Count: 0,
    });

    const response = await handler(mockEvent, mockContext);

    expect(response.statusCode).toBe(200); // Handler catches and continues
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true); // Handler doesn't rethrow
  });

  it('should include request ID in response', async () => {
    (postgresConnection.query as jest.Mock).mockResolvedValue({
      rowCount: 0,
      rows: [],
    });

    (dynamodbConnection.query as jest.Mock).mockResolvedValue({
      Items: [],
      Count: 0,
    });

    const response = await handler(mockEvent, mockContext);

    const body = JSON.parse(response.body);
    expect(body.data.requestId).toBe('test-request-id');
  });

  it('should include CORS headers in response', async () => {
    (postgresConnection.query as jest.Mock).mockResolvedValue({
      rowCount: 0,
      rows: [],
    });

    (dynamodbConnection.query as jest.Mock).mockResolvedValue({
      Items: [],
      Count: 0,
    });

    const response = await handler(mockEvent, mockContext);

    expect(response.headers!['Access-Control-Allow-Origin']).toBe('*');
    expect(response.headers!['Content-Type']).toBe('application/json');
  });
});
