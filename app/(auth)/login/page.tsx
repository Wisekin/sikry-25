"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { useAuth } from "@/src/providers/AuthProvider"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn(email, password)
      if (result?.user && result?.session) {
        console.log('[Login] Successful login, redirecting to:', returnTo)
        // Use router.push for client-side navigation
        router.push(returnTo)
      } else {
        throw new Error('No user or session returned from sign in')
      }
    } catch (err) {
      console.error('[Login] Error:', err)
       setError(t('errors.invalidLogin'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">{t('login')}</CardTitle>
          <CardDescription className="text-center">{t('loginDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('buttons.signingIn') : t('buttons.signIn')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/forgot-password" className="text-primary hover:underline">
              {t('forgotPassword')}
            </Link>
          </div>
          <div className="mt-6 text-center text-sm">
            {t('noAccount')}{" "}
            <Link href="/signup" className="text-primary hover:underline">
              {t('signUp')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
