"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { createClient } from "@/src/utils/supabase/client"

const supabase = createClient()

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ user: User; session: Session } | null>
  signUp: (email: string, password: string) => Promise<{ user: User | null; session: Session | null } | null>
  signOut: () => Promise<{ success: boolean }>
  resetPassword: (email: string) => Promise<{ data: any; error: any } | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('[Auth] Initializing auth state...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] Error getting initial session:', error);
          return;
        }

        if (initialSession) {
          console.log('[Auth] Initial session found for user:', initialSession.user.id);
          setSession(initialSession);
          setUser(initialSession.user);
        } else {
          console.log('[Auth] No initial session found');
        }
      } catch (error) {
        console.error('[Auth] Error during initialization:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('[Auth] Auth state changed:', event);
        console.log('[Auth] Current session:', currentSession ? 'exists' : 'none');
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Inactivity auto-logout (15 minutes)
  useEffect(() => {
    console.log('[Auth] Setting up inactivity timer');
    let timeout: NodeJS.Timeout | null = null;
    const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes

    const resetTimer = () => {
      console.log('[Auth] Resetting inactivity timer');
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        console.log('[Auth] Inactivity limit reached, signing out');
        signOut();
      }, INACTIVITY_LIMIT);
    };

    // Listen for user activity
    const activityEvents = ["mousemove", "keydown", "mousedown", "touchstart"];
    activityEvents.forEach((event) => {
      console.log(`[Auth] Adding ${event} listener`);
      window.addEventListener(event, resetTimer);
    });
    resetTimer(); // Start timer on mount

    // Clean up
    return () => {
      console.log('[Auth] Cleaning up inactivity timer');
      if (timeout) clearTimeout(timeout);
      activityEvents.forEach((event) => {
        console.log(`[Auth] Removing ${event} listener`);
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);

  // Auth methods
  const signIn = async (email: string, password: string) => {
    console.log('[Auth] Attempting sign in for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('[Auth] Sign in error:', error);
      throw error
    }

    console.log('[Auth] Sign in successful for user:', data.user.id);
    return data
  }

  const signUp = async (email: string, password: string) => {
    console.log('[Auth] Signing up with email:', email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        console.error('[Auth] Sign up error:', error);
        throw error;
      }
      
      console.log('[Auth] Sign up successful');
      return { 
        user: data.user || null, 
        session: data.session || null 
      };
    } catch (error) {
      console.error('[Auth] Sign up exception:', error);
      throw error;
    }
  }

  const signOut = async () => {
    console.log('[Auth] Signing out');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[Auth] Sign out error:', error);
        throw error;
      }
      console.log('[Auth] Sign out successful');
      // Clear any local state
      setSession(null);
      setUser(null);
      
      // Force a page reload to clear any cached data
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      
      return { success: true };
    } catch (error) {
      console.error('[Auth] Sign out exception:', error);
      throw error;
    }
  }

  const resetPassword = async (email: string) => {
    console.log('[Auth] Resetting password for email:', email);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        console.error('[Auth] Reset password error:', error);
        throw error;
      }
      
      console.log('[Auth] Reset password email sent');
      return { data, error: null };
    } catch (error) {
      console.error('[Auth] Reset password exception:', error);
      return { data: null, error };
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
