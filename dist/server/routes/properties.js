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
var router = Router();
// Health check endpoint to diagnose database issues
router.get('/health', function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, e_1, errorMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, pool.query('SELECT NOW()')];
            case 1:
                result = _a.sent();
                res.json({
                    status: 'ok',
                    database: 'connected',
                    timestamp: result.rows[0].now
                });
                return [3 /*break*/, 3];
            case 2:
                e_1 = _a.sent();
                errorMessage = e_1 instanceof Error ? e_1.message : String(e_1);
                res.status(500).json({
                    status: 'error',
                    database: 'disconnected',
                    error: errorMessage,
                    hasDatabaseUrl: !!(process.env.DATABASE_URL || process.env.DB_URL)
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.get('/', function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var rows, properties, ids, imgRows, byProperty, _i, _a, r, pid, cat, _b, properties_1, p, map, categorized, flatImages, _c, categorized_1, entry, e_2, errorMessage;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 4, , 5]);
                return [4 /*yield*/, pool.query('SELECT * FROM properties WHERE is_active = true ORDER BY id')];
            case 1:
                rows = _d.sent();
                properties = rows.rows;
                if (!(properties.length > 0)) return [3 /*break*/, 3];
                ids = properties.map(function (p) { return p.id; });
                return [4 /*yield*/, pool.query('SELECT property_id, category, image_url FROM property_images WHERE property_id = ANY($1) AND (is_active IS NULL OR is_active = true) ORDER BY property_id, sort_order, id', [ids])];
            case 2:
                imgRows = _d.sent();
                byProperty = {};
                for (_i = 0, _a = imgRows.rows; _i < _a.length; _i++) {
                    r = _a[_i];
                    pid = Number(r.property_id);
                    if (!byProperty[pid])
                        byProperty[pid] = {};
                    cat = r.category || 'Gallery';
                    if (!byProperty[pid][cat])
                        byProperty[pid][cat] = [];
                    byProperty[pid][cat].push(r.image_url);
                }
                // Attach categorized_images to each property in the expected format
                for (_b = 0, properties_1 = properties; _b < properties_1.length; _b++) {
                    p = properties_1[_b];
                    map = byProperty[p.id] || {};
                    categorized = Object.entries(map).map(function (_a) {
                        var category = _a[0], images = _a[1];
                        return ({ category: category, images: images });
                    });
                    p.categorized_images = categorized;
                    flatImages = [];
                    for (_c = 0, categorized_1 = categorized; _c < categorized_1.length; _c++) {
                        entry = categorized_1[_c];
                        if (Array.isArray(entry.images))
                            flatImages.push.apply(flatImages, entry.images);
                    }
                    p.images = flatImages;
                }
                _d.label = 3;
            case 3:
                res.json({ properties: properties });
                return [3 /*break*/, 5];
            case 4:
                e_2 = _d.sent();
                console.error('Error fetching properties:', e_2);
                errorMessage = e_2 instanceof Error ? e_2.message : String(e_2);
                res.status(500).json({
                    error: 'failed to load properties',
                    message: errorMessage
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
router.get('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, rows, property, categorizedImages, imageRows, categorized, _i, _a, img, category, e_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                id = Number(req.params.id);
                if (!id)
                    return [2 /*return*/, res.status(400).json({ error: 'invalid id' })];
                return [4 /*yield*/, pool.query('SELECT * FROM properties WHERE id = $1 LIMIT 1', [id])];
            case 1:
                rows = _b.sent();
                if (rows.rows.length === 0)
                    return [2 /*return*/, res.status(404).json({ error: 'not found' })];
                property = rows.rows[0];
                categorizedImages = property.categorized_images;
                if (!(!categorizedImages ||
                    (Array.isArray(categorizedImages) && categorizedImages.length === 0) ||
                    (typeof categorizedImages === 'object' && Object.keys(categorizedImages).length === 0))) return [3 /*break*/, 3];
                return [4 /*yield*/, pool.query('SELECT category, image_url FROM property_images WHERE property_id = $1 AND (is_active IS NULL OR is_active = true) ORDER BY sort_order, id', [id])];
            case 2:
                imageRows = _b.sent();
                categorized = {};
                for (_i = 0, _a = imageRows.rows; _i < _a.length; _i++) {
                    img = _a[_i];
                    category = img.category || 'Gallery';
                    if (!categorized[category]) {
                        categorized[category] = [];
                    }
                    categorized[category].push(img.image_url);
                }
                // Convert to array format expected by CompactGallery
                categorizedImages = Object.entries(categorized).map(function (_a) {
                    var category = _a[0], images = _a[1];
                    return ({
                        category: category,
                        images: images
                    });
                });
                return [3 /*break*/, 4];
            case 3:
                if (typeof categorizedImages === 'object' && !Array.isArray(categorizedImages)) {
                    // Convert object format to array format
                    categorizedImages = Object.entries(categorizedImages).map(function (_a) {
                        var category = _a[0], images = _a[1];
                        return ({
                            category: category,
                            images: Array.isArray(images) ? images : []
                        });
                    });
                }
                else if (Array.isArray(categorizedImages)) {
                    // Ensure each item has the correct structure
                    categorizedImages = categorizedImages.map(function (item) {
                        if (typeof item === 'object' && item !== null) {
                            if (item.category && Array.isArray(item.images)) {
                                return item;
                            }
                            else if (typeof item === 'object') {
                                // Handle case where item might be an object with category as key
                                var entries = Object.entries(item);
                                if (entries.length > 0) {
                                    var _a = entries[0], category = _a[0], images = _a[1];
                                    return {
                                        category: category,
                                        images: Array.isArray(images) ? images : []
                                    };
                                }
                            }
                        }
                        return null;
                    }).filter(function (item) { return item !== null; });
                }
                _b.label = 4;
            case 4:
                // Update property with processed categorized_images
                property.categorized_images = categorizedImages;
                res.json(property);
                return [3 /*break*/, 6];
            case 5:
                e_3 = _b.sent();
                console.error('Error fetching property:', e_3);
                res.status(500).json({ error: 'failed to load property' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
router.get('/:id/images', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, rows, e_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = Number(req.params.id);
                if (!id)
                    return [2 /*return*/, res.status(400).json({ error: 'invalid id' })];
                return [4 /*yield*/, pool.query('SELECT id, category, image_url FROM property_images WHERE property_id = $1 ORDER BY id', [id])];
            case 1:
                rows = _a.sent();
                res.json({ images: rows.rows });
                return [3 /*break*/, 3];
            case 2:
                e_4 = _a.sent();
                res.status(500).json({ error: 'failed to load images' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
export default router;
