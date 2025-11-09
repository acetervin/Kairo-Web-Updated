"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_FAILED_ATTEMPTS = void 0;
exports.checkAccountLockoutSync = checkAccountLockoutSync;
exports.checkAccountLockout = checkAccountLockout;
exports.recordFailedLogin = recordFailedLogin;
exports.recordSuccessfulLogin = recordSuccessfulLogin;
const { pool } = require('../db');
// In-memory store for failed login attempts (use Redis in production)
const failedAttempts = new Map();
// Clean up old entries periodically
setInterval(() => {
    const now = Date.now();
    failedAttempts.forEach((attempt, username) => {
        // Remove entries older than 1 hour that aren't locked
        if (!attempt.lockedUntil && now - attempt.lastAttempt > 60 * 60 * 1000) {
            failedAttempts.delete(username);
        }
        // Remove expired locks
        if (attempt.lockedUntil && now > attempt.lockedUntil) {
            failedAttempts.delete(username);
        }
    });
}, 5 * 60 * 1000); // Clean up every 5 minutes
exports.MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
function checkAccountLockoutSync(username) {
    const attempt = failedAttempts.get(username);
    if (!attempt) {
        return { isLocked: false, remainingAttempts: exports.MAX_FAILED_ATTEMPTS };
    }
    // Check if account is currently locked
    if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) {
        // Only log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[ACCOUNT_LOCKOUT] Account is LOCKED for user: ${username} until ${new Date(attempt.lockedUntil).toISOString()}`);
        }
        return {
            isLocked: true,
            lockedUntil: new Date(attempt.lockedUntil),
        };
    }
    // Lock expired, reset count
    if (attempt.lockedUntil && Date.now() >= attempt.lockedUntil) {
        failedAttempts.delete(username);
        return { isLocked: false, remainingAttempts: exports.MAX_FAILED_ATTEMPTS };
    }
    const remainingAttempts = Math.max(0, exports.MAX_FAILED_ATTEMPTS - attempt.count);
    return {
        isLocked: false,
        remainingAttempts,
    };
}
async function checkAccountLockout(username) {
    const attempt = failedAttempts.get(username);
    if (!attempt) {
        return { isLocked: false, remainingAttempts: exports.MAX_FAILED_ATTEMPTS };
    }
    // Check if account is currently locked
    if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) {
        console.log(`[ACCOUNT_LOCKOUT] Account is LOCKED for user: ${username} until ${new Date(attempt.lockedUntil).toISOString()}`);
        return {
            isLocked: true,
            lockedUntil: new Date(attempt.lockedUntil),
        };
    }
    // Lock expired, reset count
    if (attempt.lockedUntil && Date.now() >= attempt.lockedUntil) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[ACCOUNT_LOCKOUT] Lockout expired for user: ${username}, resetting counter`);
        }
        failedAttempts.delete(username);
        return { isLocked: false, remainingAttempts: exports.MAX_FAILED_ATTEMPTS };
    }
    const remainingAttempts = Math.max(0, exports.MAX_FAILED_ATTEMPTS - attempt.count);
    if (process.env.NODE_ENV === 'development') {
        console.log(`[ACCOUNT_LOCKOUT] User: ${username}, Failed attempts: ${attempt.count}, Remaining: ${remainingAttempts}`);
    }
    return {
        isLocked: false,
        remainingAttempts,
    };
}
function recordFailedLogin(username) {
    const attempt = failedAttempts.get(username);
    const now = Date.now();
    if (!attempt) {
        failedAttempts.set(username, {
            username,
            count: 1,
            lastAttempt: now,
        });
        if (process.env.NODE_ENV === 'development') {
            console.log(`[ACCOUNT_LOCKOUT] First failed login attempt for user: ${username}`);
        }
        return { isLocked: false };
    }
    // Reset count if last attempt was more than 15 minutes ago
    if (now - attempt.lastAttempt > LOCKOUT_DURATION_MS) {
        attempt.count = 1;
        attempt.lastAttempt = now;
        attempt.lockedUntil = undefined;
        if (process.env.NODE_ENV === 'development') {
            console.log(`[ACCOUNT_LOCKOUT] Reset lockout count for user: ${username} (previous attempts expired)`);
        }
        return { isLocked: false };
    }
    attempt.count++;
    attempt.lastAttempt = now;
    if (process.env.NODE_ENV === 'development') {
        console.log(`[ACCOUNT_LOCKOUT] Failed login attempt ${attempt.count}/${exports.MAX_FAILED_ATTEMPTS} for user: ${username}`);
    }
    // Lock account if max attempts reached
    if (attempt.count >= exports.MAX_FAILED_ATTEMPTS) {
        attempt.lockedUntil = now + LOCKOUT_DURATION_MS;
        if (process.env.NODE_ENV === 'development') {
            console.log(`[ACCOUNT_LOCKOUT] Account LOCKED for user: ${username} until ${new Date(attempt.lockedUntil).toISOString()}`);
        }
        return {
            isLocked: true,
            lockedUntil: new Date(attempt.lockedUntil),
        };
    }
    return { isLocked: false };
}
function recordSuccessfulLogin(username) {
    // Clear failed attempts on successful login
    failedAttempts.delete(username);
    // Also update database last_login is handled in the login route
}
module.exports = { checkAccountLockout, checkAccountLockoutSync, recordFailedLogin, recordSuccessfulLogin, MAX_FAILED_ATTEMPTS: exports.MAX_FAILED_ATTEMPTS };
