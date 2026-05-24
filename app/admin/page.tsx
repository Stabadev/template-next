import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen px-5 py-10">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-teal-800">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950">Bienvenue dans Juliedash</h1>
        </div>

        <form action="/admin/logout" method="post">
          <button
            type="submit"
            className="h-11 rounded-md border border-stone-300 bg-white px-5 text-sm font-medium text-stone-900 transition hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2"
          >
            Déconnexion
          </button>
        </form>
      </section>
    </main>
  );
}
