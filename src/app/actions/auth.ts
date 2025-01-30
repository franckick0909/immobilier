'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/mail'

const RegisterSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export async function register(formData: FormData) {
  try {
    console.log('Début de l\'inscription')
    const validatedFields = RegisterSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    })

    console.log('Données validées:', { 
      name: validatedFields.name, 
      email: validatedFields.email 
    })

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedFields.email },
    })

    if (existingUser) {
      // Si l'utilisateur existe mais n'a pas vérifié son email
      if (!existingUser.emailVerified) {
        console.log('Utilisateur existant non vérifié, envoi d\'un nouveau token')
        
        // Générer un nouveau token
        const verifyToken = crypto.randomBytes(32).toString('hex')
        const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

        // Mettre à jour l'utilisateur avec le nouveau token
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            verifyToken,
            verifyTokenExpiry,
          },
        })

        // Renvoyer l'email de vérification
        const emailResult = await sendVerificationEmail(existingUser.email, verifyToken)
        
        if (emailResult.error) {
          console.error('Erreur lors du renvoi de l\'email:', emailResult.error)
          return { error: emailResult.error }
        }

        return {
          success: true,
          message: 'Un nouvel email de vérification a été envoyé'
        }
      }

      return {
        error: 'Cet email est déjà utilisé'
      }
    }

    // Générer un token de vérification
    const verifyToken = crypto.randomBytes(32).toString('hex')
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(validatedFields.password, 12)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name: validatedFields.name,
        email: validatedFields.email,
        password: hashedPassword,
        verifyToken,
        verifyTokenExpiry,
        role: 'USER',
      },
    })

    console.log('Utilisateur créé:', { id: user.id, email: user.email })

    // Envoyer l'email de vérification
    const emailResult = await sendVerificationEmail(user.email, verifyToken)
    
    if (emailResult.error) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailResult.error)
      // Si l'envoi de l'email échoue, on supprime l'utilisateur
      await prisma.user.delete({
        where: { id: user.id }
      })
      return { error: emailResult.error }
    }

    return {
      success: true,
      message: 'Un email de vérification a été envoyé à votre adresse'
    }

  } catch (error) {
    console.error('Erreur complète:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message
      }
    }

    return {
      error: error instanceof Error ? `Erreur: ${error.message}` : 'Une erreur est survenue lors de l\'inscription'
    }
  }
}

export async function verifyEmail(token: string) {
  try {
    console.log('Tentative de vérification du token:', token)

    // Trouver l'utilisateur avec le token
    const user = await prisma.user.findFirst({
      where: {
        verifyToken: token,
        verifyTokenExpiry: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      console.log('Token invalide ou expiré')
      return {
        error: 'Token invalide ou expiré'
      }
    }

    console.log('Utilisateur trouvé:', { id: user.id, email: user.email })

    // Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verifyToken: null,
        verifyTokenExpiry: null
      }
    })

    console.log('Email vérifié avec succès')
    return { 
      success: true,
      message: 'Votre email a été vérifié avec succès'
    }
  } catch (error) {
    console.error('Erreur lors de la vérification:', error)
    return {
      error: error instanceof Error ? `Erreur: ${error.message}` : 'Une erreur est survenue lors de la vérification'
    }
  }
}

export async function login(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { error: 'Email ou mot de passe incorrect' }
    }

    if (!user.emailVerified) {
      return { error: 'Veuillez vérifier votre email avant de vous connecter' }
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return { error: 'Email ou mot de passe incorrect' }
    }

    return { success: true }
  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    return {
      error: 'Une erreur est survenue lors de la connexion'
    }
  }
}

export async function resendVerificationEmail(email: string) {
  try {
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return { error: 'Utilisateur non trouvé' }
    }

    if (user.emailVerified) {
      return { error: 'Cet email est déjà vérifié' }
    }

    // Générer un nouveau token
    const verifyToken = crypto.randomBytes(32).toString('hex')
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures

    // Mettre à jour l'utilisateur avec le nouveau token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verifyToken,
        verifyTokenExpiry,
      },
    })

    // Envoyer le nouvel email
    const emailResult = await sendVerificationEmail(user.email, verifyToken)
    
    if (emailResult.error) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailResult.error)
      return { error: 'Erreur lors de l\'envoi de l\'email' }
    }

    return { 
      success: true,
      message: 'Un nouvel email de vérification a été envoyé'
    }
  } catch (error) {
    console.error('Erreur lors du renvoi de l\'email:', error)
    return {
      error: 'Une erreur est survenue lors du renvoi de l\'email'
    }
  }
}