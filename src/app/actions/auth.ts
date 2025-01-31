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
    // Validation des données
    if (!name || !email || !password) {
      return { error: 'Tous les champs sont requis' }
    }

    if (password.length < 6) {
      return { error: 'Le mot de passe doit contenir au moins 6 caractères' }
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { error: 'Cet email est déjà utilisé' }
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Générer le token de vérification
    const verifyToken = crypto.randomBytes(32).toString('hex')
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures

    // Créer l'utilisateur
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verifyToken,
        verifyTokenExpiry,
        role: 'USER'
      }
    })

    // Envoyer l'email de vérification
    await sendVerificationEmail(email, verifyToken)

    console.log('Utilisateur créé avec succès:', email)
    return { success: true }
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
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