"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { setAdminSession } from "@/lib/auth";

export async function loginAdmin(_previousState: string | null, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!passwordHash) {
    return "Configuration manquante : ADMIN_PASSWORD_HASH.";
  }

  const passwordIsValid = await bcrypt.compare(password, passwordHash);

  if (!passwordIsValid) {
    return "Mot de passe incorrect.";
  }

  await setAdminSession();
  redirect("/admin");
}
