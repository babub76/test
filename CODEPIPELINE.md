# AWS CodePipeline Deployment Guide

## Overview

This template is configured for automated deployment using AWS CodePipeline with:
- **Source**: GitHub repository
- **Build**: AWS CodeBuild with buildspec.yml
- **Deploy**: AWS Lambda function update
- **Artifacts**: S3 bucket for build artifacts

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **GitHub Repository** with your code
3. **GitHub Personal Access Token** for authentication
4. **AWS CLI** configured locally
5. **IAM Permissions** for CodePipeline, CodeBuild, Lambda, S3, and CloudFormation

## Setup Instructions

### 1. Create GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (full control of private repositories)
4. Copy the token (you'll need it for pipeline setup)

### 2. Deploy CodePipeline Stack

```bash
# Set your GitHub details
export GITHUB_OWNER="your-github-username"
export GITHUB_REPO="your-repo-name"
export GITHUB_TOKEN="your-personal-access-token"
export ENVIRONMENT="dev"  # or staging, prod

# Deploy the pipeline using AWS CLI
aws cloudformation create-stack \
  --stack-name lambda-pipeline-$ENVIRONMENT \
  --template-body file://pipeline.json \
  --parameters \
    ParameterKey=GitHubOwner,ParameterValue=$GITHUB_OWNER \
    ParameterKey=GitHubRepo,ParameterValue=$GITHUB_REPO \
    ParameterKey=GitHubToken,ParameterValue=$GITHUB_TOKEN \
    ParameterKey=GitHubBranch,ParameterValue=main \
    ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
  --capabilities CAPABILITY_NAMED_IAM
```

Or use the AWS Console:
1. Go to CloudFormation
2. Click "Create Stack"
3. Upload `pipeline.json`
4. Fill in parameters for GitHub and environment
5. Review and create

### 3. Create Lambda Function

Before deploying, create your Lambda function manually or via CloudFormation:

```bash
# Example: Create Lambda function
aws lambda create-function \
  --function-name my-lambda-$ENVIRONMENT \
  --runtime nodejs18.x \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-execution-role \
  --handler dist/handler.handler \
  --zip-file fileb://lambda-package.zip
```

### 4. Configure buildspec.yml

The `buildspec.yml` file defines the build process:

```yaml
phases:
  pre_build:    # Install dependencies, run linting
  build:        # Build code, run tests
  post_build:   # Create deployment package
```

Customize for your needs:
- Add environment variables
- Change test commands
- Add additional build steps
- Configure output artifacts

### 5. Push Code to GitHub

```bash
git push origin main
```

This triggers the pipeline automatically!

## Pipeline Stages

### Stage 1: Source
- Pulls code from GitHub branch
- Triggered on push or scheduled

### Stage 2: Build (CodeBuild)
1. Installs dependencies (`npm install`)
2. Runs linting (`npm run lint`)
3. Builds code (`npm run build`)
4. Runs tests (`npm test`)
5. Creates ZIP package for Lambda
6. Uploads artifacts to S3

### Stage 3: Deploy
- Updates Lambda function code
- Can add approval steps before deployment
- Supports multiple environments

## Build Specification Details

The `buildspec.yml` contains:

```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - npm install              # Install dependencies
      - npm run lint            # Check code quality

  build:
    commands:
      - npm run build           # Compile TypeScript
      - npm test -- --coverage  # Run tests with coverage

  post_build:
    commands:
      - mkdir -p build
      - cp -r dist/* build/
      - cp -r node_modules build/
      - cd build && zip -r ../lambda-package.zip . && cd ..

artifacts:
  files:
    - lambda-package.zip

cache:
  paths:
    - node_modules/**/*       # Cache dependencies
```

## Environment Variables

Configure in CodeBuild project:

```
DB_HOST=your-database-host
DB_PORT=5432
DB_USER=your-user
DB_PASSWORD=your-password
DB_NAME=your-database
AWS_REGION=us-east-1
LOG_LEVEL=info
```

Set in AWS Console:
1. Go to CodeBuild → Projects
2. Edit project
3. Under Environment, add environment variables
4. Mark sensitive variables as "Secret parameter"

## Monitoring & Troubleshooting

### View Pipeline Status
```bash
aws codepipeline get-pipeline-state --name lambda-pipeline-dev
```

### View Build Logs
```bash
# In AWS Console:
# CodeBuild → Build history → click build → Logs
```

### Common Issues

**Build Fails - Dependency Issues**
- Check `npm install` step
- Verify `package.json` is correct
- Check buildspec cache settings

**Tests Failing**
- Review test output in CodeBuild logs
- Ensure test environment is configured
- Check database connectivity in tests

**Lambda Update Fails**
- Verify Lambda function name is correct
- Check IAM permissions
- Ensure ZIP package is valid

**GitHub Connection Failed**
- Verify GitHub token is valid
- Check token hasn't expired
- Confirm repository access permissions

## Multi-Environment Deployment

Deploy to multiple environments:

```bash
# Dev environment
aws cloudformation create-stack \
  --stack-name lambda-pipeline-dev \
  --template-body file://pipeline.json \
  --parameters ... Environment=dev

# Staging environment
aws cloudformation create-stack \
  --stack-name lambda-pipeline-staging \
  --template-body file://pipeline.json \
  --parameters ... Environment=staging

# Production environment
aws cloudformation create-stack \
  --stack-name lambda-pipeline-prod \
  --template-body file://pipeline.json \
  --parameters ... Environment=prod
```

Each has its own:
- CodeBuild project
- Artifact bucket
- Lambda function
- Deployment settings

## Adding Manual Approval

To add approval before production deployment:

1. Edit pipeline in AWS Console
2. Add "Manual Approval" action before Deploy stage
3. Configure SNS notifications
4. Reviewers must approve deployment

## Customization

### Add Code Quality Gates

```yaml
# In buildspec.yml
build:
  commands:
    - npm run lint -- --format json > lint-report.json
    - npm test -- --coverage --testResultsProcessor=jest-junit
```

### Add Security Scanning

```yaml
# Install and run security tools
pre_build:
  commands:
    - npm audit --production
    - npm install -g snyk
    - snyk test
```

### Add Performance Tests

```yaml
build:
  commands:
    - npm run test:performance
    - npm run test:load
```

## Rollback Strategy

### Automatic Rollback
```bash
# CloudFormation automatic rollback on failure
aws cloudformation create-stack \
  --disable-rollback false  # Enable automatic rollback
```

### Manual Rollback
```bash
# Revert to previous Lambda version
aws lambda update-alias \
  --function-name my-lambda \
  --name prod \
  --function-version PREVIOUS_VERSION
```

## Cost Optimization

1. **CodeBuild**: Pay per build minute (first 100 min/month free)
2. **S3**: Store artifacts (lifecycle policies delete old artifacts)
3. **Lambda**: Pay per invocation (very cheap)
4. **CloudFormation**: Free, pay for resources

To reduce costs:
- Delete unused artifact buckets
- Set S3 lifecycle policies
- Use CodeBuild cache
- Consolidate environments

## Security Best Practices

1. **GitHub Token**: Use personal access token with minimal scopes
2. **IAM Roles**: Grant minimal required permissions
3. **Secrets**: Use AWS Secrets Manager for sensitive data
4. **Logs**: Enable CloudFormation logs and audit trail
5. **Artifact Bucket**: Enable versioning and encryption
6. **Code Review**: Add approval step before production

## Troubleshooting Checklist

- [ ] GitHub token is valid and not expired
- [ ] CodeBuild project can access artifacts
- [ ] Lambda execution role has required permissions
- [ ] buildspec.yml is in repository root
- [ ] Tests pass locally (`npm test`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] S3 bucket exists and is accessible
- [ ] CloudFormation template is valid
- [ ] Environment variables are set correctly
- [ ] Lambda function exists in target account

## Advanced Configuration

### Cross-Account Deployment

Assume role in different AWS account:

```yaml
build:
  commands:
    - |
      CREDENTIALS=$(aws sts assume-role \
        --role-arn arn:aws:iam::ACCOUNT_ID:role/CrossAccountRole \
        --role-session-name CodeBuildSession \
        --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]' \
        --output text)
    - export AWS_ACCESS_KEY_ID=$(echo $CREDENTIALS | awk '{print $1}')
    - export AWS_SECRET_ACCESS_KEY=$(echo $CREDENTIALS | awk '{print $2}')
    - export AWS_SESSION_TOKEN=$(echo $CREDENTIALS | awk '{print $3}')
    - aws lambda update-function-code --function-name my-lambda ...
```

### Parallel Deployments

Add multiple deploy actions in Deploy stage for different regions/accounts.

### Conditional Deployments

Use SNS notifications and Lambda to trigger conditional deployments based on tests or metrics.

## Next Steps

1. Create GitHub personal access token
2. Deploy CodePipeline stack
3. Create or verify Lambda function
4. Push code to GitHub to trigger pipeline
5. Monitor deployment in AWS Console
6. Iterate and customize as needed

## Support & Documentation

- [AWS CodePipeline Docs](https://docs.aws.amazon.com/codepipeline/)
- [AWS CodeBuild Docs](https://docs.aws.amazon.com/codebuild/)
- [buildspec.yml Reference](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html)
- [Lambda Deployment Packages](https://docs.aws.amazon.com/lambda/latest/dg/python-package.html)
