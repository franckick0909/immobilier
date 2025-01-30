import sgMail from '@sendgrid/mail'
import { ResponseError } from '@sendgrid/mail'

// Initialiser SendGrid avec votre clé API
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendVerificationEmail(email: string, token: string) {
  try {
    console.log('Tentative d\'envoi d\'email à:', email)
    console.log('Token de vérification:', token)

    const verificationLink = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`
    console.log('Lien de vérification:', verificationLink)

    const msg = {
      to: email,
      from: 'franckchapelon09@gmail.com', // Votre email vérifié sur SendGrid
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

    const result = await sgMail.send(msg)
    console.log('Email envoyé avec succès:', result)
    return { success: true }

  } catch (error: unknown) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    
    // Vérifier si l'erreur est une erreur SendGrid
    if (error instanceof Error && 'response' in error) {
      const sendGridError = error as ResponseError
      if (sendGridError.response) {
        console.error('Détails de l\'erreur SendGrid:', sendGridError.response.body)
      }
    }
    
    return { 
      error: error instanceof Error 
        ? `Erreur: ${error.message}` 
        : 'Une erreur est survenue lors de l\'envoi de l\'email'
    }
  }
}