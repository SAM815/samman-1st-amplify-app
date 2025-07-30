import { getCurrentUser, signOut } from 'aws-amplify/auth'
import { redirect } from 'next/navigation'

export async function checkAuth() {
  try {
    const user = await getCurrentUser()
    return user
  } catch {
    return null
  }
}

export async function requireAuth() {
  const user = await checkAuth()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function handleSignOut() {
  try {
    await signOut()
    redirect('/login')
  } catch (error) {
    console.error('Error signing out:', error)
  }
}