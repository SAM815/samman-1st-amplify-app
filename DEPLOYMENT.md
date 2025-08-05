# Deployment Instructions for Anime Blog

This guide will help you deploy your anime blog with full backend functionality.

## Option 1: Use Existing Amplify GraphQL (Simplest)

The application is already set up with AWS Amplify GraphQL. To use it:

1. **Deploy Amplify Backend**
   ```bash
   npx ampx sandbox
   ```
   This will deploy your backend to a sandbox environment.

2. **Update Components**
   Replace the API imports in your components:
   - In `app/home/page.tsx`, change `import { UserPosts }` to `import { SimpleUserPosts }`
   - Use `SimpleUserPosts` instead of `UserPosts`

3. **Test the Application**
   Your app will now save data to DynamoDB through Amplify GraphQL.

## Option 2: Deploy Full Infrastructure with CDK (Advanced)

If you want to use DocumentDB and the custom Lambda functions:

### Prerequisites
- AWS CLI installed and configured (`aws configure`)
- Node.js 18+ installed
- An AWS account with appropriate permissions

### Step 1: Deploy Infrastructure

```bash
# Navigate to infrastructure directory
cd infrastructure

# Install dependencies
npm install

# Build the project
npm run build

# Bootstrap CDK (first time only)
npx cdk bootstrap

# Deploy the stack
npx cdk deploy
```

This will create:
- DocumentDB cluster for data storage
- Lambda functions for API operations
- API Gateway for REST endpoints
- VPC and security groups

### Step 2: Update Environment Variables

After deployment, CDK will output the API URL. Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://your-api-id.execute-api.region.amazonaws.com/prod/
```

### Step 3: Run the Application

```bash
# From the root directory
npm run dev
```

## Option 3: Quick Local Testing

For quick testing without AWS deployment:

1. **Use Mock Data**
   The application includes mock data in the components. You can test the UI without a backend.

2. **Use Local Storage**
   Modify the API calls to save data to localStorage instead of making network requests.

## Environment Variables

Create a `.env.local` file with:

```env
# For production deployment
NEXT_PUBLIC_API_URL=your-api-gateway-url

# Amplify configuration (already in amplifyconfiguration.json)
```

## Deployment to Vercel/Netlify

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel/Netlify
3. Add environment variables in the deployment settings
4. Deploy!

## Troubleshooting

### CORS Issues
If you get CORS errors, ensure your API Gateway has CORS enabled (already configured in CDK).

### Authentication Issues
Make sure users are logged in before making API calls. The app uses Cognito for authentication.

### Database Connection Issues
DocumentDB requires VPC connectivity. Lambda functions must be in the same VPC.

## Cost Considerations

- **Amplify Sandbox**: Free tier available
- **DocumentDB**: ~$200/month minimum (consider DynamoDB for lower cost)
- **Lambda**: Pay per request (very low cost for small apps)
- **API Gateway**: Pay per request

## Recommended Approach

For a personal project or MVP, use **Option 1** (Amplify GraphQL). It's:
- Easier to set up
- Cheaper to run
- Includes real-time subscriptions
- Automatically handles authentication

For production applications requiring MongoDB compatibility, use **Option 2** (CDK with DocumentDB).