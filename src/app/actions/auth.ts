'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { sendVerificationEmail } from "@/lib/mail"

// Types
interface RegisterData {
  name: string
  email: string
  password: string
}

interface LoginData {
  email: string
  password: string
}

// Fonction d'inscription
export async function register(data: RegisterData) {
  const { name, email, password } = data

  try {
    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('Email déjà utilisé')
      return { error: 'Cet email est déjà utilisé' }
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Générer un token de vérification
    const verifyToken = crypto.randomBytes(32).toString('hex')
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
      }
    })

    // Envoyer l'email de vérification
    await sendVerificationEmail(email, verifyToken)

    console.log('Utilisateur créé avec succès:', user)
    return { success: true }

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    return { error: 'Une erreur est survenue lors de l\'inscription' }
  }
}

// Fonction de connexion
export async function login(credentials: LoginData) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: credentials.email
      }
    })

    if (!user) {
      console.log('Utilisateur non trouvé')
      return { error: 'Email ou mot de passe incorrect' }
    }

    // Vérifier si l'utilisateur s'est inscrit avec Google
    if (!user.password) {
      console.log('Utilisateur inscrit avec Google')
      return { error: 'Veuillez vous connecter avec Google' }
    }

    // Vérifier si l'email est vérifié
    if (!user.emailVerified) {
      console.log('Email non vérifié')
      return { error: 'Veuillez vérifier votre email avant de vous connecter' }
    }

    const passwordMatch = await bcrypt.compare(credentials.password, user.password)

    if (!passwordMatch) {
      console.log('Mot de passe incorrect')
      return { error: 'Email ou mot de passe incorrect' }
    }

    console.log('Connexion réussie')
    return { success: true }

  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    return { error: 'Une erreur est survenue lors de la connexion' }
  }
}

// Fonction de vérification d'email
export async function verifyEmail(token: string) {
  try {
    console.log('Début de la vérification avec token:', token)

    if (!token) {
      console.log('Token manquant')
      return { error: 'Token manquant' }
    }

    // Vérifier si le token existe et n'est pas expiré
    const user = await prisma.user.findFirst({
      where: {
        verifyToken: token,
        verifyTokenExpiry: {
          gt: new Date()
        }
      }
    })

    console.log('Résultat de la recherche utilisateur:', {
      found: !!user,
      email: user?.email,
      tokenExpiry: user?.verifyTokenExpiry
    })

    if (!user) {
      return {
        error: 'Token invalide ou expiré'
      }
    }

    try {
      // Mettre à jour l'utilisateur
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          verifyToken: null,
          verifyTokenExpiry: null
        }
      })

      console.log('Utilisateur mis à jour avec succès:', {
        id: updatedUser.id,
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified
      })

      return { 
        success: true,
        message: 'Votre email a été vérifié avec succès'
      }
    } catch (updateError) {
      console.error('Erreur lors de la mise à jour:', updateError)
      return {
        error: 'Erreur lors de la mise à jour de la vérification'
      }
    }
  } catch (error) {
    console.error('Erreur complète lors de la vérification:', error)
    return {
      error: 'Une erreur est survenue lors de la vérification'
    }
  }
}