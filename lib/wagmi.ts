// lib/wagmi.ts
import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, polygon, arbitrum, optimism } from 'wagmi/chains'
import { injected, metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors'

// Get WalletConnect project ID from environment
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

export const config = createConfig({
  chains: [mainnet, sepolia, polygon, arbitrum, optimism],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    metaMask({
      dappMetadata: {
        name: 'beep',
        url: 'https://dfortune.com',
        iconUrl: 'https://dfortune.com/icon.png',
      },
    }),
    walletConnect({
      projectId,
      metadata: {
        name: 'beep',
        description: 'Decentralized Fortune Platform',
        url: 'https://dfortune.com',
        icons: ['https://dfortune.com/icon.png'],
      },
    }),
    coinbaseWallet({
      appName: 'beep',
      appLogoUrl: 'https://dfortune.com/icon.png',
    }),
  ],
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