import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <section className="w-full max-w-md">
        <h1 className="text-4xl font-semibold tracking-normal text-stone-950">Template Next</h1>
        <p className="mt-4 text-lg leading-8 text-stone-700">
          Socle Next.js reutilisable avec espace d'administration
        </p>
        <Link
          href="/admin/login"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-teal-700 px-5 text-sm font-medium text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2"
        >
          Accéder à l’administration
        </Link>
      </section>
    </main>
  );
}
