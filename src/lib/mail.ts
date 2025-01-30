import sgMail from '@sendgrid/mail'

// Configuration du type d'erreur SendGrid
interface SendGridError {
  response?: {
    body?: {
      errors?: Array<{ message: string }>
    }
  }
}

// Vérification que la clé API existe
if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not defined')
}

// Configuration de SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const confirmLink = `${baseUrl}/auth/verify?token=${token}`

  console.log('Configuration email:', {
    to: email,
    from: 'franckchapelon09@gmail.com',
    baseUrl,
    confirmLink
  })

  const msg = {
    to: email,
    from: 'franckchapelon09@gmail.com',
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
    console.error('Type d\'erreur:', typeof error)
    console.error('Propriétés de l\'erreur:', Object.keys(error as object))
    
    const sendGridError = error as SendGridError
    
    if (sendGridError.response?.body) {
      console.error('Corps de l\'erreur SendGrid:', sendGridError.response.body)
    }

    return { 
      error: error instanceof Error ? 
        `Erreur SendGrid: ${error.message}` : 
        'Erreur lors de l\'envoi de l\'email'
    }
  }
}