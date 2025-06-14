"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { useAuth } from "@/src/providers/AuthProvider"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import Link from "next/link"
import { useTranslation } from 'react-i18next';

export default function SignupPage() {
  const { t } = useTranslation('auth');
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError(t('errors.passwordsDontMatch'));
      setLoading(false)
      return
    }

    try {
      await signUp(formData.email, formData.password)
      router.push("/dashboard")
    } catch (err) {
      setError(t('errors.accountCreationFailed'));
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
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
          <CardTitle className="text-2xl font-bold text-center">{t('signup.title')}</CardTitle>
          <CardDescription className="text-center">{t('signup.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('signup.firstNameLabel')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder={t('signup.firstNamePlaceholder')}
                    value={formData.firstName}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('signup.lastNameLabel')}</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder={t('signup.lastNamePlaceholder')}
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label> {/* Using common 'email' key */}
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('signup.emailPlaceholder')} {/* Specific placeholder for signup */}
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label> {/* Using common 'password' key */}
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('signup.passwordPlaceholder')} {/* Specific placeholder for signup */}
                  value={formData.password}
                  onChange={handleChange}
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('signup.confirmPasswordLabel')}</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder={t('signup.confirmPasswordPlaceholder')}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('signup.buttons.creatingAccount') : t('signup.buttons.createAccount')}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            {t('signup.alreadyHaveAccount')}{" "}
            <Link href="/login" className="text-primary hover:underline">
              {t('signup.signInLink')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
