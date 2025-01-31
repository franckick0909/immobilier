'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { verifyEmail } from '@/app/actions/auth'
import { motion } from 'framer-motion'

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function verify() {
      const token = searchParams.get('token')

      if (!token) {
        setStatus('error')
        setMessage('Token de vérification manquant')
        return
      }

      try {
        const result = await verifyEmail(token)

        if (result.error) {
          setStatus('error')
          setMessage(result.error)
        } else {
          setStatus('success')
          setMessage('Email vérifié avec succès')
          // Rediriger vers la page de connexion après 3 secondes
          setTimeout(() => {
            router.push('/auth/login')
          }, 3000)
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'email:', error)
        setStatus('error')
        setMessage('Une erreur est survenue')
      }
    }

    verify()
  }, [searchParams, router])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
    >
      <div className="w-full max-w-md">
        <div className="bg-white px-6 py-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">
            Vérification de l&apos;email
          </h2>

          {status === 'loading' && (
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-600"
            >
              <p>{message}</p>
              <p className="text-sm mt-2">
                Redirection vers la page de connexion...
              </p>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-600"
            >
              <p>{message}</p>
              <button
                onClick={() => router.push('/auth/login')}
                className="mt-4 text-blue-600 hover:text-blue-500 underline"
              >
                Retour à la connexion
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  )
}