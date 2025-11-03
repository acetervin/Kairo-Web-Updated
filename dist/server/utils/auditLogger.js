var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { pool } from '../db.js';
export var AuditEventType;
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
})(AuditEventType || (AuditEventType = {}));
// Helper to sanitize sensitive data for console logging
function sanitizeForConsole(log) {
    return {
        event_type: log.event_type,
        success: log.success,
        // Mask username in console logs for security
        username: log.username ? "".concat(log.username.substring(0, 2), "***") : undefined,
        // Mask IP address (show first octet only)
        ip_address: log.ip_address ? log.ip_address.split('.').slice(0, 2).join('.') + '.**' : undefined,
        // Don't log user_agent to console (can be long and less critical)
        // Don't log full details to console (may contain sensitive info)
        details: log.details ? { reason: log.details.reason || 'logged' } : undefined,
    };
}
export function logAuditEvent(log) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1, sanitized;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, pool.query("\n      INSERT INTO audit_logs (event_type, user_id, username, ip_address, user_agent, details, success, created_at)\n      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)\n    ", [
                            log.event_type,
                            log.user_id || null,
                            log.username || null,
                            log.ip_address || null,
                            log.user_agent || null,
                            log.details ? JSON.stringify(log.details) : null,
                            log.success,
                        ])];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    // If table doesn't exist or there's an error, log sanitized version to console
                    // Only log in development or if explicitly enabled
                    if (process.env.NODE_ENV === 'development' || process.env.ENABLE_CONSOLE_AUDIT === 'true') {
                        sanitized = sanitizeForConsole(log);
                        console.log('[AUDIT]', __assign(__assign({}, sanitized), { timestamp: new Date().toISOString(), error: error_1.message, note: 'Full details stored in database only' }));
                    }
                    else {
                        // In production, only log error without sensitive data
                        console.error('[AUDIT] Failed to log audit event to database:', {
                            event_type: log.event_type,
                            error: error_1.message,
                            note: 'Enable ENABLE_CONSOLE_AUDIT=true to see sanitized console logs',
                        });
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
export function getClientIp(req) {
    var _a, _b;
    return (((_b = (_a = req.headers['x-forwarded-for']) === null || _a === void 0 ? void 0 : _a.split(',')[0]) === null || _b === void 0 ? void 0 : _b.trim()) ||
        req.headers['x-real-ip'] ||
        req.ip ||
        req.socket.remoteAddress ||
        'unknown');
}
export function getUserAgent(req) {
    return req.headers['user-agent'] || 'unknown';
}
