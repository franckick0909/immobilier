'use client'

import { Button } from '@/components/ui/buttons'
import { Input } from '@/components/ui/input'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Identifiants invalides')
        return
      }

      router.push('/dashboard')
      router.refresh()
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
            Connexion
          </h2>
          
          <form onSubmit={onSubmit} className="space-y-6">
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
              Se connecter
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link 
              href="/auth/register"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Pas encore de compte ? <span className="underline">S&apos;inscrire</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}