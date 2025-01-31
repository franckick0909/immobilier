'use client'

import { Button } from "@/components/ui/buttons"
import { Input } from "@/components/ui/input"
import { register } from "@/app/actions/auth"
import { useState, Suspense } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { AuthRedirect } from "@/components/auth/authRedirect"

import { FaEye, FaEyeSlash } from "react-icons/fa"
import { GoogleSignInButton } from "@/components/auth/googleSigninButton"
import { PasswordStrength } from "@/components/ui/PasswordStrength"
import { Modal } from "@/components/ui/Modal"
import { VerificationModalContent } from "@/components/auth/verificationModalContent"



function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Tous les champs sont requis')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      setIsLoading(false)
      return
    }

    try {
      const result = await register({
        name,
        email,
        password
      })

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      // Ouvrir la modal après une inscription réussie
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
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-gray-50 px-4"

    >
      <div className="w-full max-w-md space-y-8">
        <div className="bg-white px-6 py-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Inscription
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

            <div className="relative">
              <Input
                label="Mot de passe"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5" />
                ) : (
                  <FaEye className="h-5 w-5" />
                )}
              </button>
              <PasswordStrength password={password} />
            </div>


            <div className="relative">
              <Input
                label="Confirmer le mot de passe"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="h-5 w-5" />
                ) : (
                  <FaEye className="h-5 w-5" />
                )}
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-red-50 border border-red-200 rounded-md"
              >
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            <Button type="submit" isLoading={isLoading} className="w-full">
              S&apos;inscrire
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Ou continuer avec
                </span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleSignInButton />
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Déjà un compte ? <span className="underline">Se connecter</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <VerificationModalContent 
          email={registeredEmail} 
          onClose={() => setIsModalOpen(false)} 
        />
      </Modal>
    </>
  )
}


export default function RegisterPage() {
  return (
    <>
      <AuthRedirect />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </>
  )
}