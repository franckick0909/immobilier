'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { sendVerificationEmail } from "@/lib/mail"

interface RegisterData {
  name: string
  email: string
  password: string
}

interface LoginData {
  email: string
  password: string
}

export async function register(data: RegisterData) {
  const { name, email, password } = data

  try {
    console.log('Starting registration process')
    // Validation des données
    if (!name || !email || !password) {
      return { error: 'Tous les champs sont requis' }
    }

    if (password.length < 8) {
      return { error: 'Le mot de passe doit contenir au moins 8 caractères' }
    }

    // Vérification du format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { error: 'Format d\'email invalide' }
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true } // Sélectionner uniquement l'ID pour optimiser
    })

    if (existingUser) {
      return { error: 'Cet email est déjà utilisé' }
    }

    // Hasher le mot de passe en parallèle avec la génération du token
    const [hashedPassword, verifyToken] = await Promise.all([
      bcrypt.hash(password, 12),
      crypto.randomBytes(32).toString('hex')
    ])

    // Générer le token de vérification
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verifyToken,
        verifyTokenExpiry,
        role: 'USER'
      },
      select: { id: true, email: true } // Sélectionner uniquement les champs nécessaires
    })

    // Envoyer l'email de vérification de manière asynchrone
    sendVerificationEmail(email, verifyToken).catch(error => {
      console.error('Error sending verification email:', error)
      // Ne pas bloquer l'inscription si l'email échoue
    })

    console.log('User registered successfully:', user.id)
    return { success: true }
  } catch (error) {
    console.error('Registration error:', error)
    return { error: 'Une erreur est survenue lors de l\'inscription' }
  }
}

export async function login(data: LoginData) {
  try {
    const { email, password } = data

    if (!email || !password) {
      return { error: "Email et mot de passe requis" }
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return { error: "Email ou mot de passe incorrect" }
    }

    if (!user.password) {
      return { error: "Veuillez vous connecter avec Google" }
    }

    if (!user.emailVerified) {
      return { error: "Veuillez vérifier votre email avant de vous connecter" }
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return { error: "Email ou mot de passe incorrect" }
    }

    return { success: true }
  } catch (error) {
    console.error('Erreur de connexion:', error)
    return { error: "Une erreur est survenue" }
  }
}

export async function verifyEmail(token: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        verifyToken: token,
        verifyTokenExpiry: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return { error: "Le lien de vérification est invalide ou a expiré" }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verifyToken: null,
        verifyTokenExpiry: null
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error)
    return { error: "Une erreur est survenue lors de la vérification de l'email" }
  }
}