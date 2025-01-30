'use client'

import { useState } from 'react'
import { resendVerificationEmail } from '@/app/actions/auth'

interface SendgridVerificationButtonProps {
  email: string
}

export function SendgridVerificationButton({ email }: SendgridVerificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleResend = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await resendVerificationEmail(email)
      
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Email de vérification renvoyé avec succès' })
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de vérification :', error)
      setMessage({ type: 'error', text: 'Une erreur est survenue' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="text-center space-y-2">
      <button
        onClick={handleResend}
        disabled={isLoading}
        className="text-sm text-blue-600 hover:text-blue-500 underline disabled:opacity-50"
      >
        {isLoading ? 'Envoi en cours...' : 'Renvoyer l\'email de vérification'}
      </button>

      {message && (
        <p className={`text-sm ${
          message.type === 'success' ? 'text-green-600' : 'text-red-600'
        }`}>
          {message.text}
        </p>
      )}
    </div>
  )
}