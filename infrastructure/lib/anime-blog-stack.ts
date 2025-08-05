import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as docdb from 'aws-cdk-lib/aws-docdb';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as path from 'path';

export class AnimeBlogStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC for DocumentDB
    const vpc = new ec2.Vpc(this, 'AnimeBlogVPC', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 24,
          name: 'Isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // Create security group for DocumentDB
    const docdbSecurityGroup = new ec2.SecurityGroup(this, 'DocDBSecurityGroup', {
      vpc,
      description: 'Security group for DocumentDB cluster',
      allowAllOutbound: true,
    });

    // Create security group for Lambda
    const lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSecurityGroup', {
      vpc,
      description: 'Security group for Lambda functions',
      allowAllOutbound: true,
    });

    // Allow Lambda to connect to DocumentDB
    docdbSecurityGroup.addIngressRule(
      lambdaSecurityGroup,
      ec2.Port.tcp(27017),
      'Allow Lambda to connect to DocumentDB'
    );

    // Create credentials for DocumentDB
    const docdbCredentials = new secretsmanager.Secret(this, 'DocDBCredentials', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'animeblogadmin' }),
        generateStringKey: 'password',
        excludeCharacters: ' %+~`#$&*()|[]{}:;<>?!\'/@"\\',
      },
    });

    // Create DocumentDB subnet group
    const subnetGroup = new docdb.CfnDBSubnetGroup(this, 'DocDBSubnetGroup', {
      dbSubnetGroupDescription: 'Subnet group for DocumentDB',
      subnetIds: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }).subnetIds,
      dbSubnetGroupName: 'anime-blog-subnet-group',
    });

    // Create DocumentDB cluster
    const docdbCluster = new docdb.CfnDBCluster(this, 'DocDBCluster', {
      dbClusterIdentifier: 'anime-blog-cluster',
      masterUsername: 'animeblogadmin',
      masterUserPassword: docdbCredentials.secretValueFromJson('password').unsafeUnwrap(),
      engineVersion: '5.0.0',
      dbSubnetGroupName: subnetGroup.dbSubnetGroupName!,
      vpcSecurityGroupIds: [docdbSecurityGroup.securityGroupId],
    });

    docdbCluster.addDependency(subnetGroup);

    // Create DocumentDB instance
    const docdbInstance = new docdb.CfnDBInstance(this, 'DocDBInstance', {
      dbClusterIdentifier: docdbCluster.dbClusterIdentifier!,
      dbInstanceIdentifier: 'anime-blog-instance',
      dbInstanceClass: 'db.t3.medium',
    });

    docdbInstance.addDependency(docdbCluster);

    // Lambda layer for MongoDB driver
    const mongoLayer = new lambda.LayerVersion(this, 'MongoLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda-layers/mongodb')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: 'MongoDB driver for Lambda functions',
    });

    // Environment variables for Lambda functions
    const lambdaEnv = {
      MONGODB_URI: `mongodb://${docdbCredentials.secretValueFromJson('username').unsafeUnwrap()}:${docdbCredentials.secretValueFromJson('password').unsafeUnwrap()}@${docdbCluster.attrEndpoint}:${docdbCluster.attrPort}/animeblog?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`,
      DATABASE_NAME: 'animeblog',
      TLS_REJECT_UNAUTHORIZED: '0', // For development only
    };

    // Create Lambda functions
    const userProfileLambda = new lambda.Function(this, 'UserProfileFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../amplify/backend/function/userProfile/src')),
      handler: 'index.handler',
      environment: lambdaEnv,
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [lambdaSecurityGroup],
      timeout: cdk.Duration.seconds(30),
      layers: [mongoLayer],
    });

    const postsLambda = new lambda.Function(this, 'PostsFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../amplify/backend/function/posts/src')),
      handler: 'index.handler',
      environment: lambdaEnv,
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [lambdaSecurityGroup],
      timeout: cdk.Duration.seconds(30),
      layers: [mongoLayer],
    });

    const commentsLambda = new lambda.Function(this, 'CommentsFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../amplify/backend/function/comments/src')),
      handler: 'index.handler',
      environment: lambdaEnv,
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [lambdaSecurityGroup],
      timeout: cdk.Duration.seconds(30),
      layers: [mongoLayer],
    });

    const likesLambda = new lambda.Function(this, 'LikesFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../amplify/backend/function/likes/src')),
      handler: 'index.handler',
      environment: lambdaEnv,
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [lambdaSecurityGroup],
      timeout: cdk.Duration.seconds(30),
      layers: [mongoLayer],
    });

    const followsLambda = new lambda.Function(this, 'FollowsFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../amplify/backend/function/follows/src')),
      handler: 'index.handler',
      environment: lambdaEnv,
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [lambdaSecurityGroup],
      timeout: cdk.Duration.seconds(30),
      layers: [mongoLayer],
    });

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'AnimeBlogAPI', {
      restApiName: 'Anime Blog Social API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // User Profile Routes
    const users = api.root.addResource('users');
    const userById = users.addResource('{userId}');
    const profile = userById.addResource('profile');
    const followers = userById.addResource('followers');
    const following = userById.addResource('following');
    const stats = userById.addResource('stats');
    const mutual = userById.addResource('mutual');

    profile.addMethod('GET', new apigateway.LambdaIntegration(userProfileLambda));
    profile.addMethod('PUT', new apigateway.LambdaIntegration(userProfileLambda));
    followers.addMethod('GET', new apigateway.LambdaIntegration(userProfileLambda));
    following.addMethod('GET', new apigateway.LambdaIntegration(userProfileLambda));
    stats.addMethod('GET', new apigateway.LambdaIntegration(userProfileLambda));
    const mutualTarget = mutual.addResource('{targetUserId}');
    mutualTarget.addMethod('GET', new apigateway.LambdaIntegration(userProfileLambda));

    // Posts Routes
    const posts = api.root.addResource('posts');
    const postById = posts.addResource('{postId}');
    const feed = posts.addResource('feed');
    const userPosts = posts.addResource('user').addResource('{userId}');

    posts.addMethod('POST', new apigateway.LambdaIntegration(postsLambda));
    posts.addMethod('GET', new apigateway.LambdaIntegration(postsLambda));
    postById.addMethod('GET', new apigateway.LambdaIntegration(postsLambda));
    postById.addMethod('PUT', new apigateway.LambdaIntegration(postsLambda));
    postById.addMethod('DELETE', new apigateway.LambdaIntegration(postsLambda));
    feed.addMethod('GET', new apigateway.LambdaIntegration(postsLambda));
    userPosts.addMethod('GET', new apigateway.LambdaIntegration(postsLambda));

    // Comments Routes
    const comments = api.root.addResource('comments');
    const commentById = comments.addResource('{commentId}');
    const postComments = comments.addResource('post').addResource('{postId}');

    comments.addMethod('POST', new apigateway.LambdaIntegration(commentsLambda));
    commentById.addMethod('PUT', new apigateway.LambdaIntegration(commentsLambda));
    commentById.addMethod('DELETE', new apigateway.LambdaIntegration(commentsLambda));
    postComments.addMethod('GET', new apigateway.LambdaIntegration(commentsLambda));

    // Likes Routes
    const likes = api.root.addResource('likes');
    const like = likes.addResource('like');

    like.addMethod('POST', new apigateway.LambdaIntegration(likesLambda));
    likes.addMethod('GET', new apigateway.LambdaIntegration(likesLambda));

    // Follows Routes
    const follows = api.root.addResource('follows');
    const follow = follows.addResource('follow');
    const suggestions = follows.addResource('suggestions');
    const checkFollow = follows.addResource('check');

    follow.addMethod('POST', new apigateway.LambdaIntegration(followsLambda));
    suggestions.addMethod('GET', new apigateway.LambdaIntegration(followsLambda));
    checkFollow.addMethod('GET', new apigateway.LambdaIntegration(followsLambda));

    // Grant Lambda functions access to secrets
    [userProfileLambda, postsLambda, commentsLambda, likesLambda, followsLambda].forEach(fn => {
      docdbCredentials.grantRead(fn);
    });

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'URL of the Anime Blog API',
    });

    // Output the DocumentDB endpoint
    new cdk.CfnOutput(this, 'DocumentDBEndpoint', {
      value: docdbCluster.attrEndpoint,
      description: 'DocumentDB cluster endpoint',
    });
  }
}