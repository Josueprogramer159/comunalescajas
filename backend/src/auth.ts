import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from './db';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your-access-token-secret-key-change-in-production';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = '40m'; // 40 minutos
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 días

export interface TokenPayload {
  id: number;
  email: string;
  name: string;
}

/**
 * Genera un par de access token y refresh token
 */
export async function generateTokens(user: TokenPayload): Promise<{
  accessToken: string;
  refreshToken: string;
  refreshTokenId: number;
}> {
  // Generar access token (corta duración)
  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      type: 'access'
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  // Generar refresh token (larga duración)
  const refreshToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      type: 'refresh'
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  // Hashear el refresh token para almacenarlo en BD
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

  // Guardar el refresh token hasheado en BD
  const result = await pool.query(
    `INSERT INTO refresh_tokens (admin_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [user.id, tokenHash, expiresAt]
  );

  return {
    accessToken,
    refreshToken,
    refreshTokenId: result.rows[0].id
  };
}

/**
 * Valida un access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;
    
    if (decoded.type !== 'access') {
      return null;
    }

    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name
    };
  } catch (error) {
    return null;
  }
}

/**
 * Valida un refresh token
 */
export function verifyRefreshToken(token: string): { id: number; email: string } | null {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as any;
    
    if (decoded.type !== 'refresh') {
      return null;
    }

    return {
      id: decoded.id,
      email: decoded.email
    };
  } catch (error) {
    return null;
  }
}

/**
 * Valida que el refresh token exista en BD y no esté revocado
 */
export async function validateRefreshTokenInDB(
  token: string,
  adminId: number
): Promise<boolean> {
  try {
    const tokenHash = hashToken(token);

    const result = await pool.query(
      `SELECT id FROM refresh_tokens
       WHERE admin_id = $1
         AND token_hash = $2
         AND revoked_at IS NULL
         AND expires_at > CURRENT_TIMESTAMP`,
      [adminId, tokenHash]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error('Error validating refresh token in DB:', error);
    return false;
  }
}

/**
 * Revoca (invalida) un refresh token
 */
export async function revokeRefreshToken(
  token: string,
  adminId: number
): Promise<boolean> {
  try {
    const tokenHash = hashToken(token);

    const result = await pool.query(
      `UPDATE refresh_tokens
       SET revoked_at = CURRENT_TIMESTAMP
       WHERE admin_id = $1 AND token_hash = $2`,
      [adminId, tokenHash]
    );

    return result.rowCount! > 0;
  } catch (error) {
    console.error('Error revoking refresh token:', error);
    return false;
  }
}

/**
 * Revoca todos los refresh tokens de un usuario (logout desde todos los dispositivos)
 */
export async function revokeAllRefreshTokens(adminId: number): Promise<boolean> {
  try {
    await pool.query(
      `UPDATE refresh_tokens
       SET revoked_at = CURRENT_TIMESTAMP
       WHERE admin_id = $1 AND revoked_at IS NULL`,
      [adminId]
    );

    return true;
  } catch (error) {
    console.error('Error revoking all refresh tokens:', error);
    return false;
  }
}

/**
 * Hashea un token para almacenarlo de forma segura en BD
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Limpia tokens expirados de la BD
 */
export async function cleanupExpiredTokens(): Promise<void> {
  try {
    await pool.query(
      `DELETE FROM refresh_tokens
       WHERE expires_at < CURRENT_TIMESTAMP
          OR (revoked_at IS NOT NULL AND revoked_at < CURRENT_TIMESTAMP - INTERVAL '30 days')`
    );
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
}
