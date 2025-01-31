'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface VerificationModalContentProps {
  email: string
  onClose: () => void
}

export function VerificationModalContent({ email, onClose }: VerificationModalContentProps) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h3 className="text-xl font-semibold text-gray-900">
        Vérifiez votre email
      </h3>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          Un email de vérification a été envoyé à <span className="font-medium">{email}</span>
        </p>
        
        <p className="text-gray-600">
          Veuillez cliquer sur le lien dans l&apos;email pour activer votre compte. 
          Le lien expirera dans 24 heures.
        </p>


        <p className="text-sm text-gray-500">
          Si vous ne trouvez pas l&apos;email, vérifiez votre dossier spam.
        </p>
      </div>


      <div className="mt-6 flex gap-4">
        <button
          onClick={() => {
            onClose()
            router.push('/')
          }}
          className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Retour au site
        </button>
        
        <button
          onClick={() => {
            onClose()
            router.push('/auth/login')
          }}
          className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          Aller à la connexion
        </button>
      </div>
    </motion.div>
  )
}