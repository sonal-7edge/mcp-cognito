#!/bin/bash

# Cognito CloudFormation Deployment Example
# This script demonstrates how to deploy the generated CloudFormation template

set -e

# Configuration
STACK_NAME="my-app-cognito"
TEMPLATE_FILE="output/cloudformation-template.yaml"
REGION="us-east-1"
ENVIRONMENT="dev"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 Cognito CloudFormation Deployment"
echo "===================================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    echo "Please install AWS CLI from https://aws.amazon.com/cli/"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI found${NC}"

# Check if template file exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo -e "${RED}❌ Template file not found: $TEMPLATE_FILE${NC}"
    echo "Please generate the CloudFormation template first using Kiro"
    exit 1
fi

echo -e "${GREEN}✅ Template file found${NC}"

# Validate template
echo ""
echo "📋 Validating CloudFormation template..."
aws cloudformation validate-template \
    --template-body file://$TEMPLATE_FILE \
    --region $REGION > /dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Template is valid${NC}"
else
    echo -e "${RED}❌ Template validation failed${NC}"
    exit 1
fi

# Check if stack already exists
echo ""
echo "🔍 Checking if stack exists..."
STACK_EXISTS=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION 2>&1 || true)

if echo "$STACK_EXISTS" | grep -q "does not exist"; then
    echo -e "${YELLOW}Stack does not exist. Creating new stack...${NC}"
    OPERATION="create-stack"
else
    echo -e "${YELLOW}Stack exists. Updating stack...${NC}"
    OPERATION="update-stack"
fi

# Deploy stack
echo ""
echo "🚀 Deploying stack: $STACK_NAME"
echo "   Region: $REGION"
echo "   Environment: $ENVIRONMENT"
echo ""

if [ "$OPERATION" = "create-stack" ]; then
    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
        --capabilities CAPABILITY_IAM \
        --region $REGION \
        --tags Key=Environment,Value=$ENVIRONMENT Key=ManagedBy,Value=CloudFormation

    echo ""
    echo "⏳ Waiting for stack creation to complete..."
    aws cloudformation wait stack-create-complete \
        --stack-name $STACK_NAME \
        --region $REGION

else
    # Update stack
    UPDATE_OUTPUT=$(aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
        --capabilities CAPABILITY_IAM \
        --region $REGION 2>&1 || true)

    if echo "$UPDATE_OUTPUT" | grep -q "No updates are to be performed"; then
        echo -e "${YELLOW}⚠️  No updates needed${NC}"
    else
        echo ""
        echo "⏳ Waiting for stack update to complete..."
        aws cloudformation wait stack-update-complete \
            --stack-name $STACK_NAME \
            --region $REGION
    fi
fi

# Get stack outputs
echo ""
echo "📊 Stack Outputs:"
echo "================"
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
    --output table

# Save outputs to file
echo ""
echo "💾 Saving outputs to file..."
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs' \
    --output json > output/stack-outputs.json

echo -e "${GREEN}✅ Outputs saved to output/stack-outputs.json${NC}"

# Display important information
echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "Next steps:"
echo "1. Note the User Pool ID and Client ID from outputs above"
echo "2. If using SES, verify your domain and update the template with SES ARN"
echo "3. Configure your application with the Cognito endpoints"
echo "4. Test authentication flow in your application"
echo "5. Monitor CloudWatch logs for any issues"
echo ""
echo "Useful commands:"
echo "  View stack events:"
echo "    aws cloudformation describe-stack-events --stack-name $STACK_NAME --region $REGION"
echo ""
echo "  Delete stack (if needed):"
echo "    aws cloudformation delete-stack --stack-name $STACK_NAME --region $REGION"
echo ""
