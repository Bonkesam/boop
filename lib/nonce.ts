// lib/nonce.ts
import  prisma  from '@/lib/prisma'
import { randomBytes } from 'crypto'

// Add your deployer address here
const DEPLOYER_ADDRESS = process.env.DEPLOYER_ADDRESS?.toLowerCase() || ''

// Helper function to check if address is deployer
const isDeployerAddress = (address: string): boolean => {
  return address.toLowerCase() === DEPLOYER_ADDRESS
}

// Generate a new nonce for an address
export const generateNonce = async (address: string): Promise<string> => {
  // Generate 16 bytes (not 32) to get 32 hex characters
  const nonce = randomBytes(16).toString('hex')
  
  // Check if this is the deployer address
  const isAdmin = isDeployerAddress(address)
  
  // Find or create user with the new nonce
  const user = await prisma.user.upsert({
    where: { address: address.toLowerCase() },
    update: { 
      nonce,
      lastNonceUpdate: new Date(),
      // Update admin status if needed (in case deployer address changes)
      isAdmin: isAdmin
    },
    create: {
      address: address.toLowerCase(),
      nonce,
      lastNonceUpdate: new Date(),
      name: address, // Default name to address
      email: `${address.toLowerCase()}@wallet.local`, // Default email
      isAdmin: isAdmin, // Set admin status based on deployer check
      lastLogin: new Date() // Set initial login time
    }
  })
  
  return nonce
}

// Get nonce for an address
export const getNonce = async (address: string): Promise<string | null> => {
  const user = await prisma.user.findUnique({
    where: { address: address.toLowerCase() },
    select: { nonce: true, lastNonceUpdate: true }
  })
  
  if (!user?.nonce || !user.lastNonceUpdate) {
    return null
  }
  
  // Check if nonce is still valid (5 minutes)
  const now = new Date()
  const lastUpdate = new Date(user.lastNonceUpdate)
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000)
  
  if (lastUpdate < fiveMinutesAgo) {
    return null
  }
  
  return user.nonce
}

// Verify nonce and update last login
export const verifyNonce = async (address: string, nonce: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { address: address.toLowerCase() },
    select: { nonce: true, lastNonceUpdate: true }
  })
  
  if (!user?.nonce || !user.lastNonceUpdate) {
    return false
  }
  
  // Check expiration (5 minutes)
  const now = new Date()
  const lastUpdate = new Date(user.lastNonceUpdate)
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000)
  
  if (lastUpdate < fiveMinutesAgo) {
    return false
  }
  
  const isValid = user.nonce === nonce
  
  // Update last login on successful verification
  if (isValid) {
    await prisma.user.update({
      where: { address: address.toLowerCase() },
      data: { lastLogin: new Date() }
    })
  }
  
  return isValid
}

// Invalidate nonce after use
export const invalidateNonce = async (address: string): Promise<void> => {
  try {
    await prisma.user.update({
      where: { address: address.toLowerCase() },
      data: { 
        nonce: null,
        lastNonceUpdate: new Date() 
      }
    })
  } catch (error) {
    // Handle case where user might not exist
    console.error('Error invalidating nonce:', error)
  }
}

// Helper function to get user admin status
export const getUserAdminStatus = async (address: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { address: address.toLowerCase() },
    select: { isAdmin: true }
  })
  
  return user?.isAdmin || false
}