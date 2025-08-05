# 🚀 Deploy Your Anime Blog App Now!

Follow these simple steps to deploy your application:

## Step 1: Configure AWS Credentials

First, you need to configure your AWS credentials. Run:

```bash
aws configure
```

Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (use: us-east-1)
- Default output format (use: json)

## Step 2: Deploy Backend with Amplify

Run this command to deploy your backend:

```bash
npx ampx sandbox
```

This will:
- Create DynamoDB tables for your data
- Set up Cognito for authentication
- Deploy your GraphQL API
- Generate the configuration file

The deployment will take about 5-10 minutes.

## Step 3: Update Your Code to Use Amplify API

While the backend is deploying, update your home page to use the Amplify-integrated components:

1. Open `app/home/page.tsx`
2. Change line 11 from:
   ```typescript
   import { UserPosts } from '@/components/UserPosts'
   ```
   To:
   ```typescript
   import { SimpleUserPosts as UserPosts } from '@/components/SimpleUserPosts'
   ```

## Step 4: Test Your Application

Once the deployment is complete:

1. The terminal will show "✅ Sandbox deployed successfully"
2. Your app will automatically connect to the deployed backend
3. Run your app:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000 in your browser

## What You Can Do Now:

✅ Create user accounts (data persists in AWS Cognito)
✅ Create blog posts (data saves to DynamoDB)
✅ Upload images (stored in S3)
✅ View your posts even after logging out
✅ Comment on posts (saved to database)

## Deploy to Production (Optional)

To deploy your frontend to Amplify Hosting:

```bash
git add .
git commit -m "Add social features"
git push origin main
```

Your app will automatically deploy to: https://dzgvj1gqwfjbu.amplifyapp.com

## Troubleshooting

If you get credential errors:
1. Make sure you have an AWS account
2. Create an IAM user with AdministratorAccess
3. Use those credentials in `aws configure`

If the sandbox command fails:
1. Try: `npx ampx sandbox delete` first
2. Then run: `npx ampx sandbox` again

## Need Help?

The app is already configured and ready to deploy. You just need to:
1. Configure AWS credentials
2. Run the sandbox command
3. Start coding!

Your social media features are ready to use! 🎉