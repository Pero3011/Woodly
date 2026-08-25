import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

interface UserSession {
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  role: string;
}

//Defining the JWT_SECRET_KEY
const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

//Generate new token when Signing In/Up
export async function createToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15min")
    .sign(secret);
}

//Verifying the Generated Token
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
