export const APP_NAME = 'Anime Universe'
export const APP_DESCRIPTION = 'Discover and share your favorite anime stories'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/home',
  EXPLORE: '/explore',
  CREATE: '/create',
  PROFILE: '/profile',
} as const

export const GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Thriller',
] as const