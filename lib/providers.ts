import { recoverMessageAddress } from 'viem'
import  prisma  from '@/lib/prisma'
import { verifyNonce } from './nonce'
import type { CredentialsConfig } from 'next-auth/providers/credentials'

export const walletProvider: CredentialsConfig = {
  id: 'wallet',
  name: 'Ethereum',
  type: 'credentials',
  credentials: {
    address: { label: 'Address', type: 'text' },
    signature: { label: 'Signature', type: 'text' },
    nonce: { label: 'Nonce', type: 'text' }
  },
  async authorize(credentials) {
    try {
      if (!credentials) {
        return null
      }

      // Type guard and extract credentials
      const address = credentials.address as string
      const signature = credentials.signature as string
      const nonce = credentials.nonce as string

      if (!address || !signature || !nonce) {
        return null
      }
      
      // 1. Verify nonce
      const validNonce = await verifyNonce(address, nonce)
      if (!validNonce) return null
      
      // 2. Verify signature
      const message = `dFortune Authentication: ${nonce}`
      const recoveredAddress = await recoverMessageAddress({
        message,
        signature: signature as `0x${string}`
      })
      
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return null
      }
      
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