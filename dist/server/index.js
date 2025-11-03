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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import 'dotenv/config';
import express from "express";
import { serveStatic, log } from "./utils.js";
import { securityHeaders } from "./middleware/securityHeaders.js";
import { generalRateLimiter } from "./middleware/rateLimiter.js";
// This function creates and configures the Express app.
// It's async to allow for async setup tasks like registering routes.
export function createApp() {
    return __awaiter(this, void 0, void 0, function () {
        var app, isServerless, _a, registerCalendarFeed, syncCalendarFeed, getBlockedDates, exportPropertyICal, e_1, stripeRoutes, e_2, propertiesRoutes, e_3, bookingsRoutes, e_4, adminRoutes, e_5, migrateMapUrlRoutes, e_6, migrateCategorizedImagesRoutes, e_7, migrateImagesStructureRoutes, e_8;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    app = express();
                    // Apply security headers to all routes
                    app.use(securityHeaders);
                    isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
                    if (!isServerless) {
                        app.use('/api', generalRateLimiter);
                    }
                    // Don't parse JSON for Stripe webhook - it needs raw body
                    app.use(function (req, res, next) {
                        if (req.path === '/api/stripe/webhook') {
                            next();
                        }
                        else {
                            express.json()(req, res, next);
                        }
                    });
                    app.use(function (req, res, next) {
                        if (req.path === '/api/stripe/webhook') {
                            next();
                        }
                        else {
                            express.urlencoded({ extended: false })(req, res, next);
                        }
                    });
                    app.use(function (req, res, next) {
                        var start = Date.now();
                        var path = req.path;
                        var capturedJsonResponse = undefined;
                        var originalResJson = res.json;
                        res.json = function (bodyJson) {
                            var args = [];
                            for (var _i = 1; _i < arguments.length; _i++) {
                                args[_i - 1] = arguments[_i];
                            }
                            capturedJsonResponse = bodyJson;
                            return originalResJson.apply(res, __spreadArray([bodyJson], args, true));
                        };
                        res.on("finish", function () {
                            var duration = Date.now() - start;
                            if (path.startsWith("/api")) {
                                var logLine = "".concat(req.method, " ").concat(path, " ").concat(res.statusCode, " in ").concat(duration, "ms");
                                if (capturedJsonResponse) {
                                    logLine += " :: ".concat(JSON.stringify(capturedJsonResponse));
                                }
                                if (logLine.length > 80) {
                                    logLine = logLine.slice(0, 79) + "…";
                                }
                                log(logLine);
                            }
                        });
                        next();
                    });
                    app.use(function (err, _req, res, _next) {
                        var status = err.status || err.statusCode || 500;
                        var message = err.message || "Internal Server Error";
                        res.status(status).json({ message: message });
                    });
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, import('./calendarSync.js')];
                case 2:
                    _a = _b.sent(), registerCalendarFeed = _a.registerCalendarFeed, syncCalendarFeed = _a.syncCalendarFeed, getBlockedDates = _a.getBlockedDates, exportPropertyICal = _a.exportPropertyICal;
                    app.post('/api/calendar-sync', registerCalendarFeed);
                    app.post('/api/calendar-sync/:id/sync', syncCalendarFeed);
                    app.get('/api/properties/:propertyId/blocked-dates', getBlockedDates);
                    app.get('/api/properties/:propertyId/ical', exportPropertyICal);
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _b.sent();
                    console.error('Failed to register calendar sync routes', e_1);
                    return [3 /*break*/, 4];
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, import('./routes/stripe.js')];
                case 5:
                    stripeRoutes = (_b.sent()).default;
                    app.use('/api/stripe', stripeRoutes);
                    return [3 /*break*/, 7];
                case 6:
                    e_2 = _b.sent();
                    console.error('Failed to register stripe routes', e_2);
                    return [3 /*break*/, 7];
                case 7:
                    _b.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, import('./routes/properties.js')];
                case 8:
                    propertiesRoutes = (_b.sent()).default;
                    app.use('/api/properties', propertiesRoutes);
                    return [3 /*break*/, 10];
                case 9:
                    e_3 = _b.sent();
                    console.error('Failed to register properties routes', e_3);
                    return [3 /*break*/, 10];
                case 10:
                    _b.trys.push([10, 12, , 13]);
                    return [4 /*yield*/, import('./routes/bookings.js')];
                case 11:
                    bookingsRoutes = (_b.sent()).default;
                    app.use('/api/bookings', bookingsRoutes);
                    return [3 /*break*/, 13];
                case 12:
                    e_4 = _b.sent();
                    console.error('Failed to register bookings routes', e_4);
                    return [3 /*break*/, 13];
                case 13:
                    _b.trys.push([13, 15, , 16]);
                    return [4 /*yield*/, import('./routes/admin.js')];
                case 14:
                    adminRoutes = (_b.sent()).default;
                    app.use('/api/admin', adminRoutes);
                    return [3 /*break*/, 16];
                case 15:
                    e_5 = _b.sent();
                    console.error('Failed to register admin routes', e_5);
                    return [3 /*break*/, 16];
                case 16:
                    _b.trys.push([16, 18, , 19]);
                    return [4 /*yield*/, import('./routes/migrate-map-url.js')];
                case 17:
                    migrateMapUrlRoutes = (_b.sent()).default;
                    app.use('/api/migrate-map-url', migrateMapUrlRoutes);
                    return [3 /*break*/, 19];
                case 18:
                    e_6 = _b.sent();
                    console.error('Failed to register migrate-map-url routes', e_6);
                    return [3 /*break*/, 19];
                case 19:
                    _b.trys.push([19, 21, , 22]);
                    return [4 /*yield*/, import('./routes/migrate-categorized-images.js')];
                case 20:
                    migrateCategorizedImagesRoutes = (_b.sent()).default;
                    app.use('/api/migrate-categorized-images', migrateCategorizedImagesRoutes);
                    return [3 /*break*/, 22];
                case 21:
                    e_7 = _b.sent();
                    console.error('Failed to register migrate-categorized-images routes', e_7);
                    return [3 /*break*/, 22];
                case 22:
                    _b.trys.push([22, 24, , 25]);
                    return [4 /*yield*/, import('./routes/migrate-images-structure.js')];
                case 23:
                    migrateImagesStructureRoutes = (_b.sent()).default;
                    app.use('/api/migrate-images-structure', migrateImagesStructureRoutes);
                    return [3 /*break*/, 25];
                case 24:
                    e_8 = _b.sent();
                    console.error('Failed to register migrate-images-structure routes', e_8);
                    return [3 /*break*/, 25];
                case 25:
                    // For Vercel deployment, we serve the static frontend files.
                    // Only serve static in production (dist must exist for static serving)
                    if (process.env.NODE_ENV === 'production') {
                        serveStatic(app);
                    }
                    return [2 /*return*/, app];
            }
        });
    });
}
