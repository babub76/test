# Troubleshooting Guide

## Common Issues and Solutions

### 1. Installation Issues

#### npm install fails
```bash
# Clear npm cache
npm cache clean --force

# Install again
npm install

# If still failing, use npm ci
npm ci
```

#### Node version incompatible
```bash
# Check your Node version
node --version

# Should be 18.x or higher
# Install nvm if needed: https://github.com/nvm-sh/nvm

# Use correct Node version
nvm install 18
nvm use 18
```

### 2. TypeScript Compilation Errors

#### Cannot find module
```bash
# Rebuild
npm run clean
npm run build

# Check tsconfig.json paths are correct
```

#### Type errors
```typescript
// Make sure to import types
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

// Use proper types for AWS SDK
import AWS from 'aws-sdk';
```

#### tsconfig strict mode errors
Add type annotations:
```typescript
// Bad
const result = query('SELECT * FROM users');

// Good
const result: QueryResult = await postgresConnection.query('SELECT * FROM users');
```

### 3. Testing Issues

#### Tests not running
```bash
# Clear Jest cache
npx jest --clearCache

# Try again
npm test

# Check jest.config.json is in root
```

#### "Cannot find module" in tests
```bash
# Make sure to mock dependencies
jest.mock('../../database/postgres');

# Or install @types for external libraries
npm install --save-dev @types/node
```

#### Coverage not as expected
```bash
# Run with coverage details
npm test -- --coverage --verbose

# Check excludePatterns in jest.config.json
```

### 4. Database Connection Issues

#### PostgreSQL Connection Failed
```bash
# Check PostgreSQL credentials in .env
cat .env

# Test connection
psql -h $DB_HOST -U $DB_USER -d $DB_NAME
```

#### DynamoDB Connection Failed
```bash
# Ensure AWS credentials are configured
aws sts get-caller-identity

# Verify AWS_REGION in .env
echo $AWS_REGION
```

#### Connection pool exhausted
```typescript
// Reduce pool size temporarily for testing
max: 5,  // Was 10

// Or increase timeouts
idleTimeoutMillis: 60000,  // 1 minute
connectionTimeoutMillis: 5000,  // 5 seconds
```

### 5. Build Issues

#### dist/ folder not created
```bash
# Build explicitly
npm run build

# Check tsconfig.json has outDir set
# Should have: "outDir": "./dist"
```

#### Lambda package too large
```bash
# Exclude unnecessary files
zip -r lambda.zip dist/ node_modules/ \
  -x "node_modules/aws-sdk*" \
  -x "node_modules/@types/*" \
  -x "node_modules/.bin/*"

# Use node-prune for smaller package
npm install --save-dev node-prune
npx node-prune
```

### 6. Environment Variable Issues

#### Undefined environment variables
```bash
# Make sure .env exists
ls -la .env

# Load environment
export $(cat .env | xargs)

# Verify
echo $DB_HOST
```

#### Variables not in Lambda environment
```yaml
# In template.yaml, add to Environment section
Resources:
  LambdaFunction:
    Properties:
      Environment:
        Variables:
          DB_HOST: !Ref DBHost
          DB_USER: !Ref DBUser
```

### 7. Linting Issues

#### ESLint errors
```bash
# Check configuration
cat .eslintrc.json

# Fix issues automatically
npm run lint -- --fix

# Or disable specific rule
// eslint-disable-next-line no-unused-vars
const unused = 'value';
```

#### Prettier formatting
```bash
# Install prettier
npm install --save-dev prettier

# Format code
npx prettier --write src/
```

### 8. Deployment Issues

#### SAM deployment fails
```bash
# Check AWS credentials
aws sts get-caller-identity

# Validate template
sam validate -t template.yaml

# Build before deploying
sam build

# Check CloudFormation errors
aws cloudformation describe-stack-events \
  --stack-name lambda-template-stack
```

#### Lambda timeout
```bash
# Increase timeout in template.yaml
Timeout: 60  # Was 30

# Or in code
sam deploy --parameter-overrides Timeout=60
```

#### Permission denied
```bash
# Check IAM role has DynamoDB permissions
aws iam get-role-policy \
  --role-name lambda-execution-role \
  --policy-name DynamoDBAccess

# Add policy if needed
aws iam put-role-policy \
  --role-name lambda-execution-role \
  --policy-name DynamoDBAccess \
  --policy-document file://policy.json
```

### 10. Performance Issues

#### Slow tests
```bash
# Run tests in parallel (disable with --runInBand)
npm test

# Run specific test file only
npm test handler.test.ts

# Use watch mode for development
npm run test:watch
```

#### Cold starts
```bash
# Increase memory (also increases CPU)
sam deploy --parameter-overrides MemorySize=512

# Use provisioned concurrency
# In template.yaml:
ProvisionedConcurrentExecutions: 1
```

#### High Lambda duration
```typescript
// Check for blocking operations
// Use async/await instead of callbacks
// Close database connections properly
await postgresConnection.close();

// Check for N+1 queries
// Batch operations when possible
```

### 11. Git Issues

#### node_modules too large for commit
```bash
# Already in .gitignore, but verify
cat .gitignore | grep node_modules

# Remove if accidentally committed
git rm -r --cached node_modules
git commit -m "Remove node_modules"
```

#### Large commit history
```bash
# Check what's tracked
git check-ignore -v src/

# Clean untracked files
git clean -fd

# Reset to clean state
git reset --hard HEAD
```

### 12. Error Messages & Solutions

| Error | Solution |
|-------|----------|
| `ENOENT: no such file or directory, open '.env'` | Run `cp .env.example .env` |
| `Cannot find module 'pg'` | Run `npm install` |
| `Port 5432 already in use` | Kill process: `lsof -i :5432` or use different port |
| `ECONNREFUSED 127.0.0.1:5432` | Check PostgreSQL is running and credentials in .env |
| `Permission denied` | Check IAM role and policies |
| `TimeoutError` | Increase Lambda timeout or database query timeout |
| `SyntaxError: Unexpected token` | Run `npm run lint --fix` |
| `Jest has exited with code 1` | Check test files for errors |

## Debug Techniques

### Enable Debug Logging
```bash
# Set log level to debug
export LOG_LEVEL=debug
npm run dev
```

### Add Temporary Logging
```typescript
console.log('Debug:', variable);
logger.debug('More details', { data: object });
```

### Use Node Debugger
```bash
# Run with inspector
node --inspect-brk dist/handler.js

# In VS Code, create launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach",
      "port": 9229
    }
  ]
}
```

### Test in Isolation
```bash
# Test only one file
npm test -- handler.test.ts

# Test with specific name
npm test -- --testNamePattern="should return success"

# Run without clearing cache
npm test -- --cache=false
```

## Getting Help

1. **Check logs**: `npm run build` or `docker-compose logs`
2. **Review documentation**: See README.md, DEPLOYMENT.md
3. **Search issues**: Look for similar problems online
4. **Review code**: Check if configuration is correct
5. **Simplify**: Reduce to minimal reproduction

## Common Configuration Checklist

- [ ] .env file created and configured
- [ ] Node.js 18+ installed
- [ ] Dependencies installed (npm install)
- [ ] Docker running if using local services
- [ ] AWS credentials configured (for deployment)
- [ ] TypeScript can compile (npm run build)
- [ ] Tests pass (npm test)

## Recovery Steps

If everything is broken:

```bash
# Clean everything
npm run clean
rm -rf node_modules package-lock.json

# Start fresh
npm install
cp .env.example .env

# Verify
npm run build
npm test

# Run locally
npm run dev
```

If that doesn't work:

```bash
# Last resort - remove and reclone
cd ..
rm -rf aws-lambda-template
git clone <repo> aws-lambda-template
cd aws-lambda-template
npm install
```
