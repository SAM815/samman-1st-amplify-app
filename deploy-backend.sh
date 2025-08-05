#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Anime Blog Backend Deployment${NC}"

# Check if AWS CLI is configured
echo -e "${YELLOW}Checking AWS credentials...${NC}"
aws sts get-caller-identity > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS credentials found${NC}"

# Navigate to infrastructure directory
cd infrastructure

# Install dependencies
echo -e "${YELLOW}Installing CDK dependencies...${NC}"
npm install

# Build TypeScript
echo -e "${YELLOW}Building TypeScript...${NC}"
npm run build

# Bootstrap CDK (only needed once per account/region)
echo -e "${YELLOW}Bootstrapping CDK...${NC}"
cdk bootstrap

# Deploy the stack
echo -e "${YELLOW}Deploying stack...${NC}"
cdk deploy --require-approval never

# Get outputs
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo -e "${YELLOW}Fetching stack outputs...${NC}"

# Get the API URL from CloudFormation outputs
API_URL=$(aws cloudformation describe-stacks \
    --stack-name AnimeBlogStack \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
    --output text)

echo -e "${GREEN}API URL: ${API_URL}${NC}"

# Create .env.local file
cd ..
echo -e "${YELLOW}Creating .env.local file...${NC}"
cat > .env.local << EOF
# AWS Amplify Backend API
NEXT_PUBLIC_API_URL=${API_URL}
EOF

echo -e "${GREEN}✅ Created .env.local with API URL${NC}"
echo -e "${GREEN}🎉 Backend deployment complete!${NC}"
echo -e "${YELLOW}You can now restart your Next.js development server to use the new API.${NC}"