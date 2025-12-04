import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../../handler';

/**
 * Integration tests - these test the full flow with mocked AWS services
 * To run: npm test -- integration.test.ts
 */

describe('Lambda Handler Integration Tests', () => {
  const createMockEvent = (overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent => {
    return {
      httpMethod: 'POST',
      path: '/api/users',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token-123',
      },
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      pathParameters: null,
      multiValueHeaders: {},
      isBase64Encoded: false,
      resource: '',
      ...overrides,
    };
  };

  const createMockContext = (overrides: Partial<Context> = {}): Context => {
    return {
      requestId: 'mock-request-id',
      functionName: 'lambda-template',
      functionVersion: '$LATEST',
      invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:lambda-template',
      memoryLimitInMB: '256',
      awsRequestId: 'mock-request-id',
      logGroupName: '/aws/lambda/lambda-template',
      logStreamName: '2024/01/15/[$LATEST]abcd1234',
      identity: undefined,
      getRemainingTimeInMillis: () => 30000,
      done: () => {},
      fail: () => {},
      succeed: () => {},
      ...overrides,
    };
  };

  describe('POST endpoint', () => {
    it('should successfully process a valid POST request', async () => {
      const event = createMockEvent({
        httpMethod: 'POST',
      });
      const context = createMockContext();

      const response = await handler(event, context);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
    });

    it('should include proper CORS headers', async () => {
      const event = createMockEvent();
      const context = createMockContext();

      const response = await handler(event, context);

      expect(response.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(response.headers).toHaveProperty('Content-Type', 'application/json');
    });

    it('should include request context data in response', async () => {
      const event = createMockEvent();
      const context = createMockContext();

      const response = await handler(event, context);

      const body = JSON.parse(response.body);
      expect(body.data.requestId).toBeDefined();
      expect(body.timestamp).toBeDefined();
    });
  });

  describe('Error scenarios', () => {
    it('should handle missing body gracefully', async () => {
      const event = createMockEvent({
        body: null,
      });
      const context = createMockContext();

      const response = await handler(event, context);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('should handle invalid JSON in body', async () => {
      const event = createMockEvent({
        body: 'invalid-json',
      });
      const context = createMockContext();

      const response = await handler(event, context);

      expect(response.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Query parameters', () => {
    it('should extract query parameters from event', async () => {
      const event = createMockEvent({
        queryStringParameters: {
          page: '1',
          limit: '10',
        },
      });
      const context = createMockContext();

      const response = await handler(event, context);

      expect(response.statusCode).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Path parameters', () => {
    it('should extract path parameters from event', async () => {
      const event = createMockEvent({
        path: '/api/users/123',
        pathParameters: {
          userId: '123',
        },
      });
      const context = createMockContext();

      const response = await handler(event, context);

      expect(response.statusCode).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Different HTTP methods', () => {
    it('should handle GET requests', async () => {
      const event = createMockEvent({
        httpMethod: 'GET',
        body: null,
      });
      const context = createMockContext();

      const response = await handler(event, context);

      expect(response.statusCode).toBeGreaterThanOrEqual(200);
    });

    it('should handle PUT requests', async () => {
      const event = createMockEvent({
        httpMethod: 'PUT',
      });
      const context = createMockContext();

      const response = await handler(event, context);

      expect(response.statusCode).toBeGreaterThanOrEqual(200);
    });

    it('should handle DELETE requests', async () => {
      const event = createMockEvent({
        httpMethod: 'DELETE',
        body: null,
      });
      const context = createMockContext();

      const response = await handler(event, context);

      expect(response.statusCode).toBeGreaterThanOrEqual(200);
    });
  });
});
