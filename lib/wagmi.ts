// lib/wagmi.ts
import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, polygon, arbitrum, optimism } from 'wagmi/chains'
import { injected, metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors'

// Get WalletConnect project ID from environment
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

// Create connectors with SSR safety
const getConnectors = () => {
  const baseConnectors = [
    injected({
      shimDisconnect: true,
    }),
    metaMask({
      dappMetadata: {
        name: 'beep',
        description: 'Decentralized Fortune Platform',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://dfortune.com',
        iconUrl: 'https://dfortune.com/icon.png',
      },
    }),
    coinbaseWallet({
      appName: 'beep',
      appLogoUrl: 'https://dfortune.com/icon.png',
    }),
  ]

  // Only add WalletConnect on client side to avoid indexedDB issues
  if (typeof window !== 'undefined' && projectId) {
    baseConnectors.push(
      walletConnect({
        projectId,
        metadata: {
          name: 'beep',
          description: 'Decentralized Fortune Platform',
          url: window.location.origin,
          icons: ['https://dfortune.com/icon.png'],
        },
      })
    )
  }

  return baseConnectors
}

export const config = createConfig({
  chains: [mainnet, sepolia, polygon, arbitrum, optimism],
  connectors: getConnectors(),
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
  ssr: true,
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}