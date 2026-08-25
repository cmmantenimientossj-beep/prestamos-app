import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "super-secret-key-1234",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.usuario.findUnique({
          where: { email: credentials.email }
        });

        if (!user || user.estado !== 'ACTIVO') {
          return null; // Usuario no existe o está suspendido
        }

        // Nota: Para Producción se DEBE usar bcrypt de la siguiente forma:
        // const isMatch = await bcrypt.compare(credentials.password, user.password_hash);
        // if (!isMatch) return null;
        if (credentials.password !== user.password_hash) {
           return null;
        }

        return {
          id: user.id,
          name: user.nombre,
          email: user.email,
          role: user.rol,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login"
  }
};
