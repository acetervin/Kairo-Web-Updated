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
import { pool } from './db.js';
// Register a calendar feed for a property
export function registerCalendarFeed(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, propertyId, platform, externalCalendarUrl, insertRes, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    _a = req.body, propertyId = _a.propertyId, platform = _a.platform, externalCalendarUrl = _a.externalCalendarUrl;
                    if (!propertyId || !externalCalendarUrl || !platform) {
                        return [2 /*return*/, res.status(400).json({ error: 'propertyId, platform and externalCalendarUrl are required' })];
                    }
                    return [4 /*yield*/, pool.query("INSERT INTO calendar_sync (property_id, platform, external_calendar_url, is_active, created_at, updated_at)\n       VALUES ($1,$2,$3, true, NOW(), NOW()) RETURNING *", [propertyId, platform, externalCalendarUrl])];
                case 1:
                    insertRes = _b.sent();
                    res.json({ success: true, record: insertRes.rows[0] });
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _b.sent();
                    console.error('registerCalendarFeed error', err_1);
                    res.status(500).json({ error: 'failed to register calendar feed' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Trigger a sync for a calendar feed id
export function syncCalendarFeed(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var id, feedRes, feed, resp, text, veventMatches, events, _i, veventMatches_1, v, dtstart, dtend, uid, s, e, _a, events_1, ev, err_2, updateErr_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 9, , 14]);
                    id = Number(req.params.id);
                    if (!id)
                        return [2 /*return*/, res.status(400).json({ error: 'invalid id' })];
                    return [4 /*yield*/, pool.query('SELECT * FROM calendar_sync WHERE id = $1 AND is_active = true LIMIT 1', [id])];
                case 1:
                    feedRes = _b.sent();
                    feed = feedRes.rows[0];
                    if (!feed)
                        return [2 /*return*/, res.status(404).json({ error: 'feed not found' })];
                    return [4 /*yield*/, fetch(feed.external_calendar_url || feed.externalCalendarUrl)];
                case 2:
                    resp = _b.sent();
                    if (!resp.ok)
                        throw new Error("failed to fetch calendar: ".concat(resp.status));
                    return [4 /*yield*/, resp.text()];
                case 3:
                    text = _b.sent();
                    veventMatches = text.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];
                    events = [];
                    for (_i = 0, veventMatches_1 = veventMatches; _i < veventMatches_1.length; _i++) {
                        v = veventMatches_1[_i];
                        dtstart = (v.match(/DTSTART(?:;[^:]*)?:(.*)/) || [])[1];
                        dtend = (v.match(/DTEND(?:;[^:]*)?:(.*)/) || [])[1] || dtstart;
                        uid = (v.match(/UID:(.*)/) || [])[1] || dtstart;
                        if (!dtstart)
                            continue;
                        s = new Date(dtstart);
                        e = new Date(dtend);
                        events.push({ start: s, end: e, uid: uid });
                    }
                    _a = 0, events_1 = events;
                    _b.label = 4;
                case 4:
                    if (!(_a < events_1.length)) return [3 /*break*/, 7];
                    ev = events_1[_a];
                    return [4 /*yield*/, pool.query("INSERT INTO blocked_dates (property_id, start_date, end_date, reason, source, external_id, created_at, updated_at, is_active)\n         VALUES ($1,$2,$3,$4,$5,$6,NOW(), NOW(), true)", [feed.property_id || feed.propertyId, ev.start.toISOString(), ev.end.toISOString(), 'external_booking', feed.platform, ev.uid])];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6:
                    _a++;
                    return [3 /*break*/, 4];
                case 7: 
                // Update lastSyncAt
                return [4 /*yield*/, pool.query('UPDATE calendar_sync SET last_sync_at = NOW(), sync_status = $1, updated_at = NOW() WHERE id = $2', ['success', id])];
                case 8:
                    // Update lastSyncAt
                    _b.sent();
                    res.json({ success: true, imported: events.length });
                    return [3 /*break*/, 14];
                case 9:
                    err_2 = _b.sent();
                    console.error('syncCalendarFeed error', err_2);
                    if (!req.params.id) return [3 /*break*/, 13];
                    _b.label = 10;
                case 10:
                    _b.trys.push([10, 12, , 13]);
                    return [4 /*yield*/, pool.query('UPDATE calendar_sync SET sync_status = $1, sync_errors = $2, updated_at = NOW() WHERE id = $3', ['failed', String(err_2), Number(req.params.id)])];
                case 11:
                    _b.sent();
                    return [3 /*break*/, 13];
                case 12:
                    updateErr_1 = _b.sent();
                    console.error('Failed to update sync error status:', updateErr_1);
                    return [3 /*break*/, 13];
                case 13:
                    res.status(500).json({ error: String(err_2) });
                    return [3 /*break*/, 14];
                case 14: return [2 /*return*/];
            }
        });
    });
}
// Sync helper for a feed object (id, property_id, platform, external_calendar_url)
function syncFeed(feed, pool) {
    return __awaiter(this, void 0, void 0, function () {
        var resp, text, veventMatches, events, _i, veventMatches_2, v, dtstart, dtend, uid, s, e, sDate, eDate, imported, _a, events_2, ev, existing, row;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!feed || !feed.external_calendar_url)
                        return [2 /*return*/, { imported: 0 }];
                    return [4 /*yield*/, fetch(feed.external_calendar_url || feed.externalCalendarUrl)];
                case 1:
                    resp = _b.sent();
                    if (!resp.ok)
                        throw new Error("failed to fetch calendar: ".concat(resp.status));
                    return [4 /*yield*/, resp.text()];
                case 2:
                    text = _b.sent();
                    veventMatches = text.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];
                    events = [];
                    for (_i = 0, veventMatches_2 = veventMatches; _i < veventMatches_2.length; _i++) {
                        v = veventMatches_2[_i];
                        dtstart = (v.match(/DTSTART(?:;[^:]*)?:(.*)/) || [])[1];
                        dtend = (v.match(/DTEND(?:;[^:]*)?:(.*)/) || [])[1] || dtstart;
                        uid = (v.match(/UID:(.*)/) || [])[1] || dtstart;
                        if (!dtstart)
                            continue;
                        s = new Date(dtstart);
                        e = new Date(dtend);
                        sDate = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate())).toISOString().slice(0, 10);
                        eDate = new Date(Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate())).toISOString().slice(0, 10);
                        events.push({ start: sDate, end: eDate, uid: uid });
                    }
                    imported = 0;
                    _a = 0, events_2 = events;
                    _b.label = 3;
                case 3:
                    if (!(_a < events_2.length)) return [3 /*break*/, 10];
                    ev = events_2[_a];
                    return [4 /*yield*/, pool.query('SELECT * FROM blocked_dates WHERE property_id = $1 AND external_id = $2 LIMIT 1', [feed.property_id || feed.propertyId, ev.uid])];
                case 4:
                    existing = _b.sent();
                    if (!(existing.rows.length > 0)) return [3 /*break*/, 7];
                    row = existing.rows[0];
                    if (!(row.start_date !== ev.start || row.end_date !== ev.end)) return [3 /*break*/, 6];
                    return [4 /*yield*/, pool.query('UPDATE blocked_dates SET start_date = $1, end_date = $2, reason = $3, source = $4, updated_at = NOW() WHERE id = $5', [ev.start, ev.end, 'external_booking', feed.platform, row.id])];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6: return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, pool.query('INSERT INTO blocked_dates (property_id, start_date, end_date, reason, source, external_id, created_at, updated_at, is_active) VALUES ($1,$2,$3,$4,$5,$6,NOW(), NOW(), true)', [feed.property_id || feed.propertyId, ev.start, ev.end, 'external_booking', feed.platform, ev.uid])];
                case 8:
                    _b.sent();
                    imported++;
                    _b.label = 9;
                case 9:
                    _a++;
                    return [3 /*break*/, 3];
                case 10: return [4 /*yield*/, pool.query('UPDATE calendar_sync SET last_sync_at = NOW(), sync_status = $1, sync_errors = NULL, updated_at = NOW() WHERE id = $2', ['success', feed.id])];
                case 11:
                    _b.sent();
                    return [2 /*return*/, { imported: imported }];
            }
        });
    });
}
// Sync all active feeds
export function syncAllFeeds() {
    return __awaiter(this, void 0, void 0, function () {
        var feedsRes, feeds, totalImported, _i, feeds_1, feed, r, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.query('SELECT * FROM calendar_sync WHERE is_active = true')];
                case 1:
                    feedsRes = _a.sent();
                    feeds = feedsRes.rows || [];
                    totalImported = 0;
                    _i = 0, feeds_1 = feeds;
                    _a.label = 2;
                case 2:
                    if (!(_i < feeds_1.length)) return [3 /*break*/, 8];
                    feed = feeds_1[_i];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 7]);
                    return [4 /*yield*/, syncFeed(feed, pool)];
                case 4:
                    r = _a.sent();
                    totalImported += r.imported || 0;
                    return [3 /*break*/, 7];
                case 5:
                    err_3 = _a.sent();
                    console.error('syncAllFeeds: failed for feed', feed.id, err_3);
                    return [4 /*yield*/, pool.query('UPDATE calendar_sync SET sync_status = $1, sync_errors = $2, updated_at = NOW() WHERE id = $3', ['failed', String(err_3), feed.id])];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8: return [2 /*return*/, { imported: totalImported, feeds: feeds.length }];
            }
        });
    });
}
// Endpoint to get blocked dates for a property
export function getBlockedDates(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var propertyId, rowsRes, blockedDates, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    propertyId = Number(req.params.propertyId);
                    if (!propertyId)
                        return [2 /*return*/, res.status(400).json({ error: 'invalid propertyId' })];
                    return [4 /*yield*/, pool.query('SELECT * FROM blocked_dates WHERE property_id = $1 AND is_active = true', [propertyId])];
                case 1:
                    rowsRes = _a.sent();
                    blockedDates = rowsRes.rows.map(function (row) { return ({
                        id: row.id,
                        propertyId: row.property_id,
                        startDate: row.start_date,
                        endDate: row.end_date,
                        reason: row.reason,
                        source: row.source,
                        bookingId: row.booking_id,
                        externalId: row.external_id,
                        createdAt: row.created_at,
                        updatedAt: row.updated_at,
                        isActive: row.is_active,
                    }); });
                    res.json({ blocked: blockedDates });
                    return [3 /*break*/, 3];
                case 2:
                    err_4 = _a.sent();
                    console.error('getBlockedDates error', err_4);
                    res.status(500).json({ error: 'failed to load blocked dates' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Export an iCal feed for a property's blocked dates
export function exportPropertyICal(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var propertyId, rowsRes, lines, _i, _a, row, uid, dtStart, dtEnd, toDateStr, ics, err_5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    propertyId = Number(req.params.propertyId);
                    if (!propertyId)
                        return [2 /*return*/, res.status(400).send('invalid propertyId')];
                    return [4 /*yield*/, pool.query('SELECT start_date, end_date, reason, source, id FROM blocked_dates WHERE property_id = $1 AND is_active = true ORDER BY start_date', [propertyId])];
                case 1:
                    rowsRes = _b.sent();
                    lines = [];
                    lines.push('BEGIN:VCALENDAR');
                    lines.push('VERSION:2.0');
                    lines.push('PRODID:-//boo-back//calendar//EN');
                    for (_i = 0, _a = rowsRes.rows; _i < _a.length; _i++) {
                        row = _a[_i];
                        uid = "blocked-".concat(row.id, "@boo-back");
                        dtStart = new Date(row.start_date);
                        dtEnd = new Date(row.end_date);
                        toDateStr = function (d) {
                            var y = d.getUTCFullYear();
                            var m = String(d.getUTCMonth() + 1).padStart(2, '0');
                            var day = String(d.getUTCDate()).padStart(2, '0');
                            return "".concat(y).concat(m).concat(day);
                        };
                        lines.push('BEGIN:VEVENT');
                        lines.push("UID:".concat(uid));
                        lines.push("DTSTAMP:".concat(toDateStr(new Date()), "T000000Z"));
                        lines.push("DTSTART;VALUE=DATE:".concat(toDateStr(dtStart)));
                        lines.push("DTEND;VALUE=DATE:".concat(toDateStr(dtEnd)));
                        lines.push("SUMMARY:".concat(row.reason || 'Blocked'));
                        lines.push('END:VEVENT');
                    }
                    lines.push('END:VCALENDAR');
                    ics = lines.join('\r\n');
                    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
                    res.setHeader('Content-Disposition', "attachment; filename=\"property-".concat(propertyId, ".ics\""));
                    res.send(ics);
                    return [3 /*break*/, 3];
                case 2:
                    err_5 = _b.sent();
                    console.error('exportPropertyICal error', err_5);
                    res.status(500).send('failed to export calendar');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
