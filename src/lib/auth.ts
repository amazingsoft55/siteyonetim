import { SignJWT, jwtVerify } from "jose";

// Güvenlik için ortam değişkenlerinden alınmalı, şimdilik sabit
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-siteyonetim-key-2024"
);

export async function signJwt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SECRET_KEY);
}

export async function verifyJwt(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (error) {
    return null;
  }
}
