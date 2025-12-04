# Project Structure

```
aws-lambda-template/
├── src/
│   ├── __tests__/                    # Test directory
│   │   ├── database/
│   │   │   ├── dynamodb.test.ts     # DynamoDB tests
│   │   │   └── postgres.test.ts     # PostgreSQL tests
│   │   ├── utils/
│   │   │   ├── response.test.ts     # Response handler tests
│   │   │   └── validator.test.ts    # Validation tests
│   │   ├── errors.test.ts           # Error class tests
│   │   ├── handler.test.ts          # Handler tests
│   │   └── integration.test.ts      # Integration tests
│   ├── database/
│   │   ├── dynamodb.ts              # DynamoDB wrapper
│   │   └── postgres.ts              # PostgreSQL connection
│   ├── utils/
│   │   ├── response.ts              # Response standardization
│   │   └── validator.ts             # Input validation
│   ├── errors.ts                    # Custom error classes
│   ├── logger.ts                    # Logging configuration
│   └── handler.ts                   # Lambda handler
├── dist/                            # Compiled output (gitignored)
├── coverage/                        # Test coverage (gitignored)
├── .eslintrc.json                   # ESLint configuration
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── tsconfig.json                    # TypeScript configuration
├── jest.config.json                 # Jest configuration
├── package.json                     # Dependencies and scripts
├── package-lock.json                # Locked dependencies
├── buildspec.yml                    # CodeBuild build specification
├── pipeline.json                    # CodePipeline CloudFormation template
├── deploy.sh                        # Deployment script
├── README.md                        # Full documentation
├── QUICKSTART.md                    # Quick start guide
├── DEPLOYMENT.md                    # Deployment guide
└── CHANGELOG.md                     # Version history
```

## Directory Descriptions

### `/src`
Main application source code in TypeScript.

### `/src/__tests__`
Jest unit and integration tests. Each test file mirrors source structure.

### `/src/database`
Database connection wrappers:
- `postgres.ts`: PostgreSQL connection pool with query methods
- `dynamodb.ts`: DynamoDB client wrapper with all operations

### `/src/utils`
Utility modules:
- `response.ts`: Standardized response and error handling
- `validator.ts`: Request validation using Joi schemas

### `/dist`
Compiled JavaScript output from TypeScript (created by `npm run build`).

### `/coverage`
Test coverage reports (created by `npm test -- --coverage`).

## File Purposes

| File | Purpose |
|------|---------|
| `handler.ts` | Lambda entry point - main function for your Lambda |
| `logger.ts` | Winston logger configuration |
| `errors.ts` | Custom error class definitions |
| `response.ts` | Response formatting and error handling middleware |
| `validator.ts` | Input validation utilities |
| `postgres.ts` | PostgreSQL connection pool |
| `dynamodb.ts` | DynamoDB operations wrapper |
| `buildspec.yml` | AWS CodeBuild build specification |
| `pipeline.json` | AWS CodePipeline CloudFormation template |
| `deploy.sh` | Lambda deployment script |
| `.eslintrc.json` | Code linting rules |
| `tsconfig.json` | TypeScript compiler options |
| `jest.config.json` | Jest test runner configuration |
| `postman-collection.json` | Postman API test collection |

## Adding New Features

### New Database Query
1. Add method to `/src/database/postgres.ts` or `/src/database/dynamodb.ts`
2. Create tests in `/src/__tests__/database/`
3. Use in `/src/handler.ts`

### New Endpoint
1. Create handler function in appropriate service file
2. Export from handler/service
3. Add to `/src/handler.ts`
4. Create tests in `/src/__tests__/`

### New Validation
1. Create Joi schema
2. Use `Validator.validateBody()` or similar
3. Add tests in `/src/__tests__/utils/validator.test.ts`

### New Error Type
1. Extend `CustomError` in `/src/errors.ts`
2. Add tests in `/src/__tests__/errors.test.ts`
3. Use in appropriate handlers

## Import Patterns

```typescript
// Absolute imports from src root
import logger from '@/logger';
import { CustomError } from '@/errors';
import postgresConnection from '@/database/postgres';
import dynamodbConnection from '@/database/dynamodb';
import { Validator } from '@/utils/validator';
import { ResponseHandler } from '@/utils/response';

// Or relative imports
import logger from '../../logger';
```

## Test File Naming

- Unit tests: `filename.test.ts`
- Integration tests: `filename.integration.test.ts`
- E2E tests: `filename.e2e.test.ts`

## Configuration Files

- `.env.example` - Template for environment variables
- `tsconfig.json` - TypeScript settings
- `jest.config.json` - Test runner settings
- `.eslintrc.json` - Code quality settings
- `template.yaml` - AWS SAM deployment configuration
- `docker-compose.yml` - Local development stack
