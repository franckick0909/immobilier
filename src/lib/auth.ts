import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

// Définition des types personnalisés
interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  password: string;
  emailVerified?: Date | null;
  image?: string | null;
}

declare module "next-auth" {
  interface User {
    role: 'USER' | 'ADMIN';
    emailVerified?: Date | null;
    image?: string | null;
  }
  
  interface Session {
    user: {
      id: string;
      role: 'USER' | 'ADMIN';
      email: string;
      name?: string | null;
      image?: string | null;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: 'USER' | 'ADMIN';
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      },
      profile(profile) {
        console.log('Profile Google reçu:', profile) // Log pour déboguer
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: new Date(),
          role: 'USER' as const
        }
      }
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Informations de connexion manquantes")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        }) as User | null

        if (!user || !user?.password) {
          throw new Error("Utilisateur non trouvé")
        }

        if (!user.emailVerified) {
          throw new Error("Veuillez vérifier votre email avant de vous connecter")
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!passwordMatch) {
          throw new Error("Mot de passe incorrect")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role as 'USER' | 'ADMIN'
        }
      }
    },
    async signIn({ account, profile, user }) {
      console.log('SignIn callback:', { account, profile, user }) // Log pour déboguer
      if (account?.provider === "google") {
        if (!profile?.email) {
          console.error('Pas d\'email dans le profil Google')
          return false
        }
        
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.email }
          })

          console.log('Utilisateur existant:', existingUser) // Log pour déboguer

          if (existingUser) {
            return true
          }

          const newUser = await prisma.user.create({
            data: {
              email: profile.email,
              name: profile.name,
              emailVerified: new Date(),
              role: 'USER',
              image: profile.image ?? null,
              password: '', // Champ requis mais vide pour les utilisateurs Google
              accounts: {
                create: {
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                }
              }
            }
          })
          console.log('Nouvel utilisateur créé:', newUser) // Log pour déboguer
          return true
        } catch (error) {
          console.error('Erreur lors de la création de l\'utilisateur Google:', error)
          return false
        }
      }
      return true
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
}