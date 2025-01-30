'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { verifyEmail } from '@/app/actions/auth'

function VerifyContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (token) {
      verifyEmail(token).then((result) => {
        if (result.success) {
          setStatus('success')
          setMessage('Votre email a été vérifié avec succès !')
        } else {
          setStatus('error')
          setMessage(result.error || 'Une erreur est survenue')
        }
      })
    } else {
      setStatus('error')
      setMessage('Token manquant')
    }
  }, [token])

  return (
    <div className="max-w-md w-full space-y-8">
      <div className="bg-white p-8 rounded-xl shadow-md">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Vérification en cours...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center text-green-600">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="mt-4">{message}</p>
            <a
              href="/auth/login"
              className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Se connecter
            </a>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center text-red-600">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <p className="mt-4">{message}</p>
            <a
              href="/auth/register"
              className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retour à l&apos;inscription
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
    >
      <Suspense 
        fallback={
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </motion.div>
  )
}