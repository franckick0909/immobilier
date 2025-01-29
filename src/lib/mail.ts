import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`

  try {
    await resend.emails.send({
      from: 'ImmoApp <onboarding@resend.dev>', // Domaine de test Resend
      to: email,
      subject: 'Vérifiez votre adresse email - ImmoApp',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb; text-align: center;">Vérification de votre email</h1>
          
          <p style="font-size: 16px; line-height: 1.5; color: #4b5563;">
            Merci de vous être inscrit sur ImmoApp ! Pour finaliser votre inscription, 
            veuillez cliquer sur le bouton ci-dessous :
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmLink}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; font-weight: bold;">
              Vérifier mon email
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            Ce lien expirera dans 24 heures. Si vous n'avez pas créé de compte sur ImmoApp, 
            vous pouvez ignorer cet email.
          </p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; 
                      text-align: center; font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()} ImmoApp. Tous droits réservés.
          </div>
        </div>
      `
    })

    return { success: true }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    return { error: 'Erreur lors de l\'envoi de l\'email de vérification' }
  }
}