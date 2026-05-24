"use client";

import { useActionState } from "react";
import { loginAdmin } from "./actions";

export default function AdminLoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(loginAdmin, null);

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <section className="w-full max-w-sm">
        <h1 className="text-3xl font-semibold text-stone-950">Administration</h1>
        <form action={formAction} className="mt-8 space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-800">
              Mot de passe admin
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-2 h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-stone-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {errorMessage ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="h-11 rounded-md bg-teal-700 px-5 text-sm font-medium text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </section>
    </main>
  );
}
