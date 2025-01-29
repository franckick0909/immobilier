import sgMail from '@sendgrid/mail'

interface SendGridError {
  response?: {
    body?: {
      errors?: Array<{ message: string }>
    }
  }
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`

  const msg = {
    to: email,
    from: 'franckchapelon09@gmail.com', // Email vérifié sur SendGrid
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
          Si vous n'avez pas créé de compte sur ImmoApp, vous pouvez ignorer cet email.
        </p>
      </div>
    `
  }

  try {
    console.log('Tentative d\'envoi d\'email à:', email)
    const result = await sgMail.send(msg)
    console.log('Email envoyé avec succès:', result)
    return { success: true }
  } catch (error) {
    console.error('Erreur détaillée SendGrid:', error)
    
    // Type l'erreur comme SendGridError
    const sendGridError = error as SendGridError
    
    if (sendGridError.response?.body) {
      console.error('Corps de l\'erreur SendGrid:', sendGridError.response.body)
    }

    // Si c'est une erreur standard
    if (error instanceof Error) {
      return { error: error.message }
    }

    return { error: 'Erreur lors de l\'envoi de l\'email' }
  }
}