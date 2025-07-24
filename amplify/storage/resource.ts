import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'animeBlogImages',
  access: (allow) => ({
    'blog-images/*': [
      allow.guest.to(['read', 'write']),
      allow.authenticated.to(['read', 'write', 'delete'])
    ],
  })
});