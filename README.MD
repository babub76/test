# AWS Lambda Template

A production-ready AWS Lambda template for Node.js with PostgreSQL and DynamoDB integration, featuring proper logging, error handling, and comprehensive unit tests.

## ⚡ Quick Start

```bash
# 1. Clone the template
git clone <repo-url>
cd aws-lambda-template

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your settings

# 4. Run tests
npm test

# 5. Build for deployment
npm run build
```

See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.

## ✨ Features

- ✅ **TypeScript** - Full type safety with strict mode
- ✅ **Comprehensive Testing** - 34 tests with 65%+ coverage
- ✅ **Request Validation** - Joi schema validation
- ✅ **Database Integration** - PostgreSQL pooling + DynamoDB
- ✅ **Logging** - Winston with JSON format and request tracking
- ✅ **Error Handling** - Custom error classes with HTTP status codes
- ✅ **Response Standardization** - Consistent response format
- ✅ **Absolute Imports** - Clean `@/handler`, `@logger`, `@database/*` imports

## 📁 Project Structure

```
src/
├── __tests__/                    # Unit tests (7 test suites)
│   ├── database/
│   │   ├── dynamodb.test.ts
│   │   └── postgres.test.ts
│   ├── utils/
│   │   ├── response.test.ts
│   │   └── validator.test.ts
│   ├── errors.test.ts
│   ├── handler.test.ts
│   └── integration.test.ts
├── database/
│   ├── dynamodb.ts               # DynamoDB wrapper
│   └── postgres.ts               # PostgreSQL connection pool
├── utils/
│   ├── response.ts               # Response handler + error middleware
│   └── validator.ts              # Joi validation utilities
├── errors.ts                     # Custom error classes
├── logger.ts                     # Winston logging config
└── handler.ts                    # Lambda entry point
```

## 🚀 Usage

### Logging

```typescript
import logger from '@logger';

logger.info('Operation started', { userId: 123 });
logger.error('Operation failed', { error: err.message });
```

### Request Validation

```typescript
import { Validator } from '@utils/validator';
import Joi from 'joi';

const schema = Joi.object({ email: Joi.string().email().required() });
const data = Validator.validateBody(schema, event.body);
```

### PostgreSQL Queries

```typescript
import postgresConnection from '@database/postgres';

const result = await postgresConnection.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);
```

### DynamoDB Operations

```typescript
import dynamodbConnection from '@database/dynamodb';

// Get
const item = await dynamodbConnection.get({
  TableName: 'Users',
  Key: { userId: 'user-123' }
});

// Put
await dynamodbConnection.put({
  TableName: 'Users',
  Item: { userId: 'user-123', name: 'John' }
});

// Query
const results = await dynamodbConnection.query({
  TableName: 'Users',
  KeyConditionExpression: 'pk = :pk',
  ExpressionAttributeValues: { ':pk': 'USER#123' }
});
```

### Error Handling

```typescript
import { ValidationError, NotFoundError, DatabaseError } from '@errors';

throw new ValidationError('Invalid email', { field: 'email' });      // 400
throw new NotFoundError('User not found', { userId: 123 });          // 404
throw new DatabaseError('Connection failed', { error: err });         // 500
```

## 📦 NPM Scripts

```bash
npm run build         # TypeScript compile to dist/
npm run dev          # Run with ts-node
npm test             # Run all 34 tests
npm run test:watch   # Watch mode
npm run lint         # ESLint code style
npm run clean        # Remove dist/ and coverage/
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage report
npm test -- --coverage

# Run specific test file
npm test -- handler.test.ts

# Watch mode
npm run test:watch
```

**Current Status**: ✅ 7 test suites passing | 34/34 tests passing | 65.4% coverage

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `password` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | PostgreSQL database | `lambda_db` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `LOG_LEVEL` | Log level | `info`, `debug`, `warn`, `error` |

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Setup and first deployment
- **[STEP_BY_STEP.md](./STEP_BY_STEP.md)** - Detailed walkthrough (14 steps)
- **[STRUCTURE.md](./STRUCTURE.md)** - Project architecture and patterns
- **[CODEPIPELINE.md](./CODEPIPELINE.md)** - CI/CD with AWS CodePipeline

## 🛠️ Customization

1. Update business logic in `src/handler.ts`
2. Add database models in `src/database/`
3. Add validation schemas in request handlers
4. Write tests in `src/__tests__/`
5. Build and deploy: `npm run build && zip -r lambda.zip dist/ node_modules/`

## 📋 Deployment

### Option 1: AWS Lambda Console
```bash
npm run build
zip -r lambda.zip dist/ node_modules/
# Upload lambda.zip via AWS Console
```

### Option 2: AWS CLI
```bash
npm run build
aws lambda update-function-code \
  --function-name my-function \
  --zip-file fileb://lambda.zip
```

### Option 3: AWS CodePipeline
See [CODEPIPELINE.md](./CODEPIPELINE.md) for automated deployment setup.

## ✅ Best Practices

1. **Validate all input** - Use Joi schemas
2. **Log with context** - Include relevant data
3. **Use typed errors** - Helps with monitoring
4. **Write tests** - Aim for 80%+ coverage
5. **Never hardcode secrets** - Use environment variables
6. **Close connections** - Clean up resources

## 📦 Dependencies

**Production**: pg, aws-sdk, winston, joi, aws-lambda
**Development**: typescript, jest, ts-jest, eslint, @types/*

## 🐛 Troubleshooting

**Database connection failed**
- Check DB credentials in `.env`
- Verify PostgreSQL/DynamoDB is running
- Check network connectivity

**Tests failing**
```bash
npm run clean
npm install
npm test -- --clearCache
```

**Build errors**
```bash
npm run clean
npm run build
```

## 📄 License

MIT

## 💬 Support

Refer to the documentation files or review the test files for usage examples.
