'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function createImmobilier(data: {
  title: string
  description: string
  price: number
  address: string
  city: string
  zipCode: string
  surface: number
  rooms: number
  bedrooms: number
  bathrooms: number
  type: string
  status: string
  images: string[]
}) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { error: 'Vous devez être connecté' }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return { error: 'Utilisateur non trouvé' }
    }

    const immobilier = await prisma.immobilier.create({
      data: {
        ...data,
        userId: user.id
      }
    })

    return { success: true, data: immobilier }
  } catch (error) {
    console.error('Erreur lors de la création:', error)
    return { error: 'Une erreur est survenue lors de la création' }
  }
}

export async function getImmobiliers() {
  try {
    const immobiliers = await prisma.immobilier.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return { success: true, data: immobiliers }
  } catch (error) {
    console.error('Erreur lors de la récupération:', error)
    return { error: 'Une erreur est survenue lors de la récupération' }
  }
}