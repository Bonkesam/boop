// components/auth/WalletButton.tsx
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi'
import { signIn, signOut, useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Loader2, Wallet, LogOut, ChevronDown, CheckCircle, AlertCircle, Shield } from 'lucide-react'

interface WalletAuthButtonProps {
  className?: string
  variant?: 'default' | 'glassmorphism'
  onAuthSuccess?: (user: any) => void
  autoRedirect?: boolean
}

const WalletAuthButton: React.FC<WalletAuthButtonProps> = ({ 
  className = '', 
  variant = 'default',
  onAuthSuccess,
  autoRedirect = true // Changed default to true
}) => {
  const { data: session, status } = useSession()
  const { address, isConnected, connector } = useAccount()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  const router = useRouter()

  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [showConnectors, setShowConnectors] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authStep, setAuthStep] = useState(0)
  
  // Track authentication attempts per address
  const attemptedAddresses = useRef<Set<string>>(new Set())
  const lastAuthenticatedAddress = useRef<string | null>(null)
  const authInProgress = useRef(false)

  const authSteps = [
    'Connect Wallet',
    'Initializing...',
    'Connecting...',
    'Awaiting Signature...',
    'Verifying...',
    'Welcome!',
  ]

  // Handle wallet disconnection
  useEffect(() => {
    if (!isConnected && session?.user?.address && lastAuthenticatedAddress.current === session.user.address) {
      console.log('Wallet disconnected for authenticated address, signing out...')
      signOut({ redirect: false })
      toast.error('Wallet disconnected')
      // Reset authentication state
      attemptedAddresses.current.clear()
      lastAuthenticatedAddress.current = null
      authInProgress.current = false
      // Always redirect to home on disconnect
      router.push('/')
    }
  }, [isConnected, session?.user?.address, router])

  // Handle address changes
  useEffect(() => {
    if (address) {
      setError(null)
      setAuthStep(0)
      authInProgress.current = false
      
      // If we have a session but it's for a different address, sign out
      if (session?.user?.address && session.user.address !== address) {
        console.log('Address changed, signing out previous session')
        signOut({ redirect: false })
        lastAuthenticatedAddress.current = null
        router.push('/')
      }
    }
  }, [address, session?.user?.address, router])

  const getNonce = async (walletAddress: string): Promise<string> => {
    try {
      const response = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get nonce')
      }

      const { nonce } = await response.json()
      return nonce
    } catch (error) {
      throw new Error(`Nonce generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleAuthentication = useCallback(async () => {
    if (!address) {
      setError('No wallet address found')
      return
    }

    // Check if already authenticated for this address
    if (session?.user?.address === address) {
      console.log('Already authenticated for this address')
      return
    }

    // Prevent multiple authentication attempts
    if (authInProgress.current) {
      console.log('Authentication already in progress')
      return
    }

    console.log('Starting authentication for address:', address)
    
    authInProgress.current = true
    attemptedAddresses.current.add(address)
    setIsAuthenticating(true)
    setError(null)

    try {
      // Step progression for glassmorphism variant
      if (variant === 'glassmorphism') {
        setAuthStep(1)
        await new Promise(resolve => setTimeout(resolve, 300))
        setAuthStep(2)
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // Get nonce from backend
      const nonce = await getNonce(address)
      
      if (variant === 'glassmorphism') {
        setAuthStep(3)
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      
      // Sign message
      const message = `dFortune Authentication: ${nonce}`
      const signature = await signMessageAsync({ message })
      
      if (variant === 'glassmorphism') {
        setAuthStep(4)
        await new Promise(resolve => setTimeout(resolve, 600))
      }
      
      // Use the correct provider ID 'wallet'
      const result = await signIn('wallet', {
        address,
        signature,
        nonce,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      if (result?.ok) {
        console.log('NextAuth signIn successful')
        
        if (variant === 'glassmorphism') {
          setAuthStep(5)
          await new Promise(resolve => setTimeout(resolve, 600))
        }

        console.log('Authentication successful for address:', address)
        toast.success('Successfully authenticated!')
        
        // Mark this address as successfully authenticated
        lastAuthenticatedAddress.current = address
        
        // Call onAuthSuccess callback if provided
        if (onAuthSuccess) {
          onAuthSuccess({ address, isAdmin: result.user?.isAdmin })
        }
        
        // The parent component (page.tsx) will handle the redirect
        // based on the session state change
      }

    } catch (error) {
      console.error('Authentication failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
      setError(errorMessage)
      toast.error(errorMessage)
      
      // Remove from attempted addresses so user can try again
      attemptedAddresses.current.delete(address)
      
      // Disconnect wallet on auth failure
      disconnect()
      setAuthStep(0)
    } finally {
      setIsAuthenticating(false)
      authInProgress.current = false
    }
  }, [address, variant, signMessageAsync, disconnect, session?.user?.address, onAuthSuccess])

  const handleConnect = useCallback(async (connectorToUse: any) => {
    try {
      setError(null)
      setShowConnectors(false)
      connect({ connector: connectorToUse })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [connect])

  const handleDisconnect = useCallback(async () => {
    try {
      console.log('Manually disconnecting wallet')
      disconnect()
      if (session) {
        await signOut({ redirect: false })
      }
      setAuthStep(0)
      attemptedAddresses.current.clear()
      lastAuthenticatedAddress.current = null
      authInProgress.current = false
      toast.success('Wallet disconnected')
      router.push('/')
    } catch (error) {
      toast.error('Failed to disconnect wallet')
    }
  }, [disconnect, session, router])

  const handleConnectClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (variant === 'glassmorphism' && connectors.length > 0) {
      // Auto-select first available connector for glassmorphism
      const firstConnector = connectors[0]
      handleConnect(firstConnector)
    } else {
      setShowConnectors(!showConnectors)
    }
  }, [variant, connectors, handleConnect, showConnectors])

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Glassmorphism variant styling
  const glassmorphismStyles = {
    card: "bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-white shadow-lg transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:shadow-xl",
    button: "group w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-700/40 border border-white/20 rounded-xl transition-all duration-300 hover:bg-purple-700/80 hover:shadow-lg hover:-translate-y-1 hover:scale-105 active:scale-95 active:translate-y-0 cursor-pointer relative z-20",
    error: "mt-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm transition-all duration-300 hover:bg-red-500/20 hover:border-red-500/30",
    success: "mt-4 flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-sm transition-all duration-300 hover:bg-green-500/20 hover:border-green-500/30",
    connectedStatus: "flex items-center space-x-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 text-white",
    disconnectButton: "flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer relative z-20"
  }

  // Default variant styling
  const defaultStyles = {
    card: "space-y-4",
    button: "w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer relative z-20",
    error: "bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800",
    success: "bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800",
    connectedStatus: "flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-green-800",
    disconnectButton: "flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg transition-colors cursor-pointer relative z-20"
  }

  const styles = variant === 'glassmorphism' ? glassmorphismStyles : defaultStyles

  // Loading state
  if (status === 'loading') {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      </div>
    )
  }

  // Authenticated state - show connected wallet info
  if (session && isConnected && session.user.address === address) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="hidden sm:block">
          <div className={styles.connectedStatus}>
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">
              {formatAddress(address!)}
            </span>
            <span className="text-xs opacity-70">
              {connector?.name}
            </span>
            {/* Show admin indicator */}
            {session?.user?.isAdmin && (
              <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                Admin
              </span>
            )}
          </div>
        </div>
        
        {/* Add navigation buttons for authenticated users */}
        <div className="flex items-center space-x-2">
          {session.user.isAdmin && (
            <button
              onClick={() => router.push('/admin')}
              className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Admin
            </button>
          )}
          <button
            onClick={() => router.push('/dashboard')}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Dashboard
          </button>
        </div>
        
        <button
          onClick={handleDisconnect}
          className={styles.disconnectButton}
          type="button"
        >
          <LogOut className="h-4 w-4" />
          <span>Disconnect</span>
        </button>
      </div>
    )
  }

  // Main wallet connection UI
  return (
    <div className={`${styles.card} ${className}`} style={{ position: 'relative', zIndex: 10 }}>
      {variant === 'glassmorphism' && (
        <h2 className="text-xl font-bold mb-4">Connect Your Wallet</h2>
      )}
      
      {error && (
        <div className={styles.error}>
          <AlertCircle className="w-4 h-4 text-red-400 transition-all duration-300 hover:scale-110" />
          <span>{error}</span>
        </div>
      )}

      {/* Wallet connected but not authenticated */}
      {isConnected && !session && (
        <button
          onClick={handleAuthentication}
          disabled={isAuthenticating}
          className={styles.button}
          type="button"
        >
          {isAuthenticating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin transition-all duration-300 group-hover:scale-110" />
              <span className="tracking-wide transition-all duration-300 group-hover:tracking-wider">
                {variant === 'glassmorphism' ? authSteps[authStep] : 'Authenticating...'}
              </span>
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4 transition-all duration-300 group-hover:scale-110" />
              <span className="tracking-wide transition-all duration-300 group-hover:tracking-wider">
                Sign Message to Authenticate
              </span>
            </>
          )}
        </button>
      )}

      {/* Wallet not connected */}
      {!isConnected && (
        <div className="relative" style={{ zIndex: 10 }}>
          <button
            onClick={handleConnectClick}
            disabled={isConnecting || isAuthenticating}
            className={styles.button}
            type="button"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin transition-all duration-300 group-hover:scale-110" />
                <span className="tracking-wide transition-all duration-300 group-hover:tracking-wider">
                  {variant === 'glassmorphism' ? authSteps[authStep] : 'Connecting...'}
                </span>
              </>
            ) : authStep === 5 ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-400 transition-all duration-300 group-hover:scale-110" />
                <span className="tracking-wide transition-all duration-300 group-hover:tracking-wider">
                  {authSteps[authStep]}
                </span>
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4 transition-all duration-300 group-hover:scale-110" />
                <span className="tracking-wide transition-all duration-300 group-hover:tracking-wider">
                  {variant === 'glassmorphism' ? authSteps[authStep] : 'Connect Wallet'}
                </span>
                {variant === 'default' && <ChevronDown className="h-4 w-4" />}
              </>
            )}
          </button>

          {showConnectors && variant === 'default' && (
            <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-30">
              <div className="p-2 space-y-1">
                {connectors.map((connector) => (
                  <button
                    key={connector.id}
                    onClick={() => handleConnect(connector)}
                    disabled={isConnecting}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition-colors flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    type="button"
                  >
                    {connector.icon && (
                      <img
                        src={connector.icon}
                        alt={connector.name}
                        className="h-6 w-6"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {connector.name}
                      </div>
                      {connector.type === 'injected' && typeof window !== 'undefined' && !window.ethereum && (
                        <div className="text-xs text-gray-500">Not installed</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {authStep === 5 && variant === 'glassmorphism' && (
        <div className={styles.success}>
          <CheckCircle className="w-4 h-4 text-green-400 transition-all duration-300 hover:scale-110" />
          <span>Authenticated successfully!</span>
        </div>
      )}

      {variant === 'glassmorphism' && (
        <p className="mt-4 text-sm flex items-center text-white/70 transition-all duration-300 hover:text-white/90">
          <Shield className="w-4 h-4 mr-2 text-purple-400 transition-all duration-300 hover:scale-110 hover:text-purple-300" />
          Secure blockchain authentication
        </p>
      )}

      {variant === 'default' && (
        <p className="text-xs text-gray-500 text-center">
          By connecting your wallet, you agree to sign a message to verify your identity.
        </p>
      )}
    </div>
  )
}

export default WalletAuthButton;