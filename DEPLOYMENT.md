# Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [AWS Deployment](#aws-deployment)
4. [Monitoring and Logging](#monitoring-and-logging)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18.x or later
- AWS CLI configured with credentials
- AWS SAM CLI (for SAM deployment)
- PostgreSQL database (local or RDS)
- DynamoDB access

## Local Development

### 1. Setup

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Update .env with local database details
```

### 2. Running Locally

```bash
# Build
npm run build

# Run with ts-node
npm run dev

# Or run compiled version
npm start
```

### 3. Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test handler.test.ts

# Watch mode for development
npm run test:watch
```

## AWS Deployment

### Option 1: Using AWS SAM

#### Setup

```bash
# Install AWS SAM CLI
brew tap aws/tap
brew install aws-sam-cli

# Configure AWS credentials
aws configure
```

#### Build and Deploy

```bash
# Build for deployment
sam build -t template.yaml

# Deploy with guided mode (first time)
sam deploy --guided

# Subsequent deployments
sam deploy
```

#### SAM Deploy Parameters

When running `sam deploy --guided`, you'll be prompted for:

- **Stack name**: Name for your CloudFormation stack (e.g., `lambda-template-stack`)
- **AWS Region**: Where to deploy (e.g., `us-east-1`)
- **Parameter values**:
  - `Environment`: dev, staging, or prod
  - `LogLevel`: debug, info, warn, or error
  - `DBHost`: Your PostgreSQL host
  - `DBPort`: PostgreSQL port (default 5432)
  - `DBUser`: PostgreSQL username
  - `DBPassword`: PostgreSQL password
  - `DBName`: Database name

### Option 2: Manual Deployment with AWS CLI

```bash
# Build TypeScript
npm run build

# Create deployment package
zip -r lambda-package.zip dist/ node_modules/ -x "node_modules/aws-sdk*"

# Create S3 bucket for deployment package
aws s3 mb s3://lambda-template-deployments

# Upload package
aws s3 cp lambda-package.zip s3://lambda-template-deployments/

# Create Lambda function
aws lambda create-function \
  --function-name lambda-template-prod \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler dist/handler.handler \
  --zip-file fileb://lambda-package.zip \
  --timeout 30 \
  --memory-size 256 \
  --environment Variables={DB_HOST=your-host,DB_PORT=5432,DB_USER=user,DB_PASSWORD=pass,DB_NAME=db}

# Update function code
aws lambda update-function-code \
  --function-name lambda-template-prod \
  --s3-bucket lambda-template-deployments \
  --s3-key lambda-package.zip
```

### Option 3: Using AWS CDK

Create a `cdk.json`:

```json
{
  "app": "npx ts-node cdk/app.ts",
  "context": {}
}
```

Create `cdk/app.ts`:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'LambdaTemplateStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

// Lambda function
const lambdaFunction = new lambda.Function(stack, 'LambdaFunction', {
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'dist/handler.handler',
  code: lambda.Code.fromAsset(path.join(__dirname, '../')),
  timeout: cdk.Duration.seconds(30),
  memorySize: 256,
  environment: {
    DB_HOST: 'your-db-host',
    DB_USER: 'your-user',
    DB_PASSWORD: 'your-password',
    DB_NAME: 'your-database',
  },
});

// DynamoDB Table
const table = new dynamodb.Table(stack, 'DynamoDBTable', {
  partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
  sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});

// Grant permissions
table.grantReadWriteData(lambdaFunction);

// API Gateway
const api = new apigateway.RestApi(stack, 'Api', {
  restApiName: 'Lambda Template API',
});

api.root.addMethod('POST', new apigateway.LambdaIntegration(lambdaFunction));
```

Deploy:

```bash
npm install -g aws-cdk
cdk deploy
```

## Monitoring and Logging

### CloudWatch Logs

```bash
# View logs
aws logs tail /aws/lambda/lambda-template-prod --follow

# Get specific time range
aws logs filter-log-events \
  --log-group-name /aws/lambda/lambda-template-prod \
  --start-time 1642252800000 \
  --end-time 1642339200000
```

### CloudWatch Metrics

```bash
# Get invocation metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=lambda-template-prod \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

### X-Ray Tracing

Enable X-Ray in SAM template:

```yaml
Resources:
  LambdaFunction:
    Type: AWS::Serverless::Function
    Properties:
      # ... other properties
      Tracing: Active
```

View traces:

```bash
aws xray get-service-graph --start-time 1642252800 --end-time 1642339200
```

## Environment Variables per Stage

### Development

```bash
sam deploy \
  --parameter-overrides \
  Environment=dev \
  LogLevel=debug \
  DBHost=localhost
```

### Staging

```bash
sam deploy \
  --parameter-overrides \
  Environment=staging \
  LogLevel=info \
  DBHost=staging-db.example.com
```

### Production

```bash
sam deploy \
  --parameter-overrides \
  Environment=prod \
  LogLevel=warn \
  DBHost=prod-db.example.com
```

## Rollback

```bash
# List stack versions
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE

# Rollback to previous version
aws cloudformation cancel-update-stack \
  --stack-name lambda-template-stack

# Or delete and redeploy
aws cloudformation delete-stack \
  --stack-name lambda-template-stack
```

## Performance Optimization

### Memory Configuration

Test different memory sizes:

```bash
# 128 MB (minimum, slower)
# 256 MB (default)
# 512 MB (faster, higher cost)
# 1024+ MB (for compute-intensive workloads)

sam deploy --parameter-overrides MemorySize=512
```

### Connection Pooling

The template uses connection pooling by default:

```typescript
max: 10,                    // Maximum pool connections
idleTimeoutMillis: 30000,   // 30 second idle timeout
connectionTimeoutMillis: 2000  // 2 second connection timeout
```

Adjust based on workload.

## Cost Estimation

For 1 million invocations per month:

- **Lambda**: ~$0.20
- **DynamoDB** (PAY_PER_REQUEST): ~$1.25 for 5 million RCU/WCU
- **PostgreSQL RDS**: ~$30-50/month
- **CloudWatch Logs**: ~$0.50

Use AWS pricing calculator for accurate estimates.

## Security Best Practices

1. **Secrets Management**
   ```bash
   # Store secrets in AWS Secrets Manager
   aws secretsmanager create-secret \
     --name lambda/db/postgres \
     --secret-string '{"password":"secret","username":"dbuser"}'
   ```

2. **IAM Roles**
   - Use least privilege principle
   - Create specific roles per environment
   - Audit permissions regularly

3. **VPC Configuration**
   ```yaml
   Resources:
     LambdaFunction:
       Properties:
         VpcConfig:
           SecurityGroupIds:
             - sg-12345678
           SubnetIds:
             - subnet-12345678
             - subnet-87654321
   ```

4. **API Gateway**
   - Enable API key requirement
   - Use request validation
   - Configure throttling

## Troubleshooting

### Common Issues

**Cold Start Problems**
- Increase memory allocation
- Use provisioned concurrency
- Optimize dependencies

**Database Connection Issues**
- Verify security groups
- Check network connectivity
- Review connection pool settings

**Permission Errors**
- Check IAM role policies
- Verify DynamoDB table permissions
- Review KMS key policies

See [README.md](./README.md) for more troubleshooting tips.
