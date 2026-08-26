import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

interface UserSession {
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  role: string;
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

export async function createToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15min")
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  const storedCookie = await cookies();
  const token = storedCookie.get("token")?.value;

  if (!token) return null;
  const payload = await verifyToken(token);
  return payload as UserSession | null;
}

// Re-signs the JWT with updated fields merged into the current session,
// and writes it back to the cookie so subsequent requests see fresh data.
export async function updateSessionUser(
  updates: Partial<UserSession>,
): Promise<UserSession | null> {
  const current = await getSession();
  if (!current) return null;

  const updatedSession: UserSession = {
    ...current,
    ...updates,
  };

  const newToken = await createToken(updatedSession);

  const storedCookie = await cookies();
  storedCookie.set("token", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });

  return updatedSession;
}
