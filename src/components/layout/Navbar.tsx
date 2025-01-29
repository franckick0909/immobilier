"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { BurgerButton } from "./BurgerButton";
import { NavbarMobile } from "./NavbarMobile";

export function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo et navigation principale */}
            <div className="flex">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-blue-600">ImmoApp</span>
              </Link>

              {/* Navigation desktop */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                >
                  Accueil
                </Link>
                <Link
                  href="/properties"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                >
                  Propriétés
                </Link>
                {session?.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                  >
                    Administration
                  </Link>
                )}
              </div>
            </div>

            {/* Boutons de droite */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              {session ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 text-gray-900 hover:text-blue-600"
                  >
                    <FaUser size={20} />
                    <span>{session.user.name}</span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center space-x-2 text-gray-900 hover:text-blue-600"
                  >
                    <FaSignOutAlt size={20} />
                    <span>Déconnexion</span>
                  </button>
                </div>
              ) : (
                <div className="space-x-4">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>

            {/* Burger button pour mobile */}
            <div className="flex items-center sm:hidden">
              <BurgerButton
                isOpen={isOpen}
                onClick={() => setIsOpen(!isOpen)}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Menu mobile */}
      <NavbarMobile isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Espace pour compenser la navbar fixed */}
      <div className="h-16" />
    </>
  );
}
