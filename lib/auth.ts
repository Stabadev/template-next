import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "juliedash_session";
const SESSION_VALUE = "admin";

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET is required");
  }

  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function createCookieValue(value: string) {
  return `${value}.${sign(value)}`;
}

function isValidCookieValue(cookieValue?: string) {
  if (!cookieValue) {
    return false;
  }

  const [value, signature] = cookieValue.split(".");

  if (value !== SESSION_VALUE || !signature) {
    return false;
  }

  const expected = sign(value);
  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(signatureBuffer, expectedBuffer);
}

export async function isAdminAuthenticated() {
  return isValidCookieValue((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function setAdminSession() {
  (await cookies()).set(SESSION_COOKIE, createCookieValue(SESSION_VALUE), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
