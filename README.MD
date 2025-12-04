# AWS Lambda Template

A comprehensive AWS Lambda template for Node.js with PostgreSQL and DynamoDB integration, featuring proper logging, error handling, and unit tests.

## Features

- ✅ **Structured Logging** - Winston-based logging with multiple transports
- ✅ **Error Handling** - Custom error classes for different scenarios
- ✅ **Request Validation** - Joi schema validation for request data
- ✅ **Database Integration** - PostgreSQL connection pooling and DynamoDB wrapper
- ✅ **Unit Tests** - Jest with comprehensive test coverage
- ✅ **TypeScript** - Full type safety and modern ES2020 features
- ✅ **Response Standardization** - Consistent response format across all endpoints
- ✅ **Environment Configuration** - .env support for different environments

## Project Structure

```
.
├── src/
│   ├── __tests__/                 # Unit tests
│   │   ├── database/
│   │   │   ├── dynamodb.test.ts
│   │   │   └── postgres.test.ts
│   │   ├── utils/
│   │   │   ├── response.test.ts
│   │   │   └── validator.test.ts
│   │   ├── errors.test.ts
│   │   └── handler.test.ts
│   ├── database/
│   │   ├── dynamodb.ts            # DynamoDB wrapper
│   │   └── postgres.ts            # PostgreSQL connection pool
│   ├── utils/
│   │   ├── response.ts            # Response handler and error handling
│   │   └── validator.ts           # Request validation utilities
│   ├── errors.ts                  # Custom error classes
│   ├── logger.ts                  # Logging configuration
│   └── handler.ts                 # Lambda handler entry point
├── dist/                          # Compiled JavaScript (after build)
├── package.json
├── tsconfig.json
├── jest.config.json
├── .eslintrc.json
├── .env.example
└── README.md
```

## Installation

1. **Clone the template repository**
```bash
git clone <template-repo-url>
cd aws-lambda-template
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Development

### Build
```bash
npm run build
```

### Development with hot reload
```bash
npm run dev
```

### Run tests
```bash
npm test
```

### Watch tests
```bash
npm run test:watch
```

### Linting
```bash
npm run lint
```

### Clean build artifacts
```bash
npm run clean
```

## Usage Guide

### 1. Creating a New Lambda

Clone this template and replace the `handleRequest` function in `src/handler.ts`:

```typescript
async function handleRequest(req: LambdaRequest): Promise<APIGatewayProxyResult> {
  const { event, context, requestContext } = req;

  // Your implementation here
  
  return ResponseHandler.success({
    message: 'Your response data',
  });
}
```

### 2. Logging

Use the logger throughout your code:

```typescript
import logger from './logger';

logger.info('Operation started', { userId: 123 });
logger.error('Operation failed', { error: err.message });
logger.debug('Debug information', { data: someData });
logger.warn('Warning message', { warning: 'details' });
```

### 3. Request Validation

Validate incoming requests using Joi schemas:

```typescript
import { Validator } from './utils/validator';
import Joi from 'joi';

const bodySchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  age: Joi.number().min(18),
});

try {
  const validatedData = Validator.validateBody(bodySchema, JSON.parse(event.body!));
  logger.info('Validation passed', { data: validatedData });
} catch (error) {
  // ValidationError automatically handled by error handler
  throw error;
}
```

### 4. PostgreSQL Integration

Query PostgreSQL using the connection pool:

```typescript
import postgresConnection from './database/postgres';

try {
  const result = await postgresConnection.query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );
  logger.info('User retrieved', { rowCount: (result as any).rowCount });
} catch (error) {
  // DatabaseError automatically handled
  logger.error('Database query failed', { error: String(error) });
}
```

### 5. DynamoDB Integration

Interact with DynamoDB using the wrapper:

```typescript
import dynamodbConnection from './database/dynamodb';

// Get item
const item = await dynamodbConnection.get({
  TableName: 'Users',
  Key: { userId: 'user-123' },
});

// Put item
await dynamodbConnection.put({
  TableName: 'Users',
  Item: { userId: 'user-123', name: 'John' },
});

// Query
const results = await dynamodbConnection.query({
  TableName: 'Users',
  KeyConditionExpression: 'pk = :pk',
  ExpressionAttributeValues: {
    ':pk': 'USER#123',
  },
});

// Update
await dynamodbConnection.update({
  TableName: 'Users',
  Key: { userId: 'user-123' },
  UpdateExpression: 'SET #name = :name',
  ExpressionAttributeNames: { '#name': 'name' },
  ExpressionAttributeValues: { ':name': 'Jane' },
});

// Delete
await dynamodbConnection.delete({
  TableName: 'Users',
  Key: { userId: 'user-123' },
});

// Scan
const allItems = await dynamodbConnection.scan({
  TableName: 'Users',
  Limit: 100,
});
```

### 6. Error Handling

Use custom error classes for different scenarios:

```typescript
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  DatabaseError,
  InternalServerError,
} from './errors';

// Validation error (400)
throw new ValidationError('Invalid email format', { field: 'email' });

// Not found error (404)
throw new NotFoundError('User not found', { userId: 123 });

// Unauthorized error (401)
throw new UnauthorizedError('Invalid API key');

// Database error (500)
throw new DatabaseError('Connection failed', { originalError: err.message });

// Generic internal server error (500)
throw new InternalServerError('Unexpected error occurred');
```

### 7. Response Format

All responses follow a standardized format:

**Success Response (200)**
```json
{
  "success": true,
  "data": {
    "message": "Request processed successfully",
    "requestId": "aws-request-id"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (varies by error type)**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "email": "email must be a valid email"
    },
    "requestId": "aws-request-id"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Testing

The template includes unit tests for all components. Run tests with:

```bash
npm test
```

For coverage report:
```bash
npm test -- --coverage
```

Test files are located in `src/__tests__/` and follow the naming pattern `*.test.ts`.

### Running Specific Tests

```bash
npm test -- handler.test.ts
npm test -- errors
```

## Environment Variables

Configure these in your `.env` file:

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `password` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | PostgreSQL database name | `lambda_db` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `LOG_LEVEL` | Logging level | `info`, `debug`, `warn`, `error` |

## Deployment

### Package for AWS Lambda

```bash
npm run build
zip -r lambda.zip dist/ node_modules/
```

### Using AWS SAM

Create a `template.yaml`:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2013-12-31

Globals:
  Function:
    Timeout: 30
    Runtime: nodejs18.x
    Environment:
      Variables:
        LOG_LEVEL: info
        AWS_REGION: us-east-1

Resources:
  LambdaFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: dist/handler.handler
      Runtime: nodejs18.x
      Environment:
        Variables:
          DB_HOST: !Ref DBHost
          DB_USER: !Ref DBUser
          DB_PASSWORD: !Ref DBPassword
          DB_NAME: !Ref DBName
```

### Using AWS CDK

```typescript
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

const lambdaFunction = new lambda.Function(this, 'LambdaFunction', {
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'dist/handler.handler',
  code: lambda.Code.fromAsset(path.join(__dirname, '../../')),
  environment: {
    DB_HOST: 'your-db-host',
    DB_USER: 'your-db-user',
    DB_PASSWORD: 'your-db-password',
    DB_NAME: 'your-db-name',
  },
});
```

## Best Practices

1. **Always validate input** - Use Joi schemas for all external input
2. **Use appropriate error types** - Helps with debugging and monitoring
3. **Log with context** - Include relevant data in log messages
4. **Handle errors gracefully** - Use try-catch blocks appropriately
5. **Write tests** - Aim for 80%+ code coverage
6. **Use environment variables** - Never hardcode sensitive data
7. **Close connections** - Clean up database connections when needed

## Dependencies

### Production
- `pg` - PostgreSQL client
- `aws-sdk` - AWS SDK for JavaScript
- `winston` - Logging library
- `joi` - Schema validation

### Development
- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution for Node.js
- `jest` - Testing framework
- `ts-jest` - TypeScript support for Jest
- `eslint` - Code linting
- `@types/*` - Type definitions

## Troubleshooting

### Database Connection Issues

**PostgreSQL Connection Failed**
- Verify `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` in `.env`
- Ensure PostgreSQL service is running
- Check network connectivity

**DynamoDB Issues**
- Ensure AWS credentials are configured
- Verify IAM permissions for DynamoDB operations
- Check `AWS_REGION` is correct

### Build Issues

**TypeScript Compilation Errors**
```bash
npm run clean
npm install
npm run build
```

### Test Failures

- Clear Jest cache: `npx jest --clearCache`
- Update snapshots: `npm test -- -u`
- Run in watch mode: `npm run test:watch`

## Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Ensure linting passes: `npm run lint`
5. Maintain >80% test coverage

## License

MIT

## Support

For issues and questions, please refer to the documentation above or create an issue in the repository.
