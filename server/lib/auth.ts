import jwt from "jsonwebtoken";
import argon2 from "argon2";
import type { FastifyRequest, FastifyReply } from "fastify";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface JWTPayload {
  userId: string;
  organizationId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(reply: FastifyReply, token: string): void {
  reply.setCookie("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
  });
}

export function clearAuthCookie(reply: FastifyReply): void {
  reply.clearCookie("session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
}

export async function authenticateUser(request: FastifyRequest): Promise<JWTPayload | null> {
  const token = request.cookies.session;
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<JWTPayload> {
  const user = await authenticateUser(request);
  if (!user) {
    reply.status(401).send({ message: "Neautorizovaný přístup" });
    throw new Error("Unauthorized");
  }
  return user;
}
