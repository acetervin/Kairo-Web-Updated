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
// In-memory store for failed login attempts (use Redis in production)
var failedAttempts = new Map();
// Clean up old entries periodically
setInterval(function () {
    var now = Date.now();
    failedAttempts.forEach(function (attempt, username) {
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
export var MAX_FAILED_ATTEMPTS = 5;
var LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
export function checkAccountLockoutSync(username) {
    var attempt = failedAttempts.get(username);
    if (!attempt) {
        return { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS };
    }
    // Check if account is currently locked
    if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) {
        // Only log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log("[ACCOUNT_LOCKOUT] Account is LOCKED for user: ".concat(username, " until ").concat(new Date(attempt.lockedUntil).toISOString()));
        }
        return {
            isLocked: true,
            lockedUntil: new Date(attempt.lockedUntil),
        };
    }
    // Lock expired, reset count
    if (attempt.lockedUntil && Date.now() >= attempt.lockedUntil) {
        failedAttempts.delete(username);
        return { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS };
    }
    var remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - attempt.count);
    return {
        isLocked: false,
        remainingAttempts: remainingAttempts,
    };
}
export function checkAccountLockout(username) {
    return __awaiter(this, void 0, void 0, function () {
        var attempt, remainingAttempts;
        return __generator(this, function (_a) {
            attempt = failedAttempts.get(username);
            if (!attempt) {
                return [2 /*return*/, { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS }];
            }
            // Check if account is currently locked
            if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) {
                console.log("[ACCOUNT_LOCKOUT] Account is LOCKED for user: ".concat(username, " until ").concat(new Date(attempt.lockedUntil).toISOString()));
                return [2 /*return*/, {
                        isLocked: true,
                        lockedUntil: new Date(attempt.lockedUntil),
                    }];
            }
            // Lock expired, reset count
            if (attempt.lockedUntil && Date.now() >= attempt.lockedUntil) {
                if (process.env.NODE_ENV === 'development') {
                    console.log("[ACCOUNT_LOCKOUT] Lockout expired for user: ".concat(username, ", resetting counter"));
                }
                failedAttempts.delete(username);
                return [2 /*return*/, { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS }];
            }
            remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - attempt.count);
            if (process.env.NODE_ENV === 'development') {
                console.log("[ACCOUNT_LOCKOUT] User: ".concat(username, ", Failed attempts: ").concat(attempt.count, ", Remaining: ").concat(remainingAttempts));
            }
            return [2 /*return*/, {
                    isLocked: false,
                    remainingAttempts: remainingAttempts,
                }];
        });
    });
}
export function recordFailedLogin(username) {
    var attempt = failedAttempts.get(username);
    var now = Date.now();
    if (!attempt) {
        failedAttempts.set(username, {
            username: username,
            count: 1,
            lastAttempt: now,
        });
        if (process.env.NODE_ENV === 'development') {
            console.log("[ACCOUNT_LOCKOUT] First failed login attempt for user: ".concat(username));
        }
        return { isLocked: false };
    }
    // Reset count if last attempt was more than 15 minutes ago
    if (now - attempt.lastAttempt > LOCKOUT_DURATION_MS) {
        attempt.count = 1;
        attempt.lastAttempt = now;
        attempt.lockedUntil = undefined;
        if (process.env.NODE_ENV === 'development') {
            console.log("[ACCOUNT_LOCKOUT] Reset lockout count for user: ".concat(username, " (previous attempts expired)"));
        }
        return { isLocked: false };
    }
    attempt.count++;
    attempt.lastAttempt = now;
    if (process.env.NODE_ENV === 'development') {
        console.log("[ACCOUNT_LOCKOUT] Failed login attempt ".concat(attempt.count, "/").concat(MAX_FAILED_ATTEMPTS, " for user: ").concat(username));
    }
    // Lock account if max attempts reached
    if (attempt.count >= MAX_FAILED_ATTEMPTS) {
        attempt.lockedUntil = now + LOCKOUT_DURATION_MS;
        if (process.env.NODE_ENV === 'development') {
            console.log("[ACCOUNT_LOCKOUT] Account LOCKED for user: ".concat(username, " until ").concat(new Date(attempt.lockedUntil).toISOString()));
        }
        return {
            isLocked: true,
            lockedUntil: new Date(attempt.lockedUntil),
        };
    }
    return { isLocked: false };
}
export function recordSuccessfulLogin(username) {
    // Clear failed attempts on successful login
    failedAttempts.delete(username);
    // Also update database last_login is handled in the login route
}
