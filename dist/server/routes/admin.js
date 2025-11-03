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
import { Router } from 'express';
import { pool } from '../db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { loginProtectionMiddleware } from '../middleware/loginProtection.js';
import { checkAccountLockout, recordFailedLogin, recordSuccessfulLogin, MAX_FAILED_ATTEMPTS } from '../middleware/accountLockout.js';
import { validatePassword, sanitizeInput } from '../utils/passwordValidator.js';
import { logAuditEvent, AuditEventType, getClientIp, getUserAgent } from '../utils/auditLogger.js';
var router = Router();
// JWT secret from environment variable
var JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
// Middleware to verify admin token
var verifyToken = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var token, ipAddress, userAgent, decoded, error_1, ipAddress, userAgent;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
                if (!!token) return [3 /*break*/, 2];
                ipAddress = getClientIp(req);
                userAgent = getUserAgent(req);
                return [4 /*yield*/, logAuditEvent({
                        event_type: AuditEventType.UNAUTHORIZED_ACCESS,
                        ip_address: ipAddress,
                        user_agent: userAgent,
                        details: { reason: 'No token provided', path: req.path },
                        success: false,
                    })];
            case 1:
                _b.sent();
                return [2 /*return*/, res.status(401).json({ message: 'No token provided' })];
            case 2:
                _b.trys.push([2, 3, , 5]);
                decoded = jwt.verify(token, JWT_SECRET);
                req.user = decoded;
                next();
                return [3 /*break*/, 5];
            case 3:
                error_1 = _b.sent();
                ipAddress = getClientIp(req);
                userAgent = getUserAgent(req);
                return [4 /*yield*/, logAuditEvent({
                        event_type: AuditEventType.UNAUTHORIZED_ACCESS,
                        ip_address: ipAddress,
                        user_agent: userAgent,
                        details: { reason: 'Invalid token', path: req.path },
                        success: false,
                    })];
            case 4:
                _b.sent();
                return [2 /*return*/, res.status(401).json({ message: 'Invalid token' })];
            case 5: return [2 /*return*/];
        }
    });
}); };
// Admin login with database authentication (protected with rate limiting and account lockout)
router.post('/login', loginProtectionMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ipAddress, userAgent, username, password, lockoutStatus, result, user, passwordMatch, lockoutResult, updatedLockoutStatus, lockoutTime, token, error_2;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                ipAddress = getClientIp(req);
                userAgent = getUserAgent(req);
                username = sanitizeInput(((_a = req.body) === null || _a === void 0 ? void 0 : _a.username) || '');
                _e.label = 1;
            case 1:
                _e.trys.push([1, 16, , 18]);
                password = (_b = req.body) === null || _b === void 0 ? void 0 : _b.password;
                if (!(!username || !password)) return [3 /*break*/, 3];
                return [4 /*yield*/, logAuditEvent({
                        event_type: AuditEventType.LOGIN_FAILURE,
                        username: username,
                        ip_address: ipAddress,
                        user_agent: userAgent,
                        details: { reason: 'Missing credentials' },
                        success: false,
                    })];
            case 2:
                _e.sent();
                return [2 /*return*/, res.status(400).json({ message: 'Username and password are required' })];
            case 3: return [4 /*yield*/, checkAccountLockout(username)];
            case 4:
                lockoutStatus = _e.sent();
                if (!lockoutStatus.isLocked) return [3 /*break*/, 6];
                return [4 /*yield*/, logAuditEvent({
                        event_type: AuditEventType.LOGIN_LOCKOUT,
                        username: username,
                        ip_address: ipAddress,
                        user_agent: userAgent,
                        details: { lockedUntil: lockoutStatus.lockedUntil },
                        success: false,
                    })];
            case 5:
                _e.sent();
                return [2 /*return*/, res.status(423).json({
                        message: 'Account temporarily locked',
                        error: "Too many failed login attempts. Account locked until ".concat((_c = lockoutStatus.lockedUntil) === null || _c === void 0 ? void 0 : _c.toISOString()),
                        lockedUntil: (_d = lockoutStatus.lockedUntil) === null || _d === void 0 ? void 0 : _d.toISOString(),
                    })];
            case 6: return [4 /*yield*/, pool.query('SELECT * FROM admin_users WHERE username = $1 AND is_active = true', [username])];
            case 7:
                result = _e.sent();
                if (!(result.rows.length === 0)) return [3 /*break*/, 9];
                // Record failed attempt even if user doesn't exist (prevents username enumeration)
                recordFailedLogin(username);
                return [4 /*yield*/, logAuditEvent({
                        event_type: AuditEventType.LOGIN_FAILURE,
                        username: username,
                        ip_address: ipAddress,
                        user_agent: userAgent,
                        details: { reason: 'User not found' },
                        success: false,
                    })];
            case 8:
                _e.sent();
                // Use generic message to prevent username enumeration
                return [2 /*return*/, res.status(401).json({ message: 'Invalid credentials' })];
            case 9:
                user = result.rows[0];
                return [4 /*yield*/, bcrypt.compare(password, user.password_hash)];
            case 10:
                passwordMatch = _e.sent();
                if (!!passwordMatch) return [3 /*break*/, 13];
                lockoutResult = recordFailedLogin(username);
                return [4 /*yield*/, checkAccountLockout(username)];
            case 11:
                updatedLockoutStatus = _e.sent();
                return [4 /*yield*/, logAuditEvent({
                        event_type: lockoutResult.isLocked ? AuditEventType.LOGIN_LOCKOUT : AuditEventType.LOGIN_FAILURE,
                        user_id: user.id,
                        username: username,
                        ip_address: ipAddress,
                        user_agent: userAgent,
                        details: {
                            reason: 'Invalid password',
                            failedAttempts: updatedLockoutStatus.remainingAttempts ? MAX_FAILED_ATTEMPTS - updatedLockoutStatus.remainingAttempts : undefined,
                            remainingAttempts: updatedLockoutStatus.remainingAttempts,
                            lockedUntil: lockoutResult.lockedUntil,
                        },
                        success: false,
                    })];
            case 12:
                _e.sent();
                // Check if account is now locked after this failed attempt
                if (lockoutResult.isLocked || updatedLockoutStatus.isLocked) {
                    lockoutTime = lockoutResult.lockedUntil || updatedLockoutStatus.lockedUntil;
                    return [2 /*return*/, res.status(423).json({
                            message: 'Account temporarily locked',
                            error: "Too many failed login attempts. Account locked until ".concat(lockoutTime === null || lockoutTime === void 0 ? void 0 : lockoutTime.toISOString()),
                            lockedUntil: lockoutTime === null || lockoutTime === void 0 ? void 0 : lockoutTime.toISOString(),
                        })];
                }
                return [2 /*return*/, res.status(401).json({
                        message: 'Invalid credentials',
                        remainingAttempts: updatedLockoutStatus.remainingAttempts,
                    })];
            case 13:
                // Successful login
                recordSuccessfulLogin(username);
                // Update last login time
                return [4 /*yield*/, pool.query('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id])];
            case 14:
                // Update last login time
                _e.sent();
                token = jwt.sign({
                    id: user.id,
                    username: user.username,
                    role: user.role
                }, JWT_SECRET, { expiresIn: '24h' });
                return [4 /*yield*/, logAuditEvent({
                        event_type: AuditEventType.LOGIN_SUCCESS,
                        user_id: user.id,
                        username: username,
                        ip_address: ipAddress,
                        user_agent: userAgent,
                        details: { role: user.role },
                        success: true,
                    })];
            case 15:
                _e.sent();
                res.json({
                    token: token,
                    user: {
                        id: user.id,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    },
                });
                return [3 /*break*/, 18];
            case 16:
                error_2 = _e.sent();
                // Log error without exposing sensitive details
                console.error('[LOGIN] Error during login process:', {
                    error: error_2.message,
                    code: error_2.code,
                    // Don't log username in error messages
                });
                return [4 /*yield*/, logAuditEvent({
                        event_type: AuditEventType.LOGIN_FAILURE,
                        username: username,
                        ip_address: ipAddress,
                        user_agent: userAgent,
                        details: { error: error_2.message },
                        success: false,
                    })];
            case 17:
                _e.sent();
                // Don't expose internal error details to client
                res.status(500).json({ message: 'Login failed. Please try again.' });
                return [3 /*break*/, 18];
            case 18: return [2 /*return*/];
        }
    });
}); });
// Token refresh endpoint - allows refreshing JWT token without re-login
router.post('/refresh', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ipAddress, userAgent, token, decoded, error_3, userResult, user, newToken, error_4;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                ipAddress = getClientIp(req);
                userAgent = getUserAgent(req);
                token = ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '')) || ((_b = req.body) === null || _b === void 0 ? void 0 : _b.token);
                if (!token) {
                    return [2 /*return*/, res.status(401).json({ message: 'No token provided' })];
                }
                _c.label = 1;
            case 1:
                _c.trys.push([1, 11, , 13]);
                decoded = void 0;
                _c.label = 2;
            case 2:
                _c.trys.push([2, 3, , 6]);
                decoded = jwt.verify(token, JWT_SECRET);
                return [3 /*break*/, 6];
            case 3:
                error_3 = _c.sent();
                // Token might be expired, but we can still refresh if it's valid format
                // Decode without verification to get user info
                decoded = jwt.decode(token);
                if (!(!decoded || !decoded.id)) return [3 /*break*/, 5];
                return [4 /*yield*/, logAuditEvent({
                        event_type: AuditEventType.UNAUTHORIZED_ACCESS,
                        ip_address: ipAddress,
                        user_agent: userAgent,
                        details: { reason: 'Invalid token format for refresh', path: '/refresh' },
                        success: false,
                    })];
            case 4:
                _c.sent();
                return [2 /*return*/, res.status(401).json({ message: 'Invalid token' })];
            case 5: return [3 /*break*/, 6];
            case 6: return [4 /*yield*/, pool.query('SELECT id, username, name, email, role, is_active FROM admin_users WHERE id = $1 AND is_active = true', [decoded.id])];
            case 7:
                userResult = _c.sent();
                if (!(userResult.rows.length === 0)) return [3 /*break*/, 9];
                return [4 /*yield*/, logAuditEvent({
                        event_type: AuditEventType.UNAUTHORIZED_ACCESS,
                        user_id: decoded.id,
                        username: decoded.username,
                        ip_address: ipAddress,
                        user_agent: userAgent,
                        details: { reason: 'User not found or inactive', path: '/refresh' },
                        success: false,
                    })];
            case 8:
                _c.sent();
                return [2 /*return*/, res.status(401).json({ message: 'User not found or inactive' })];
            case 9:
                user = userResult.rows[0];
                newToken = jwt.sign({
                    id: user.id,
                    username: user.username,
                    role: user.role,
                }, JWT_SECRET, { expiresIn: '24h' });
                return [4 /*yield*/, logAuditEvent({
                        event_type: AuditEventType.LOGIN_SUCCESS,
                        user_id: user.id,
                        username: user.username,
                        ip_address: ipAddress,
                        user_agent: userAgent,
                        details: { action: 'token_refresh' },
                        success: true,
                    })];
            case 10:
                _c.sent();
                res.json({
                    token: newToken,
                    user: {
                        id: user.id,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                    },
                });
                return [3 /*break*/, 13];
            case 11:
                error_4 = _c.sent();
                console.error('Token refresh error:', error_4);
                return [4 /*yield*/, logAuditEvent({
                        event_type: AuditEventType.UNAUTHORIZED_ACCESS,
                        ip_address: ipAddress,
                        user_agent: userAgent,
                        details: { reason: 'Token refresh failed', error: error_4.message, path: '/refresh' },
                        success: false,
                    })];
            case 12:
                _c.sent();
                res.status(401).json({ message: 'Token refresh failed', error: error_4.message });
                return [3 /*break*/, 13];
            case 13: return [2 /*return*/];
        }
    });
}); });
// Get dashboard stats (REAL DATA)
router.get('/stats', verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var propertiesResult, bookingsResult, revenueResult, recentBookingsResult, popularPropertiesResult, error_5;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 6, , 7]);
                return [4 /*yield*/, pool.query('SELECT COUNT(*) as count FROM properties WHERE is_active = true')];
            case 1:
                propertiesResult = _d.sent();
                return [4 /*yield*/, pool.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'")];
            case 2:
                bookingsResult = _d.sent();
                return [4 /*yield*/, pool.query('SELECT COALESCE(SUM(CAST(total_amount AS DECIMAL)), 0) as total FROM bookings WHERE status = $1', ['confirmed'])];
            case 3:
                revenueResult = _d.sent();
                return [4 /*yield*/, pool.query("\n      SELECT b.*, p.name as property_name\n      FROM bookings b\n      LEFT JOIN properties p ON b.property_id = p.id\n      WHERE b.created_at >= NOW() - INTERVAL '7 days'\n      ORDER BY b.created_at DESC\n      LIMIT 5\n    ")];
            case 4:
                recentBookingsResult = _d.sent();
                return [4 /*yield*/, pool.query("\n      SELECT p.*, COUNT(b.id) as booking_count\n      FROM properties p\n      LEFT JOIN bookings b ON p.id = b.property_id\n      WHERE p.is_active = true\n      GROUP BY p.id\n      ORDER BY booking_count DESC\n      LIMIT 5\n    ")];
            case 5:
                popularPropertiesResult = _d.sent();
                res.json({
                    totalProperties: parseInt(((_a = propertiesResult.rows[0]) === null || _a === void 0 ? void 0 : _a.count) || '0'),
                    activeBookings: parseInt(((_b = bookingsResult.rows[0]) === null || _b === void 0 ? void 0 : _b.count) || '0'),
                    totalRevenue: parseFloat(((_c = revenueResult.rows[0]) === null || _c === void 0 ? void 0 : _c.total) || '0'),
                    totalViews: 0, // You can track this separately if needed
                    recentBookings: recentBookingsResult.rows,
                    popularProperties: popularPropertiesResult.rows,
                });
                return [3 /*break*/, 7];
            case 6:
                error_5 = _d.sent();
                console.error('Error fetching stats:', error_5);
                res.status(500).json({ message: 'Failed to fetch stats', error: error_5.message });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
// Get all admin users
router.get('/users', verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, pool.query("SELECT id, username, name, email, role, is_active, created_at, last_login\n       FROM admin_users\n       ORDER BY created_at DESC")];
            case 1:
                result = _a.sent();
                res.json(result.rows);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Error fetching users:', error_6);
                res.status(500).json({ message: 'Failed to fetch users', error: error_6.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Create new admin user
router.post('/users', verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ipAddress, userAgent, _a, username, password, name_1, email, role, sanitizedUsername, sanitizedName, sanitizedEmail, passwordValidation, saltRounds, passwordHash, result, error_7;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                ipAddress = getClientIp(req);
                userAgent = getUserAgent(req);
                _d.label = 1;
            case 1:
                _d.trys.push([1, 5, , 6]);
                _a = req.body, username = _a.username, password = _a.password, name_1 = _a.name, email = _a.email, role = _a.role;
                if (!username || !password || !name_1) {
                    return [2 /*return*/, res.status(400).json({ message: 'Username, password, and name are required' })];
                }
                sanitizedUsername = sanitizeInput(username);
                sanitizedName = sanitizeInput(name_1);
                sanitizedEmail = email ? sanitizeInput(email) : null;
                passwordValidation = validatePassword(password);
                if (!passwordValidation.isValid) {
                    return [2 /*return*/, res.status(400).json({
                            message: 'Password validation failed',
                            errors: passwordValidation.errors,
                        })];
                }
                saltRounds = 10;
                return [4 /*yield*/, bcrypt.hash(password, saltRounds)];
            case 2:
                passwordHash = _d.sent();
                return [4 /*yield*/, pool.query("INSERT INTO admin_users (username, password_hash, name, email, role)\n       VALUES ($1, $2, $3, $4, $5)\n       RETURNING id, username, name, email, role, is_active, created_at", [sanitizedUsername, passwordHash, sanitizedName, sanitizedEmail, role || 'admin'])];
            case 3:
                result = _d.sent();
                return [4 /*yield*/, logAuditEvent({
                        event_type: AuditEventType.USER_CREATED,
                        user_id: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
                        username: (_c = req.user) === null || _c === void 0 ? void 0 : _c.username,
                        ip_address: ipAddress,
                        user_agent: userAgent,
                        details: { created_user_id: result.rows[0].id, created_username: sanitizedUsername },
                        success: true,
                    })];
            case 4:
                _d.sent();
                res.status(201).json(result.rows[0]);
                return [3 /*break*/, 6];
            case 5:
                error_7 = _d.sent();
                console.error('Error creating user:', error_7);
                if (error_7.code === '23505') { // Unique violation
                    return [2 /*return*/, res.status(409).json({ message: 'Username or email already exists' })];
                }
                res.status(500).json({ message: 'Failed to create user', error: error_7.message });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
// Update admin user
router.put('/users/:id', verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ipAddress, userAgent, id, _a, username, name_2, email, role, is_active, password, sanitizedName, sanitizedEmail, query, params, passwordValidation, saltRounds, passwordHash, result, error_8;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                ipAddress = getClientIp(req);
                userAgent = getUserAgent(req);
                _d.label = 1;
            case 1:
                _d.trys.push([1, 7, , 8]);
                id = req.params.id;
                _a = req.body, username = _a.username, name_2 = _a.name, email = _a.email, role = _a.role, is_active = _a.is_active, password = _a.password;
                sanitizedName = sanitizeInput(name_2 || '');
                sanitizedEmail = email ? sanitizeInput(email) : null;
                query = "UPDATE admin_users SET name = $1, email = $2, role = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP";
                params = [sanitizedName, sanitizedEmail, role, is_active];
                if (!password) return [3 /*break*/, 3];
                passwordValidation = validatePassword(password);
                if (!passwordValidation.isValid) {
                    return [2 /*return*/, res.status(400).json({
                            message: 'Password validation failed',
                            errors: passwordValidation.errors,
                        })];
                }
                saltRounds = 10;
                return [4 /*yield*/, bcrypt.hash(password, saltRounds)];
            case 2:
                passwordHash = _d.sent();
                query += ", password_hash = $5 WHERE id = $6 RETURNING id, username, name, email, role, is_active";
                params.push(passwordHash, parseInt(id));
                return [3 /*break*/, 4];
            case 3:
                query += " WHERE id = $5 RETURNING id, username, name, email, role, is_active";
                params.push(parseInt(id));
                _d.label = 4;
            case 4: return [4 /*yield*/, pool.query(query, params)];
            case 5:
                result = _d.sent();
                if (result.rows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ message: 'User not found' })];
                }
                return [4 /*yield*/, logAuditEvent({
                        event_type: password ? AuditEventType.PASSWORD_CHANGED : AuditEventType.USER_UPDATED,
                        user_id: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
                        username: (_c = req.user) === null || _c === void 0 ? void 0 : _c.username,
                        ip_address: ipAddress,
                        user_agent: userAgent,
                        details: {
                            updated_user_id: parseInt(id),
                            password_changed: !!password,
                        },
                        success: true,
                    })];
            case 6:
                _d.sent();
                res.json(result.rows[0]);
                return [3 /*break*/, 8];
            case 7:
                error_8 = _d.sent();
                console.error('Error updating user:', error_8);
                if (error_8.code === '23505') {
                    return [2 /*return*/, res.status(409).json({ message: 'Email already exists' })];
                }
                res.status(500).json({ message: 'Failed to update user', error: error_8.message });
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
// Delete admin user
router.delete('/users/:id', verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                // Prevent deleting yourself
                if (req.user && req.user.id === parseInt(id)) {
                    return [2 /*return*/, res.status(400).json({ message: 'Cannot delete your own account' })];
                }
                return [4 /*yield*/, pool.query('DELETE FROM admin_users WHERE id = $1 RETURNING id', [parseInt(id)])];
            case 1:
                result = _a.sent();
                if (result.rows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ message: 'User not found' })];
                }
                res.json({ message: 'User deleted successfully', id: result.rows[0].id });
                return [3 /*break*/, 3];
            case 2:
                error_9 = _a.sent();
                console.error('Error deleting user:', error_9);
                res.status(500).json({ message: 'Failed to delete user', error: error_9.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Create property
router.post('/properties', verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name_3, description, location_1, category, price_per_night, max_guests, bedrooms, bathrooms, main_image_url, map_url, amenities, result, error_10;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, name_3 = _a.name, description = _a.description, location_1 = _a.location, category = _a.category, price_per_night = _a.price_per_night, max_guests = _a.max_guests, bedrooms = _a.bedrooms, bathrooms = _a.bathrooms, main_image_url = _a.main_image_url, map_url = _a.map_url, amenities = _a.amenities;
                return [4 /*yield*/, pool.query("INSERT INTO properties (\n        name, description, location, category, price_per_night,\n        max_guests, bedrooms, bathrooms, main_image_url, map_url, amenities, is_active\n      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)\n      RETURNING *", [
                        name_3,
                        description,
                        location_1,
                        category,
                        price_per_night,
                        max_guests,
                        bedrooms,
                        bathrooms,
                        main_image_url || null,
                        map_url || null,
                        amenities || []
                    ])];
            case 1:
                result = _b.sent();
                res.status(201).json(result.rows[0]);
                return [3 /*break*/, 3];
            case 2:
                error_10 = _b.sent();
                console.error('Error creating property:', error_10);
                res.status(500).json({ message: 'Failed to create property', error: error_10.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Update property
router.put('/properties/:id', verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, name_4, description, location_2, category, price_per_night, max_guests, bedrooms, bathrooms, main_image_url, map_url, amenities, result, error_11;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                id = req.params.id;
                _a = req.body, name_4 = _a.name, description = _a.description, location_2 = _a.location, category = _a.category, price_per_night = _a.price_per_night, max_guests = _a.max_guests, bedrooms = _a.bedrooms, bathrooms = _a.bathrooms, main_image_url = _a.main_image_url, map_url = _a.map_url, amenities = _a.amenities;
                return [4 /*yield*/, pool.query("UPDATE properties SET\n        name = $1,\n        description = $2,\n        location = $3,\n        category = $4,\n        price_per_night = $5,\n        max_guests = $6,\n        bedrooms = $7,\n        bathrooms = $8,\n        main_image_url = $9,\n        map_url = $10,\n        amenities = $11,\n        updated_at = CURRENT_TIMESTAMP\n      WHERE id = $12\n      RETURNING *", [
                        name_4,
                        description,
                        location_2,
                        category,
                        price_per_night,
                        max_guests,
                        bedrooms,
                        bathrooms,
                        main_image_url,
                        map_url,
                        amenities || [],
                        parseInt(id)
                    ])];
            case 1:
                result = _b.sent();
                if (result.rows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ message: 'Property not found' })];
                }
                res.json(result.rows[0]);
                return [3 /*break*/, 3];
            case 2:
                error_11 = _b.sent();
                console.error('Error updating property:', error_11);
                res.status(500).json({ message: 'Failed to update property', error: error_11.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Delete property
router.delete('/properties/:id', verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result, error_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, pool.query('DELETE FROM properties WHERE id = $1 RETURNING id', [parseInt(id)])];
            case 1:
                result = _a.sent();
                if (result.rows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ message: 'Property not found' })];
                }
                res.json({ message: 'Property deleted successfully', id: result.rows[0].id });
                return [3 /*break*/, 3];
            case 2:
                error_12 = _a.sent();
                console.error('Error deleting property:', error_12);
                res.status(500).json({ message: 'Failed to delete property', error: error_12.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Property images (admin CRUD)
router.get('/properties/:id/images', verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, rows, error_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = Number(req.params.id);
                return [4 /*yield*/, pool.query('SELECT id, category, image_url, alt_text, is_primary, sort_order, is_active FROM property_images WHERE property_id = $1 ORDER BY sort_order, id', [id])];
            case 1:
                rows = _a.sent();
                res.json({ images: rows.rows });
                return [3 /*break*/, 3];
            case 2:
                error_13 = _a.sent();
                console.error('Error loading images:', error_13);
                res.status(500).json({ message: 'Failed to load images', error: error_13.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.post('/properties/:id/images', verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, url, category, alt_text, is_primary, sort_order, result, error_14;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                id = Number(req.params.id);
                _a = req.body, url = _a.url, category = _a.category, alt_text = _a.alt_text, is_primary = _a.is_primary, sort_order = _a.sort_order;
                if (!url)
                    return [2 /*return*/, res.status(400).json({ message: 'url is required' })];
                if (!is_primary) return [3 /*break*/, 2];
                return [4 /*yield*/, pool.query('UPDATE property_images SET is_primary = false WHERE property_id = $1', [id])];
            case 1:
                _b.sent();
                _b.label = 2;
            case 2: return [4 /*yield*/, pool.query("INSERT INTO property_images (property_id, category, image_url, alt_text, is_primary, sort_order)\n       VALUES ($1,$2,$3,$4,COALESCE($5,false),COALESCE($6,0))\n       RETURNING id, category, image_url, alt_text, is_primary, sort_order", [id, category || null, url, alt_text || null, is_primary || false, sort_order !== null && sort_order !== void 0 ? sort_order : 0])];
            case 3:
                result = _b.sent();
                res.status(201).json(result.rows[0]);
                return [3 /*break*/, 5];
            case 4:
                error_14 = _b.sent();
                console.error('Error adding image:', error_14);
                res.status(500).json({ message: 'Failed to add image', error: error_14.message });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
router.put('/properties/:id/images/:imageId', verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var propertyId, imageId, _a, url, category, alt_text, is_primary, sort_order, result, error_15;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                propertyId = Number(req.params.id);
                imageId = Number(req.params.imageId);
                _a = req.body, url = _a.url, category = _a.category, alt_text = _a.alt_text, is_primary = _a.is_primary, sort_order = _a.sort_order;
                if (!(is_primary === true)) return [3 /*break*/, 2];
                return [4 /*yield*/, pool.query('UPDATE property_images SET is_primary = false WHERE property_id = $1', [propertyId])];
            case 1:
                _b.sent();
                _b.label = 2;
            case 2: return [4 /*yield*/, pool.query("UPDATE property_images SET\n        category = COALESCE($1, category),\n        image_url = COALESCE($2, image_url),\n        alt_text = COALESCE($3, alt_text),\n        is_primary = COALESCE($4, is_primary),\n        sort_order = COALESCE($5, sort_order),\n        updated_at = CURRENT_TIMESTAMP\n       WHERE id = $6 AND property_id = $7\n       RETURNING id, category, image_url, alt_text, is_primary, sort_order", [category || null, url || null, alt_text || null, is_primary, sort_order, imageId, propertyId])];
            case 3:
                result = _b.sent();
                if (result.rowCount === 0)
                    return [2 /*return*/, res.status(404).json({ message: 'Image not found' })];
                res.json(result.rows[0]);
                return [3 /*break*/, 5];
            case 4:
                error_15 = _b.sent();
                console.error('Error updating image:', error_15);
                res.status(500).json({ message: 'Failed to update image', error: error_15.message });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
router.delete('/properties/:id/images/:imageId', verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var propertyId, imageId, result, error_16;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                propertyId = Number(req.params.id);
                imageId = Number(req.params.imageId);
                return [4 /*yield*/, pool.query('DELETE FROM property_images WHERE id = $1 AND property_id = $2', [imageId, propertyId])];
            case 1:
                result = _a.sent();
                if (result.rowCount === 0)
                    return [2 /*return*/, res.status(404).json({ message: 'Image not found' })];
                res.json({ success: true });
                return [3 /*break*/, 3];
            case 2:
                error_16 = _a.sent();
                console.error('Error deleting image:', error_16);
                res.status(500).json({ message: 'Failed to delete image', error: error_16.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get all bookings
router.get('/bookings', verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_17;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, pool.query("\n      SELECT \n        b.*,\n        p.name as property_name,\n        p.location as property_location,\n        p.main_image_url as property_image_url\n      FROM bookings b\n      LEFT JOIN properties p ON b.property_id = p.id\n      ORDER BY b.created_at DESC\n    ")];
            case 1:
                result = _a.sent();
                res.json(result.rows);
                return [3 /*break*/, 3];
            case 2:
                error_17 = _a.sent();
                console.error('Error fetching bookings:', error_17);
                res.status(500).json({ message: 'Failed to fetch bookings', error: error_17.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get single booking by ID
router.get('/bookings/:id', verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result, error_18;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, pool.query("\n      SELECT \n        b.*,\n        p.name as property_name,\n        p.location as property_location,\n        p.main_image_url as property_image_url,\n        p.description as property_description,\n        p.price_per_night\n      FROM bookings b\n      LEFT JOIN properties p ON b.property_id = p.id\n      WHERE b.id = $1\n    ", [parseInt(id)])];
            case 1:
                result = _a.sent();
                if (result.rows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ message: 'Booking not found' })];
                }
                res.json(result.rows[0]);
                return [3 /*break*/, 3];
            case 2:
                error_18 = _a.sent();
                console.error('Error fetching booking:', error_18);
                res.status(500).json({ message: 'Failed to fetch booking', error: error_18.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Check for date conflicts for a booking
router.get('/bookings/:id/check-conflicts', verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, bookingResult, booking, conflictCheck, error_19;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id = req.params.id;
                return [4 /*yield*/, pool.query('SELECT * FROM bookings WHERE id = $1', [parseInt(id)])];
            case 1:
                bookingResult = _a.sent();
                if (bookingResult.rows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ message: 'Booking not found' })];
                }
                booking = bookingResult.rows[0];
                return [4 /*yield*/, pool.query("SELECT b.id, b.guest_name, bd.start_date, bd.end_date\n       FROM bookings b\n       JOIN blocked_dates bd ON b.id = bd.booking_id\n       WHERE b.id != $1\n         AND b.property_id = $2\n         AND b.status = 'confirmed'\n         AND bd.is_active = true\n         AND (\n           (bd.start_date <= $3::timestamp AND bd.end_date > $3::timestamp) OR\n           (bd.start_date < $4::timestamp AND bd.end_date >= $4::timestamp) OR\n           (bd.start_date >= $3::timestamp AND bd.end_date <= $4::timestamp)\n         )", [parseInt(id), booking.property_id, booking.check_in, booking.check_out])];
            case 2:
                conflictCheck = _a.sent();
                res.json({ conflicts: conflictCheck.rows });
                return [3 /*break*/, 4];
            case 3:
                error_19 = _a.sent();
                console.error('Error checking conflicts:', error_19);
                res.status(500).json({ message: 'Failed to check conflicts', error: error_19.message });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Update booking status
router.put('/bookings/:id', verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, id, _a, status_1, payment_status, payment_intent_id, currentBooking, booking, finalStatus, finalPaymentStatus, finalPaymentIntentId, paymentIntentIdValue, isConfirming, wasAlreadyConfirmed, conflictCheck, wasConfirmed, isCancelling, updateQuery, params, paramIndex, result, error_20;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 19, 21, 22]);
                id = req.params.id;
                _a = req.body, status_1 = _a.status, payment_status = _a.payment_status, payment_intent_id = _a.payment_intent_id;
                return [4 /*yield*/, client.query('BEGIN')];
            case 3:
                _b.sent();
                return [4 /*yield*/, client.query('SELECT * FROM bookings WHERE id = $1', [parseInt(id)])];
            case 4:
                currentBooking = _b.sent();
                if (!(currentBooking.rows.length === 0)) return [3 /*break*/, 6];
                return [4 /*yield*/, client.query('ROLLBACK')];
            case 5:
                _b.sent();
                return [2 /*return*/, res.status(404).json({ message: 'Booking not found' })];
            case 6:
                booking = currentBooking.rows[0];
                finalStatus = status_1 !== undefined ? status_1 : booking.status;
                finalPaymentStatus = payment_status !== undefined ? payment_status : booking.payment_status;
                finalPaymentIntentId = payment_intent_id !== undefined ? payment_intent_id : booking.payment_intent_id;
                if (!(finalPaymentStatus === 'completed')) return [3 /*break*/, 9];
                paymentIntentIdValue = typeof finalPaymentIntentId === 'string' ? finalPaymentIntentId.trim() : (finalPaymentIntentId || '');
                if (!!paymentIntentIdValue) return [3 /*break*/, 8];
                return [4 /*yield*/, client.query('ROLLBACK')];
            case 7:
                _b.sent();
                return [2 /*return*/, res.status(400).json({
                        message: 'Validation error',
                        error: 'Payment Intent ID is required when marking payment as completed'
                    })];
            case 8:
                // Validate Stripe payment intent ID format (starts with "pi_")
                if (typeof paymentIntentIdValue === 'string' && !paymentIntentIdValue.startsWith('pi_') && !paymentIntentIdValue.startsWith('pi_test_')) {
                    // Note: This is a soft warning, not blocking, as other payment providers might use different formats
                    console.warn("\u26A0\uFE0F Payment Intent ID \"".concat(paymentIntentIdValue, "\" doesn't match expected Stripe format (should start with \"pi_\")"));
                }
                _b.label = 9;
            case 9:
                isConfirming = finalStatus === 'confirmed';
                wasAlreadyConfirmed = booking.status === 'confirmed';
                if (!(isConfirming && !wasAlreadyConfirmed)) return [3 /*break*/, 12];
                return [4 /*yield*/, client.query("SELECT b.id, b.guest_name, bd.start_date, bd.end_date\n         FROM bookings b\n         JOIN blocked_dates bd ON b.id = bd.booking_id\n         WHERE b.id != $1\n           AND b.property_id = $2\n           AND b.status = 'confirmed'\n           AND bd.is_active = true\n           AND (\n             (bd.start_date <= $3::timestamp AND bd.end_date > $3::timestamp) OR\n             (bd.start_date < $4::timestamp AND bd.end_date >= $4::timestamp) OR\n             (bd.start_date >= $3::timestamp AND bd.end_date <= $4::timestamp)\n           )", [parseInt(id), booking.property_id, booking.check_in, booking.check_out])];
            case 10:
                conflictCheck = _b.sent();
                if (!(conflictCheck.rows.length > 0)) return [3 /*break*/, 12];
                return [4 /*yield*/, client.query('ROLLBACK')];
            case 11:
                _b.sent();
                return [2 /*return*/, res.status(409).json({
                        message: 'Date conflict detected',
                        error: "These dates overlap with ".concat(conflictCheck.rows.length, " existing confirmed booking(s)"),
                        conflicts: conflictCheck.rows.map(function (c) { return ({
                            booking_id: c.id,
                            guest_name: c.guest_name,
                            start_date: c.start_date,
                            end_date: c.end_date,
                        }); })
                    })];
            case 12:
                wasConfirmed = booking.status === 'confirmed';
                isCancelling = finalStatus === 'cancelled';
                if (!(isCancelling && wasConfirmed)) return [3 /*break*/, 14];
                // Deactivate blocked dates for cancelled bookings
                return [4 /*yield*/, client.query("UPDATE blocked_dates \n         SET is_active = false, updated_at = NOW()\n         WHERE booking_id = $1", [parseInt(id)])];
            case 13:
                // Deactivate blocked dates for cancelled bookings
                _b.sent();
                console.log("\u26A0\uFE0F Blocked dates deactivated for cancelled booking ".concat(id));
                _b.label = 14;
            case 14:
                updateQuery = "UPDATE bookings \n       SET status = COALESCE($1, status),\n           payment_status = COALESCE($2, payment_status)";
                params = [status_1, payment_status];
                paramIndex = 3;
                // Only update payment_intent_id if it's explicitly provided (not undefined)
                if (payment_intent_id !== undefined) {
                    updateQuery += ", payment_intent_id = $".concat(paramIndex);
                    params.push(payment_intent_id);
                    paramIndex++;
                }
                updateQuery += ", updated_at = CURRENT_TIMESTAMP WHERE id = $".concat(paramIndex, " RETURNING *");
                params.push(parseInt(id));
                return [4 /*yield*/, client.query(updateQuery, params)];
            case 15:
                result = _b.sent();
                if (!isConfirming) return [3 /*break*/, 17];
                return [4 /*yield*/, client.query("INSERT INTO blocked_dates (property_id, start_date, end_date, reason, source, booking_id, created_at, updated_at, is_active)\n         VALUES ($1, $2, $3, 'direct_booking', 'direct_booking', $4, NOW(), NOW(), true)\n         ON CONFLICT (booking_id) DO UPDATE SET\n         property_id = EXCLUDED.property_id,\n         start_date = EXCLUDED.start_date,\n         end_date = EXCLUDED.end_date,\n         updated_at = NOW(),\n         is_active = true", [booking.property_id, booking.check_in, booking.check_out, parseInt(id)])];
            case 16:
                _b.sent();
                console.log("\u2705 Blocked dates created/activated for confirmed booking ".concat(id));
                _b.label = 17;
            case 17: return [4 /*yield*/, client.query('COMMIT')];
            case 18:
                _b.sent();
                res.json(result.rows[0]);
                return [3 /*break*/, 22];
            case 19:
                error_20 = _b.sent();
                return [4 /*yield*/, client.query('ROLLBACK')];
            case 20:
                _b.sent();
                console.error('Error updating booking:', error_20);
                if (error_20.code === '23505') { // Unique violation
                    return [2 /*return*/, res.status(409).json({
                            message: 'Booking conflict',
                            error: 'This booking already has blocked dates associated with it'
                        })];
                }
                res.status(500).json({ message: 'Failed to update booking', error: error_20.message });
                return [3 /*break*/, 22];
            case 21:
                client.release();
                return [7 /*endfinally*/];
            case 22: return [2 /*return*/];
        }
    });
}); });
// Delete/Cancel booking
router.delete('/bookings/:id', verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, result, error_21;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, pool.query('DELETE FROM bookings WHERE id = $1 RETURNING id', [parseInt(id)])];
            case 1:
                result = _a.sent();
                if (result.rows.length === 0) {
                    return [2 /*return*/, res.status(404).json({ message: 'Booking not found' })];
                }
                res.json({ message: 'Booking deleted successfully', id: result.rows[0].id });
                return [3 /*break*/, 3];
            case 2:
                error_21 = _a.sent();
                console.error('Error deleting booking:', error_21);
                res.status(500).json({ message: 'Failed to delete booking', error: error_21.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
export default router;
