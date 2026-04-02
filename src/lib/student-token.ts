import { createHmac } from "crypto";

const SECRET = process.env.STUDENT_TOKEN_SECRET;
if (!SECRET) {
  throw new Error("STUDENT_TOKEN_SECRET env var is required — ne pas utiliser sans cette variable en production");
}
const _SECRET: string = SECRET;

export function signStudentToken(studentId: string, sessionId: string): string {
  const payload = { studentId, sessionId, exp: Date.now() + 24 * 60 * 60 * 1000 };
  const data = JSON.stringify(payload);
  const sig = createHmac("sha256", _SECRET).update(data).digest("hex");
  return Buffer.from(data).toString("base64url") + "." + sig;
}

export function verifyStudentToken(token: string): { studentId: string; sessionId: string } | null {
  try {
    const [dataB64, sig] = token.split(".");
    if (!dataB64 || !sig) return null;
    const data = Buffer.from(dataB64, "base64url").toString();
    const expectedSig = createHmac("sha256", _SECRET).update(data).digest("hex");
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(data);
    if (payload.exp < Date.now()) return null;
    return { studentId: payload.studentId, sessionId: payload.sessionId };
  } catch {
    return null;
  }
}
