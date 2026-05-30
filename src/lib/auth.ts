import { SignJWT, jwtVerify } from "jose";

function getSecretKey() {
  const jwtSecretEnv = process.env.JWT_SECRET;
  if (!jwtSecretEnv && process.env.NODE_ENV === "production") {
    console.error("[CRITICAL] JWT_SECRET environment variable is missing! Set it in Cloudflare Dashboard → Workers → Settings → Variables.");
  }
  return new TextEncoder().encode(
    jwtSecretEnv || "dev-only-fallback-insecure-key-never-use-in-prod"
  );
}

export async function signJwt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecretKey());
}

export async function verifyJwt(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload;
  } catch (error) {
    return null;
  }
}
