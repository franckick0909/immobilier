'use client'

import { Button } from '@/components/ui/buttons'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { register } from '@/app/actions/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsLoading(false)
      return
    }

    try {
      const result = await register(formData)

      if (result.error) {
        setError(result.error)
        return
      }

      router.push('/auth/login?registered=true')
    } catch (error) {
      console.error(error)
      setError('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
    >
      <div className="w-full max-w-md space-y-8">
        <div className="bg-white px-6 py-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Créer un compte
          </h2>
          
          <form onSubmit={onSubmit} className="space-y-6">
            <Input
              label="Nom"
              name="name"
              type="text"
              required
              placeholder="Votre nom"
            />

            <Input
              label="Email"
              name="email"
              type="email"
              required
              placeholder="votre@email.com"
            />

            <Input
              label="Mot de passe"
              name="password"
              type="password"
              required
              placeholder="••••••••"
            />

            <Input
              label="Confirmer le mot de passe"
              name="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
            />

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-red-500"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              S&apos;inscrire
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link 
              href="/auth/login"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Déjà un compte ? Se connecter
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}