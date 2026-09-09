import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { canSignIn, isAdminEmail } from "@/lib/admin-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/admin/login", error: "/admin/login" },
  callbacks: {
    signIn({ account, profile }) {
      return account?.provider === "google" && canSignIn(profile);
    },
    jwt({ token, account, profile }) {
      if (account) token.adminVerified = account.provider === "google" && canSignIn(profile);
      return token;
    },
    session({ session, token }) {
      if (token.adminVerified !== true || !isAdminEmail(token.email)) {
        session.user.email = "";
      }
      return session;
    },
  },
});

export function isAuthConfigured(): boolean {
  return Boolean(process.env.AUTH_SECRET && process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET && process.env.ADMIN_EMAILS);
}

export async function requireAdmin() {
  if (!isAuthConfigured()) throw new Error("El acceso administrativo todavía no está configurado.");
  const session = await auth();
  if (!session?.user || !isAdminEmail(session.user.email)) {
    throw new Error("Tu sesión venció o no tenés acceso. Volvé a ingresar con Google.");
  }
  return session;
}
