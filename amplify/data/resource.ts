import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  AnimeBlogPost: a
    .model({
      title: a.string().required(),
      content: a.string().required(),
      anime: a.string().required(),
      rating: a.integer().required(),
      createdAt: a.datetime().default(new Date().toISOString()),
      images: a.string().array(),
      tags: a.string().array(),
      likesCount: a.integer().default(0),
      views: a.integer().default(0),
      commentsCount: a.integer().default(0),
      comments: a.hasMany('Comment', 'postId'),
      likes: a.hasMany('PostLike', 'postId'),
      // Owner field will be automatically populated with the user's cognito ID
      owner: a.string(),
      // Store username for display purposes
      authorName: a.string().required(),
    })
    .authorization((allow) => [
      allow.owner(),  // Owner can CRUD their own posts
      allow.authenticated().to(['read', 'update']),  // Other authenticated users can read and update (for likes)
      allow.publicApiKey().to(['read']),  // Public can read posts
    ]),
  
  Comment: a
    .model({
      content: a.string().required(),
      postId: a.id().required(),
      post: a.belongsTo('AnimeBlogPost', 'postId'),
      parentId: a.id(),
      parent: a.belongsTo('Comment', 'parentId'),
      replies: a.hasMany('Comment', 'parentId'),
      createdAt: a.datetime().default(new Date().toISOString()),
      authorName: a.string().required(),
      owner: a.string(),
    })
    .authorization((allow) => [
      allow.owner(),  // Owner can CRUD their own comments
      allow.authenticated().to(['read', 'create']),  // Other users can read and create comments
      allow.publicApiKey().to(['read']),  // Public can read comments
    ]),

  PostLike: a
    .model({
      postId: a.id().required(),
      post: a.belongsTo('AnimeBlogPost', 'postId'),
      userId: a.string().required(),
      userName: a.string().required(),
      createdAt: a.datetime().default(new Date().toISOString()),
      owner: a.string(),
    })
    .authorization((allow) => [
      allow.owner(),  // Owner can CRUD their own likes
      allow.authenticated().to(['read', 'create']),  // Other users can read and create likes
      allow.publicApiKey().to(['read']),  // Public can read likes
    ]),


});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",  // Use Cognito user authentication as default
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
