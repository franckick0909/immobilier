import sgMail from '@sendgrid/mail'
import { ResponseError, MailDataRequired } from '@sendgrid/mail'

// Initialiser SendGrid avec votre clé API
if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not defined')
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  try {
    console.log('Début de la procédure d\'envoi d\'email')
    console.log('Email destinataire:', email)
    console.log('Token de vérification:', token)

    // Déterminer l'URL de base
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXTAUTH_URL

    if (!baseUrl) {
      throw new Error('NEXTAUTH_URL ou VERCEL_URL doit être défini')
    }

    const verificationLink = `${baseUrl}/auth/verify?token=${token}`
    console.log('URL de base:', baseUrl)
    console.log('Lien de vérification complet:', verificationLink)

    // Vérifier l'email d'envoi
    const senderEmail = process.env.EMAIL_FROM
    if (!senderEmail) {
      throw new Error('EMAIL_FROM n\'est pas défini')
    }

    const msg: MailDataRequired = {
      to: email,
      from: senderEmail,
      subject: 'Vérifiez votre adresse email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a365d; text-align: center; padding: 20px;">
            Bienvenue sur Immobilier !
          </h2>
          
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px;">
            <p style="color: #4a5568; line-height: 1.6;">
              Merci de vous être inscrit. Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}"
                style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Vérifier mon email
              </a>
            </div>
            
            <p style="color: #4a5568; line-height: 1.6;">
              Si le bouton ne fonctionne pas, vous pouvez copier et coller le lien suivant dans votre navigateur :
            </p>
            
            <p style="background-color: #edf2f7; padding: 10px; border-radius: 4px; word-break: break-all;">
              ${verificationLink}
            </p>
            
            <p style="color: #718096; font-size: 0.875rem; margin-top: 30px;">
              Ce lien expirera dans 24 heures. Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #a0aec0; font-size: 0.75rem;">
            <p>© ${new Date().getFullYear()} Immobilier. Tous droits réservés.</p>
          </div>
        </div>
      `
    }

    console.log('Configuration de l\'email:', {
      to: msg.to,
      from: msg.from,
      subject: msg.subject
    })

    const [response] = await sgMail.send(msg)
    console.log('Email envoyé avec succès. Response:', {
      headers: response.headers,
      body: response.body
    })

    return { success: true }

  } catch (error: unknown) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    
    // Log détaillé des erreurs SendGrid
    if (error instanceof Error && 'response' in error) {
      const sendGridError = error as ResponseError
      if (sendGridError.response) {
        console.error('Détails de l\'erreur SendGrid:', {
          body: sendGridError.response.body,
          headers: sendGridError.response.headers
        })
      }
    }

    // Log des variables d'environnement (sans les valeurs sensibles)
    console.log('Variables d\'environnement:', {
      hasApiKey: !!process.env.SENDGRID_API_KEY,
      hasEmailFrom: !!process.env.EMAIL_FROM,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      vercelUrl: process.env.VERCEL_URL
    })
    
    return { 
      error: error instanceof Error 
        ? `Erreur d'envoi d'email: ${error.message}` 
        : 'Une erreur inconnue est survenue lors de l\'envoi de l\'email'
    }
  }
}