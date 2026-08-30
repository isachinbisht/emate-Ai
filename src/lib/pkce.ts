import crypto from 'crypto';

export function generateCodeVerifier(): string {
  // Generate a random string using URL-safe characters
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let verifier = '';
  const randomBytes = crypto.randomBytes(64);
  for (let i = 0; i < 64; i++) {
    verifier += chars[randomBytes[i] % chars.length];
  }
  return verifier;
}

export function generateCodeChallenge(verifier: string): string {
  // SHA-256 hash of the code_verifier, base64url encoded
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return hash.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
