'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FaUser, FaSignOutAlt, FaHome, FaBuilding, FaCog } from 'react-icons/fa'

interface NavbarMobileProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function NavbarMobile({ isOpen, setIsOpen }: NavbarMobileProps) {
  const { data: session } = useSession()

  return (
    <>
      {/* Overlay sombre */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu mobile */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed top-0 right-0 h-full w-[75%] max-w-sm bg-white shadow-xl z-50"
      >
        <div className="p-5 space-y-8 mt-16">
          {/* En-tête du menu */}
          {session ? (
            <div className="flex items-center space-x-3 pb-4 border-b">
              <FaUser size={24} className="text-blue-600" />
              <div>
                <p className="font-medium">{session.user.name}</p>
                <p className="text-sm text-gray-500">{session.user.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-3 pb-4 border-b border-gray-300">
              <Link
                href="/auth/login"
                className="w-full py-2 text-center rounded-md bg-blue-600 text-white"
                onClick={() => setIsOpen(false)}
              >
                Connexion
              </Link>
              <Link
                href="/auth/register"
                className="w-full py-2 text-center rounded-md border border-blue-600 text-blue-600"
                onClick={() => setIsOpen(false)}
              >
                Inscription
              </Link>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-4">
            <Link
              href="/"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600"
              onClick={() => setIsOpen(false)}
            >
              <FaHome size={20} />
              <span>Accueil</span>
            </Link>
            <Link
              href="/properties"
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600"
              onClick={() => setIsOpen(false)}
            >
              <FaBuilding size={20} />
              <span>Propriétés</span>
            </Link>
            {session?.user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600"
                onClick={() => setIsOpen(false)}
              >
                <FaCog size={20} />
                <span>Administration</span>
              </Link>
            )}
          </nav>

          {/* Déconnexion */}
          {session && (
            <div className="pt-4 border-t">
              <button
                onClick={() => {
                  signOut()
                  setIsOpen(false)
                }}
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600"
              >
                <FaSignOutAlt size={20} />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}