'use client'

import { useState } from 'react'
import { resendVerificationEmail } from '@/app/actions/auth'
import { motion } from 'framer-motion'

interface SendgridVerificationButtonProps {
  email: string
}

export function SendgridVerificationButton({ email }: SendgridVerificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isDisabled, setIsDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const startCountdown = () => {
    setIsDisabled(true)
    setCountdown(60) // 60 secondes
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsDisabled(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleResend = async () => {
    if (isDisabled) return

    setIsLoading(true)
    setMessage(null)

    try {
      console.log('Tentative de renvoi pour:', email)
      const result = await resendVerificationEmail(email)
      
      if (result.error) {
        console.error('Erreur lors du renvoi:', result.error)
        setMessage({ type: 'error', text: result.error })
      } else {
        console.log('Email renvoyé avec succès')
        setMessage({ 
          type: 'success', 
          text: 'Un nouvel email de vérification a été envoyé' 
        })
        startCountdown()
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de vérification :', error)
      setMessage({ 
        type: 'error', 
        text: 'Une erreur est survenue lors de l\'envoi' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="text-center space-y-2">
      <button
        onClick={handleResend}
        disabled={isLoading || isDisabled}
        className={`text-sm ${
          isDisabled 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-blue-600 hover:text-blue-500'
        } underline disabled:opacity-50 transition-colors duration-200`}
      >
        {isLoading 
          ? 'Envoi en cours...' 
          : isDisabled 
            ? `Réessayer dans ${countdown}s` 
            : 'Renvoyer l\'email de vérification'
        }
      </button>

      {message && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-sm ${
            message.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message.text}
        </motion.p>
      )}
    </div>
  )
}