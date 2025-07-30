export interface User {
  id: string
  email: string
  username?: string
  createdAt: string
  updatedAt: string
}

export interface AnimeItem {
  id: number
  title: string
  genre: string
  episodes: number
  rating: number
  image: string
  description: string
}

export interface BlogPost {
  id: string
  title: string
  content: string
  excerpt?: string
  author: User
  tags: string[]
  coverImage?: string
  createdAt: string
  updatedAt: string
  published: boolean
}

export interface Comment {
  id: string
  content: string
  author: User
  postId: string
  createdAt: string
  updatedAt: string
}

export type AuthState = 'authenticated' | 'unauthenticated' | 'loading'