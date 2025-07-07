'use client'

import Link from 'next/link'
import { Shield, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mb-8">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Access Denied</h1>
          <p className="text-white/70 text-lg">
            You don't have permission to access this page.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-6 py-3 text-white transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Dashboard
          </Link>
          
          <div className="text-sm text-white/50">
            If you believe this is an error, please contact support.
          </div>
        </div>
      </div>
    </div>
  )
}