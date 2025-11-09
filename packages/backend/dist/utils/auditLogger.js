"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditEventType = void 0;
exports.logAuditEvent = logAuditEvent;
exports.getClientIp = getClientIp;
exports.getUserAgent = getUserAgent;
const { pool } = require('../db');
var AuditEventType;
(function (AuditEventType) {
    AuditEventType["LOGIN_SUCCESS"] = "LOGIN_SUCCESS";
    AuditEventType["LOGIN_FAILURE"] = "LOGIN_FAILURE";
    AuditEventType["LOGIN_LOCKOUT"] = "LOGIN_LOCKOUT";
    AuditEventType["LOGOUT"] = "LOGOUT";
    AuditEventType["USER_CREATED"] = "USER_CREATED";
    AuditEventType["USER_UPDATED"] = "USER_UPDATED";
    AuditEventType["USER_DELETED"] = "USER_DELETED";
    AuditEventType["PROPERTY_CREATED"] = "PROPERTY_CREATED";
    AuditEventType["PROPERTY_UPDATED"] = "PROPERTY_UPDATED";
    AuditEventType["PROPERTY_DELETED"] = "PROPERTY_DELETED";
    AuditEventType["BOOKING_UPDATED"] = "BOOKING_UPDATED";
    AuditEventType["BOOKING_DELETED"] = "BOOKING_DELETED";
    AuditEventType["PASSWORD_CHANGED"] = "PASSWORD_CHANGED";
    AuditEventType["UNAUTHORIZED_ACCESS"] = "UNAUTHORIZED_ACCESS";
})(AuditEventType || (exports.AuditEventType = AuditEventType = {}));
// Helper to sanitize sensitive data for console logging
function sanitizeForConsole(log) {
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
async function logAuditEvent(log) {
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
    }
    catch (error) {
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
        }
        else {
            // In production, only log error without sensitive data
            console.error('[AUDIT] Failed to log audit event to database:', {
                event_type: log.event_type,
                error: error.message,
                note: 'Enable ENABLE_CONSOLE_AUDIT=true to see sanitized console logs',
            });
        }
    }
}
function getClientIp(req) {
    return (req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.headers['x-real-ip'] ||
        req.ip ||
        req.socket.remoteAddress ||
        'unknown');
}
function getUserAgent(req) {
    return req.headers['user-agent'] || 'unknown';
}
module.exports = { logAuditEvent, AuditEventType, getClientIp, getUserAgent };
