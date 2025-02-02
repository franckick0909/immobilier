import { AuthOptions } from 'next-auth'
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"

type Credentials = {
  email: string;
  password: string;
} | undefined

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      // @ts-expect-error - Cette erreur est connue et peut être ignorée
      async authorize(credentials: Credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email et mot de passe requis')
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              emailVerified: true
            }
          })

          if (!user || !user.password) {
            throw new Error('Email ou mot de passe incorrect')
          }

          if (!user.emailVerified) {
            throw new Error('Veuillez vérifier votre email avant de vous connecter')
          }

          const isPasswordValid = await compare(credentials.password, user.password)

          if (!isPasswordValid) {
            throw new Error('Email ou mot de passe incorrect')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Erreur d\'authentification:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google") {
          if (user.email) {
            const existingUser = await prisma.user.findUnique({
              where: { email: user.email },
              select: { id: true }
            })

            if (!existingUser) {
              await prisma.user.create({
                data: {
                  email: user.email,
                  name: user.name || 'Utilisateur Google',
                  emailVerified: new Date(),
                  role: 'USER',
                }
              })
            }
          }
        }
        return true
      } catch (error) {
        console.error('Erreur lors de la connexion:', error)
        return false
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}