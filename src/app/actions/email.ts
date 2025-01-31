'use server'

import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function resendVerificationEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return { error: "Utilisateur non trouvé" }
    }

    if (user.emailVerified) {
      return { error: "Email déjà vérifié" }
    }

    // Générer un nouveau token
    const verifyToken = crypto.randomBytes(32).toString('hex')
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures

    // Mettre à jour le token dans la base de données
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verifyToken,
        verifyTokenExpiry
      }
    })

    // Envoyer l'email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${verifyToken}`
    
    await sgMail.send({
      to: email,
      from: process.env.EMAIL_FROM!,
      subject: 'Vérifiez votre email',
      html: `
        <div>
          <h1>Vérification de votre email</h1>
          <p>Cliquez sur le lien ci-dessous pour vérifier votre email :</p>
          <a href="${verificationUrl}">Vérifier mon email</a>
        </div>
      `
    })

    return { success: true }
  } catch (error) {
    console.error('Erreur lors du renvoi de l\'email:', error)
    return { error: "Une erreur est survenue lors de l'envoi de l'email" }
  }
}