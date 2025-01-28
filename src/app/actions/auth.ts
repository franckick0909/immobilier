'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const RegisterSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export async function register(formData: FormData) {
  try {
    const validatedFields = RegisterSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    })

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedFields.email },
    })

    if (existingUser) {
      return {
        error: 'Cet email est déjà utilisé'
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(validatedFields.password, 12)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name: validatedFields.name,
        email: validatedFields.email,
        password: hashedPassword,
        role: 'USER', // Role par défaut
      },
    })

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message
      }
    }

    return {
      error: 'Une erreur est survenue lors de l\'inscription'
    }
  }
}