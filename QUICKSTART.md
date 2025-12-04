# AWS Lambda Template

## Quick Start Guide

This is a production-ready AWS Lambda template for Node.js with:

### ✨ Key Features
- TypeScript support with strict mode
- Structured logging with Winston
- Custom error handling with standardized responses
- Request validation using Joi
- PostgreSQL connection pooling
- DynamoDB integration
- Comprehensive unit tests with Jest
- ESLint for code quality

### 📦 Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your values

# 3. Build
npm run build

# 4. Run tests
npm test
```

### 🚀 Creating Your Lambda

1. Edit `src/handler.ts` - Replace `handleRequest` function
2. Add your business logic
3. Write tests in `src/__tests__/`
4. Run `npm test` to validate
5. Build with `npm run build`

### 📚 Key Files

| File | Purpose |
|------|---------|
| `src/handler.ts` | Lambda entry point - modify this |
| `src/logger.ts` | Logging configuration |
| `src/errors.ts` | Custom error classes |
| `src/database/postgres.ts` | PostgreSQL wrapper |
| `src/database/dynamodb.ts` | DynamoDB wrapper |
| `src/utils/response.ts` | Response standardization |
| `src/utils/validator.ts` | Input validation |

### 🔧 Common Commands

```bash
npm run build        # Compile TypeScript
npm run dev         # Run with ts-node
npm test            # Run tests
npm test:watch      # Watch mode
npm run lint        # Check code quality
npm run clean       # Remove build artifacts
```

### 💾 Database Examples

**PostgreSQL Query:**
```typescript
const result = await postgresConnection.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);
```

**DynamoDB Get:**
```typescript
const item = await dynamodbConnection.get({
  TableName: 'Users',
  Key: { userId: 'user-123' },
});
```

### 🛡️ Error Handling

```typescript
import { ValidationError, NotFoundError, DatabaseError } from './errors';

throw new ValidationError('Invalid email', { field: 'email' });
throw new NotFoundError('User not found', { userId: 123 });
throw new DatabaseError('Connection failed');
```

### 📝 Logging

```typescript
import logger from './logger';

logger.info('User created', { userId: '123' });
logger.error('Operation failed', { error: err.message });
logger.debug('Debug data', { data: obj });
logger.warn('Warning', { warning: 'info' });
```

### 📖 Full Documentation

See [README.md](./README.md) for detailed documentation.

