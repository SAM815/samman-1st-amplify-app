#!/bin/bash

echo "🚀 Quick Deploy for Anime Blog"
echo "=============================="
echo ""
echo "This script will deploy your app using AWS Amplify (simplest option)"
echo ""

# Check if user is logged in to AWS
echo "Checking AWS credentials..."
npx ampx whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Amplify"
    echo "Please run: npx ampx configure"
    exit 1
fi

echo "✅ AWS credentials found"
echo ""

# Deploy backend
echo "📦 Deploying Amplify backend..."
npx ampx sandbox --once

echo ""
echo "✅ Backend deployed!"
echo ""

# Update components to use Amplify API
echo "🔄 Updating components to use Amplify API..."

# Update home page to use SimpleUserPosts
sed -i '' 's/import { UserPosts }/import { SimpleUserPosts as UserPosts }/' app/home/page.tsx

echo "✅ Components updated!"
echo ""

echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start your application"
echo "2. Create an account and start posting!"
echo ""
echo "Your data is now being saved to AWS DynamoDB through Amplify GraphQL."