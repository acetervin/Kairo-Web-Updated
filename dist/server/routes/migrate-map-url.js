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
// One-time migration endpoint to add map_url and seed sample data
router.post('/run', function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var client, result, properties, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 9, 10, 11]);
                // Step 1: Add map_url column
                console.log('Adding map_url column...');
                return [4 /*yield*/, client.query("\n      ALTER TABLE properties ADD COLUMN IF NOT EXISTS map_url TEXT;\n    ")];
            case 3:
                _a.sent();
                console.log('✓ map_url column added');
                // Step 2: Seed sample map URLs
                console.log('Seeding sample map URLs...');
                return [4 /*yield*/, client.query("\n      UPDATE properties\n      SET map_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8214748627883!2d36.37298061431382!3d-0.7893148993150658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182aa2d52cffb471%3A0x7b7fa0da403babc2!2sLake%20Naivasha!5e0!3m2!1sen!2ske!4v1685435408351!5m2!1sen!2ske'\n      WHERE id = 247;\n    ")];
            case 4:
                _a.sent();
                return [4 /*yield*/, client.query("\n      UPDATE properties\n      SET map_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.816896338629!2d36.780859314313205!3d-1.2921000990438953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10f5d6931cdd%3A0xc8c5be3c01403b07!2sGeorge%20Padmore%20Rd%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1730288000000!5m2!1sen!2ske'\n      WHERE id = 239;\n    ")];
            case 5:
                _a.sent();
                return [4 /*yield*/, client.query("\n      UPDATE properties\n      SET map_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.816896338629!2d36.780859314313205!3d-1.2921000990438953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10f5d6931cdd%3A0xc8c5be3c01403b07!2sGeorge%20Padmore%20Rd%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1730288000000!5m2!1sen!2ske'\n      WHERE id = 240;\n    ")];
            case 6:
                _a.sent();
                return [4 /*yield*/, client.query("\n      UPDATE properties\n      SET map_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63752.56080982412!2d39.56035407910155!3d-4.287446200000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x184013b265fd0b1f%3A0xbdbbbf4f32f9578d!2sDiani%20Beach!5e0!3m2!1sen!2ske!4v1730288100000!5m2!1sen!2ske'\n      WHERE id = 241;\n    ")];
            case 7:
                _a.sent();
                console.log('✓ Sample map URLs seeded');
                return [4 /*yield*/, client.query("\n      SELECT id, name, map_url FROM properties ORDER BY id LIMIT 5\n    ")];
            case 8:
                result = _a.sent();
                properties = result.rows.map(function (row) { return ({
                    id: row.id,
                    name: row.name,
                    hasMap: !!row.map_url,
                    mapUrlPreview: row.map_url ? row.map_url.substring(0, 60) + '...' : null
                }); });
                res.json({
                    success: true,
                    message: 'Migration completed successfully!',
                    properties: properties
                });
                return [3 /*break*/, 11];
            case 9:
                error_1 = _a.sent();
                console.error('Migration failed:', error_1);
                res.status(500).json({
                    success: false,
                    error: error_1.message
                });
                return [3 /*break*/, 11];
            case 10:
                client.release();
                return [7 /*endfinally*/];
            case 11: return [2 /*return*/];
        }
    });
}); });
export default router;
