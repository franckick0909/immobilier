'use client'

import { Button } from '@/components/ui/buttons'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { register } from '@/app/actions/auth'
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { PasswordStrength } from '@/components/ui/PasswordStrength'
import { Modal } from '@/components/ui/Modal'
import { SendgridVerificationButton } from '@/components/auth/sendgridVerificationButton'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  const toggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev)
  }, [])

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    router.push('/auth/login')
  }, [router])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Validation du formulaire
    if (!email || !password || !confirmPassword) {
      setError('Tous les champs sont requis')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setIsLoading(false)
      return
    }

    try {
      const result = await register(formData)

      if (result.error) {
        setError(result.error)
        return
      }

      setRegisteredEmail(email)
      setIsModalOpen(true)
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error)
      setError('Une erreur est survenue lors de l\'inscription')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12"
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
              autoComplete="name"
            />

            <Input
              label="Email"
              name="email"
              type="email"
              required
              placeholder="votre@email.com"
              autoComplete="email"
            />

            <div className="relative">
              <Input
                label="Mot de passe"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordStrength password={password} />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirmer le mot de passe"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={toggleConfirmPassword}
                className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showConfirmPassword ? "Masquer la confirmation du mot de passe" : "Afficher la confirmation du mot de passe"}
              >
                {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-md bg-red-50 border border-red-200"
                >
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link 
              href="/auth/login"
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              Déjà un compte ? Se connecter
            </Link>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Vérifiez votre email
          </h3>
          
          <div className="mt-3">
            <p className="text-sm text-gray-500">
              Un email de vérification a été envoyé à <strong>{registeredEmail}</strong>.
              Veuillez cliquer sur le lien dans l&apos;email pour activer votre compte.
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-xs text-gray-500">
              Si vous ne trouvez pas l&apos;email, vérifiez votre dossier spam ou :
            </p>
            
            {registeredEmail && (
              <SendgridVerificationButton email={registeredEmail} />
            )}
            
            <button
              type="button"
              className="mt-4 w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none transition-colors duration-200"
              onClick={handleModalClose}
            >
              Aller à la page de connexion
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}