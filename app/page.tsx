// app/page.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, Zap, Gift, PieChart, TrendingUp } from 'lucide-react'
import gsap from 'gsap'
import WalletAuthButton from '@/components/auth/WalletButton'

const useGsapFadeIn = (selector: string) => {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current.querySelectorAll(selector),
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.2,
          ease: 'power3.out',
        }
      )
    }
  }, [])
  return ref
}

const WalletCard = () => {
  const walletCardRef = useRef<HTMLDivElement | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const card = walletCardRef.current
    if (!card) return

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isInteractive = target.closest('button, a, input, select, textarea')
      
      if (isInteractive) return

      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotateX = (y - centerY) / 20
      const rotateY = (centerX - x) / 20

      gsap.to(card, {
        rotationX: rotateX,
        rotationY: rotateY,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    const handleMouseEnter = () => {
      setIsHovered(true)
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.5,
        ease: 'power2.out',
      })
    }

    card.addEventListener('mousemove', handleMouseMove)
    card.addEventListener('mouseenter', handleMouseEnter)
    card.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      card.removeEventListener('mousemove', handleMouseMove)
      card.removeEventListener('mouseenter', handleMouseEnter)
      card.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div className="flex flex-col gap-4 items-center w-full max-w-sm fade-in">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 w-full text-white shadow-lg transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:shadow-xl">
        <h2 className="text-2xl font-bold text-center">Welcome to beep</h2>
      </div>
      <div 
        ref={walletCardRef}
        className="w-full relative"
        style={{ 
          transformStyle: 'preserve-3d',
          pointerEvents: 'auto'
        }}
      >
        <div 
          className="relative z-10 w-full"
          style={{ 
            pointerEvents: 'auto',
            transform: isHovered ? 'translateZ(10px)' : 'translateZ(0px)',
            transition: 'transform 0.3s ease'
          }}
        >
          <WalletAuthButton 
            variant="glassmorphism" 
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}

const ProtocolDistribution = () => {
  const protocols = [
    { name: 'Winner Reward', pct: '30%', desc: 'Profit goes to golden ticket winner.', icon: <Gift className="w-5 h-5 text-yellow-400" /> },
    { name: 'Lucky Winners', pct: '40%', desc: '9 silver ticket winners share the pool.', icon: <PieChart className="w-5 h-5 text-pink-400" /> },
    { name: 'DAO Treasury', pct: '30%', desc: 'Held for community decisions made by all.', icon: <TrendingUp className="w-5 h-5 text-indigo-400" /> },
  ]

  const ref = useGsapFadeIn('.protocol-card')

  return (
    <div ref={ref} className="flex flex-col gap-4 w-full max-w-md fade-in">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-6 py-4 text-white shadow-lg transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:shadow-xl hover:scale-[1.02]">
        <h2 className="text-2xl font-bold">Protocol Distribution</h2>
      </div>
      {protocols.map((p, i) => (
        <div
          key={i}
          className="protocol-card group transition-all duration-300 ease-out hover:scale-[1.05] hover:shadow-xl hover:bg-white/15 hover:border-white/30 hover:-translate-y-1 flex items-start justify-between p-4 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 text-white shadow cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="transition-all duration-300 group-hover:scale-125 group-hover:rotate-6">
              {p.icon}
            </div>
            <div>
              <p className="text-lg font-bold tracking-wide transition-all duration-300 group-hover:tracking-wider group-hover:text-white">{p.pct}</p>
              <p className="text-sm text-white/80 transition-all duration-300 group-hover:text-white/90">{p.name}</p>
            </div>
          </div>
          <p className="text-xs text-white/60 max-w-xs text-right transition-all duration-300 group-hover:text-white/80">{p.desc}</p>
        </div>
      ))}
    </div>
  )
}

const LoginPage = () => {
  const pageRef = useRef<HTMLDivElement | null>(null)
  const bgRef = useRef<HTMLImageElement | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const [isRedirecting, setIsRedirecting] = useState(false)
  
  // Authentication and redirect logic
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Handle authentication redirects
  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (isRedirecting) return // Already redirecting, prevent multiple redirects

    if (session?.user) {
      setIsRedirecting(true)
      
      // Get the callback URL from search params
      const callbackUrl = searchParams.get('callbackUrl')
      
      // Determine redirect URL
      let redirectUrl = '/'
      
      if (callbackUrl && callbackUrl !== '/' && callbackUrl !== window.location.pathname) {
        // If there's a specific callback URL and it's not the current page, use it
        redirectUrl = callbackUrl
      } else {
        // Otherwise, redirect based on user role
        redirectUrl = session.user.isAdmin ? '/admin' : '/dashboard'
      }
      
      // Only redirect if we're not already on the target page
      if (window.location.pathname !== redirectUrl) {
        // Use replace instead of push to prevent back button issues
        router.replace(redirectUrl)
      } else {
        // If we're already on the target page, just stop the redirect loop
        setIsRedirecting(false)
      }
    }
  }, [session, status, router, searchParams, isRedirecting])

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current.querySelectorAll('.fade-in'),
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: 'power2.out',
        }
      )
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    const handleSmoothScroll = () => {
      document.documentElement.style.scrollBehavior = 'smooth'
    }

    window.addEventListener('scroll', handleScroll)
    handleSmoothScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])

  useEffect(() => {
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        y: scrollY * 0.5,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }, [scrollY])

  // Combined loading and redirecting state
  if (status === 'loading' || (session?.user && isRedirecting)) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>{session?.user ? "Redirecting to your dashboard..." : "Loading..."}</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={pageRef} className="relative min-h-screen bg-black text-white overflow-hidden font-sans">
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        html { scroll-behavior: smooth; }
        
        button {
          pointer-events: auto !important;
          position: relative;
          z-index: 10;
        }
        
        .wallet-button-container {
          transform-style: flat !important;
        }
      `}</style>

      <img
        ref={bgRef}
        src="/images/bg.jpg"
        alt="Gaming background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
      />
      <div className="absolute inset-0 bg-black/70 z-0" />

      <header className="relative z-10 w-full flex justify-start px-6 pt-6 fade-in">
        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-4 py-2 transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:shadow-lg hover:scale-105 cursor-pointer">
          <Zap className="w-5 h-5 text-white transition-all duration-300 hover:scale-110 hover:text-yellow-400" />
          <span className="text-white font-semibold text-sm tracking-wide transition-all duration-300 hover:tracking-wider">beep</span>
        </div>
      </header>

      <div className="relative z-10 flex flex-col-reverse lg:flex-row items-center justify-between h-full px-6 py-12 gap-10 lg:gap-24 fade-in">
        <div className="w-full lg:w-1/2 flex justify-start lg:justify-start fade-in">
          <ProtocolDistribution />
        </div>
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-start fade-in">
          <WalletCard />
        </div>
      </div>
    </div>
  )
}

export default LoginPage;