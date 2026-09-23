import { betterAuth } from "better-auth";
import { signJWT, verifyJWT } from "better-auth/crypto";
import { NextRequest, NextResponse } from "next/server";

export interface UserSessionPayload {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  position: string;
  department: string;
  phoneNumber: string;
  role: string;
  image_url: string | null;
  email: string;
  [key: string]: unknown;
}

export const BETTER_AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET ||
  process.env.AUTH_SECRET ||
  "yuenyan_better_auth_secret_key_2026_super_secure_random_string_998877";

export const BETTER_AUTH_URL =
  process.env.BETTER_AUTH_URL || "http://localhost:3000";

export const SESSION_COOKIE_NAME = "better-auth.session_token";

// Initialize Better-Auth Core Instance
export const auth = betterAuth({
  secret: BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL,
});

/**
 * Sign JWT session using Better-Auth crypto utility
 */
export async function signSessionJWT(
  payload: UserSessionPayload,
  expiresInSeconds: number = 60 * 60 * 24 * 7 // 7 days default
): Promise<string> {
  const token = await signJWT(
    payload,
    BETTER_AUTH_SECRET,
    expiresInSeconds
  );
  return token;
}

/**
 * Verify JWT session using Better-Auth crypto utility
 */
export async function verifySessionJWT(
  token: string
): Promise<UserSessionPayload | null> {
  try {
    const payload = await verifyJWT(token, BETTER_AUTH_SECRET);
    if (!payload || typeof payload !== "object") {
      return null;
    }
    return payload as unknown as UserSessionPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Attach Better-Auth session cookie to NextResponse
 */
export function setSessionCookie(
  res: NextResponse,
  token: string,
  maxAgeSeconds: number = 60 * 60 * 24 * 7
) {
  const isProduction = process.env.NODE_ENV === "production";

  // Set standard Better-Auth cookie
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });

  // Also set fallback session_token cookie
  res.cookies.set({
    name: "session_token",
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

/**
 * Clear Better-Auth session cookies from NextResponse
 */
export function clearSessionCookie(res: NextResponse) {
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  res.cookies.set({
    name: "session_token",
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
}

/**
 * Extract and verify UserSession from NextRequest cookies
 */
export async function getSessionUserFromRequest(
  req: NextRequest
): Promise<UserSessionPayload | null> {
  const token =
    req.cookies.get(SESSION_COOKIE_NAME)?.value ||
    req.cookies.get("session_token")?.value;

  if (!token) {
    return null;
  }

  return await verifySessionJWT(token);
}
