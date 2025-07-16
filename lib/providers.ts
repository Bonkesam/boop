import { recoverMessageAddress } from 'viem'
import  prisma  from '@/lib/prisma'
import { verifyNonce } from './nonce'
import type { CredentialsConfig } from 'next-auth/providers/credentials'

export const walletProvider: CredentialsConfig = {
  id: 'wallet', // Make sure this matches what you call in signIn()
  name: 'Ethereum Wallet',
  type: 'credentials',
  credentials: {
    address: { label: 'Address', type: 'text' },
    signature: { label: 'Signature', type: 'text' },
    nonce: { label: 'Nonce', type: 'text' }
  },
  async authorize(credentials) {
    try {
      console.log('Wallet provider authorize called with:', credentials)
      
      if (!credentials) {
        console.log('No credentials provided')
        return null
      }

      // Type guard and extract credentials
      const address = credentials.address as string
      const signature = credentials.signature as string
      const nonce = credentials.nonce as string

      if (!address || !signature || !nonce) {
        console.log('Missing required credentials:', { address: !!address, signature: !!signature, nonce: !!nonce })
        return null
      }
      
      console.log('Verifying nonce for address:', address)
      
      // 1. Verify nonce
      const validNonce = await verifyNonce(address, nonce)
      if (!validNonce) {
        console.log('Invalid nonce for address:', address)
        return null
      }
      
      console.log('Nonce valid, verifying signature...')
      
      // 2. Verify signature
      const message = `dFortune Authentication: ${nonce}`
      const recoveredAddress = await recoverMessageAddress({
        message,
        signature: signature as `0x${string}`
      })
      
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        console.log('Signature verification failed:', { recoveredAddress, expectedAddress: address })
        return null
      }
      
      console.log('Signature verified, creating/updating user...')
      
      // 3. Get or create user with required fields
      const user = await prisma.user.upsert({
        where: { address: address.toLowerCase() },
        create: {
          address: address.toLowerCase(),
          name: `User-${address.slice(2, 8)}`,
          isAdmin: address.toLowerCase() === process.env.DEPLOYER_ADDRESS?.toLowerCase()
        },
        update: { lastLogin: new Date() }
      })
      
      console.log('User created/updated:', { id: user.id, address: user.address, isAdmin: user.isAdmin })
      
      // Return user object that matches the User interface
      return {
        id: user.id,
        address: user.address,
        isAdmin: user.isAdmin,
        name: user.name || `User-${user.address.slice(2, 8)}`,
        email: user.email || null,
        image: user.image || null
      }
    } catch (error) {
      console.error('Authorization error:', error)
      return null
    }
  }
}