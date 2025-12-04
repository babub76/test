#!/bin/bash

# CodePipeline deployment script
# This script updates the Lambda function with the new code

set -e

LAMBDA_FUNCTION_NAME=${LAMBDA_FUNCTION_NAME:-"lambda-function"}
ARTIFACT_PATH=${1:-.}

echo "🚀 Deploying Lambda function..."
echo "Function: $LAMBDA_FUNCTION_NAME"
echo "Artifact: $ARTIFACT_PATH"

# Check if Lambda function exists
if aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" 2>/dev/null; then
    echo "✓ Lambda function found"
else
    echo "✗ Lambda function not found: $LAMBDA_FUNCTION_NAME"
    exit 1
fi

# Create zip file if not exists
if [ ! -f "$ARTIFACT_PATH/lambda-package.zip" ]; then
    echo "📦 Creating deployment package..."
    cd "$ARTIFACT_PATH"
    npm install --production
    zip -r lambda-package.zip dist/ node_modules/ -x "node_modules/.bin/*" "node_modules/@types/*"
    cd -
fi

# Update Lambda function
echo "📤 Uploading to Lambda..."
aws lambda update-function-code \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --zip-file "fileb://$ARTIFACT_PATH/lambda-package.zip"

# Wait for update to complete
echo "⏳ Waiting for update to complete..."
sleep 5

# Get function information
echo "✓ Deployment complete!"
aws lambda get-function --function-name "$LAMBDA_FUNCTION_NAME" | grep -E "FunctionArn|LastModified"

echo "🎉 Lambda function deployed successfully!"
