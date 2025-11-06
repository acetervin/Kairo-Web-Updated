const { pool } = require('../db');

export enum AuditEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGIN_LOCKOUT = 'LOGIN_LOCKOUT',
  LOGOUT = 'LOGOUT',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  PROPERTY_CREATED = 'PROPERTY_CREATED',
  PROPERTY_UPDATED = 'PROPERTY_UPDATED',
  PROPERTY_DELETED = 'PROPERTY_DELETED',
  BOOKING_UPDATED = 'BOOKING_UPDATED',
  BOOKING_DELETED = 'BOOKING_DELETED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
}

export interface AuditLog {
  event_type: AuditEventType;
  user_id?: number;
  username?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
  success: boolean;
}

// Helper to sanitize sensitive data for console logging
function sanitizeForConsole(log: AuditLog): Partial<AuditLog> {
  return {
    event_type: log.event_type,
    success: log.success,
    // Mask username in console logs for security
    username: log.username ? `${log.username.substring(0, 2)}***` : undefined,
    // Mask IP address (show first octet only)
    ip_address: log.ip_address ? log.ip_address.split('.').slice(0, 2).join('.') + '.**' : undefined,
    // Don't log user_agent to console (can be long and less critical)
    // Don't log full details to console (may contain sensitive info)
    details: log.details ? { reason: log.details.reason || 'logged' } : undefined,
  };
}

export async function logAuditEvent(log: AuditLog): Promise<void> {
  try {
    await pool.query(`
      INSERT INTO audit_logs (event_type, user_id, username, ip_address, user_agent, details, success, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
    `, [
      log.event_type,
      log.user_id || null,
      log.username || null,
      log.ip_address || null,
      log.user_agent || null,
      log.details ? JSON.stringify(log.details) : null,
      log.success,
    ]);
  } catch (error: any) {
    // If table doesn't exist or there's an error, log sanitized version to console
    // Only log in development or if explicitly enabled
    if (process.env.NODE_ENV === 'development' || process.env.ENABLE_CONSOLE_AUDIT === 'true') {
      const sanitized = sanitizeForConsole(log);
      console.log('[AUDIT]', {
        ...sanitized,
        timestamp: new Date().toISOString(),
        error: error.message,
        note: 'Full details stored in database only',
      });
    } else {
      // In production, only log error without sensitive data
      console.error('[AUDIT] Failed to log audit event to database:', {
        event_type: log.event_type,
        error: error.message,
        note: 'Enable ENABLE_CONSOLE_AUDIT=true to see sanitized console logs',
      });
    }
  }
}

export function getClientIp(req: any): string {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.ip ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

export function getUserAgent(req: any): string {
  return req.headers['user-agent'] || 'unknown';
}

module.exports = { logAuditEvent, AuditEventType, getClientIp, getUserAgent };