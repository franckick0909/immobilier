'use client'

import { Button } from "@/components/ui/buttons"
import { Input } from "@/components/ui/input"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense, useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { AuthRedirect } from "@/components/auth/authRedirect"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { login } from "@/app/actions/auth"
import { SendgridVerificationButton } from "@/components/auth/sendgridVerificationButton"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  
  const registered = searchParams.get('registered')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      // Utiliser la fonction login personnalisée d'abord
      const loginResult = await login(formData)
      
      if (loginResult.error) {
        if (loginResult.error === 'Veuillez vérifier votre email avant de vous connecter') {
          setError(
            'Votre email n\'a pas encore été vérifié. Veuillez vérifier votre boîte de réception et cliquer sur le lien de vérification.'
          )
          setIsLoading(false)
          return
        }
        setError(loginResult.error)
        setIsLoading(false)
        return
      }

      // Si la vérification est OK, procéder à la connexion avec NextAuth
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Identifiants invalides")
        setIsLoading(false)
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error(error)
      setError("Une erreur est survenue")
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

          {registered && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 p-4 bg-green-50 text-green-600 rounded-md text-center"
            >
              Inscription réussie ! Veuillez vérifier votre email avant de vous connecter.
            </motion.div>
          )}

          <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
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
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-red-50 border border-red-200 rounded-md"
              >
                <p className="text-sm text-red-700">{error}</p>
                {error.includes('email n\'a pas encore été vérifié') && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-gray-500">
                      Si vous n&apos;avez pas reçu l&apos;email de vérification, vous pouvez :
                    </p>
                    <SendgridVerificationButton 
                      email={formRef.current?.email.value || ''} 
                    />
                    <p className="text-xs text-gray-500">
                      ou{' '}
                      <Link href="/auth/register" className="text-blue-600 hover:text-blue-500">
                        vous réinscrire
                      </Link>
                      {' '}pour créer un nouveau compte.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            <Button type="submit" isLoading={isLoading} className="w-full">
              Se connecter
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/auth/register"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Pas encore de compte ?{" "}
              <span className="underline">S&apos;inscrire</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function LoginPage() {
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
        <LoginForm />
      </Suspense>
    </>
  )
}