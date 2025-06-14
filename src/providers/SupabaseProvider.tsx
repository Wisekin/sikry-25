"use client"

import { createClient } from '@/src/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect } from 'react'

const SupabaseContext = createContext<ReturnType<typeof createClient> | null>(null)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      } else if (event === 'SIGNED_IN') {
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  return <>{children}</>
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === null) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}