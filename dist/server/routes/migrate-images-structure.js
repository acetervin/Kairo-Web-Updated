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
// POST /api/migrate-images-structure/run
router.post('/run', function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                // Ensure property_images table exists
                return [4 /*yield*/, pool.query("\n      CREATE TABLE IF NOT EXISTS property_images (\n        id SERIAL PRIMARY KEY,\n        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,\n        category TEXT,\n        image_url TEXT NOT NULL\n      );\n    ")];
            case 1:
                // Ensure property_images table exists
                _a.sent();
                // Add new columns if missing
                return [4 /*yield*/, pool.query("\n      ALTER TABLE property_images\n      ADD COLUMN IF NOT EXISTS alt_text TEXT,\n      ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false,\n      ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,\n      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,\n      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,\n      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;\n    ")];
            case 2:
                // Add new columns if missing
                _a.sent();
                // Helpful indexes
                return [4 /*yield*/, pool.query("\n      CREATE INDEX IF NOT EXISTS idx_property_images_property ON property_images(property_id);\n      CREATE INDEX IF NOT EXISTS idx_property_images_property_category ON property_images(property_id, category);\n      CREATE INDEX IF NOT EXISTS idx_property_images_primary ON property_images(property_id, is_primary);\n    ")];
            case 3:
                // Helpful indexes
                _a.sent();
                // Drop deprecated JSONB column if present
                return [4 /*yield*/, pool.query("\n      ALTER TABLE properties\n      DROP COLUMN IF EXISTS categorized_images;\n    ")];
            case 4:
                // Drop deprecated JSONB column if present
                _a.sent();
                res.json({ success: true, message: 'property_images structured; properties.categorized_images dropped if existed.' });
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                console.error('Migration error (images structure):', error_1);
                res.status(500).json({ success: false, message: 'Migration failed', error: error_1.message });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
export default router;
