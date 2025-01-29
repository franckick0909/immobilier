import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`

  try {
    await resend.emails.send({
      from: 'ImmoApp <verification@votredomaine.com>',
      to: email,
      subject: 'Vérifiez votre adresse email',
      html: `
        <h1>Vérification de votre email</h1>
        <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p>
        <a href="${confirmLink}">Vérifier mon email</a>
        <p>Ce lien expirera dans 24 heures.</p>
        <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
      `
    })
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error)
    throw new Error("Erreur lors de l'envoi de l'email de vérification")
  }
}