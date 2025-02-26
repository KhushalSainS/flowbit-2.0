import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';

/**
 * Signs a JWT token with the provided payload
 */
export const signJwt = (payload: any, options?: jwt.SignOptions): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1d',
    ...options,
  });
};

/**
 * Verifies a JWT token and returns the decoded payload
 */
export const verifyJwt = <T>(token: string): T | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch (error) {
    return null;
  }
};

/**
 * Decodes a JWT token without verification
 */
export const decodeJwt = <T>(token: string): T | null => {
  try {
    return jwt.decode(token) as T;
  } catch (error) {
    return null;
  }
};
