import { redirect } from "next/navigation";
import { auth, isAuthConfigured, signIn } from "@/auth";
import { isAdminEmail } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const configured = isAuthConfigured();
  const session = configured ? await auth() : null;
  if (isAdminEmail(session?.user?.email)) redirect("/admin");
  const { error } = await searchParams;
  return (
    <section className="mx-auto my-auto flex w-full max-w-sm flex-col gap-5 rounded-2xl border bg-card p-6 sm:p-8">
      <p className="text-sm font-medium text-muted-foreground">Olmos Bebidas</p>
      <h1 className="text-2xl font-semibold tracking-tight">Imágenes de productos</h1>
      <p className="text-sm text-muted-foreground">Ingresá con tu cuenta autorizada para subir o reemplazar las fotos del catálogo.</p>
      {error ? <p role="alert" className="text-sm text-destructive">No pudimos iniciar sesión. Usá una cuenta de Google autorizada e intentá de nuevo.</p> : null}
      {configured ? (
        <form action={async () => { "use server"; await signIn("google", { redirectTo: "/admin" }); }}>
          <Button type="submit" size="lg" className="w-full">Ingresar con Google</Button>
        </form>
      ) : <p role="status" className="text-sm text-muted-foreground">El acceso está pendiente de configuración. Contactá al administrador del sitio.</p>}
    </section>
  );
}
