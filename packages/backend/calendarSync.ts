import { Request, Response } from 'express';
const { pool } = require('./db');

function parseICalDate(value: string): Date {
  const v = (value || '').trim();
  // Matches: YYYYMMDD or YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ
  const m = v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})Z?)?$/);
  if (m) {
    const year = Number(m[1]);
    const monthIndex = Number(m[2]) - 1; // 0-based
    const day = Number(m[3]);
    if (m[4] !== undefined) {
      const hour = Number(m[4]);
      const minute = Number(m[5]);
      const second = Number(m[6]);
      return new Date(Date.UTC(year, monthIndex, day, hour, minute, second));
    }
    // Date-only interpreted as UTC midnight
    return new Date(Date.UTC(year, monthIndex, day));
  }
  const d = new Date(v);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid iCal date: ${value}`);
  }
  return d;
}

function toDateOnlyStringUTC(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Register a calendar feed for a property
async function registerCalendarFeed(req: any, res: any) {
  try {
    const { propertyId, platform, externalCalendarUrl } = req.body;
    if (!propertyId || !externalCalendarUrl || !platform) {
      return res.status(400).json({ error: 'propertyId, platform and externalCalendarUrl are required' });
    }
    const insertRes = await pool.query(
      `INSERT INTO calendar_sync (property_id, platform, external_calendar_url, is_active, created_at, updated_at)
       VALUES ($1,$2,$3, true, NOW(), NOW()) RETURNING *`,
      [propertyId, platform, externalCalendarUrl]
    );
    res.json({ success: true, record: insertRes.rows[0] });
  } catch (err) {
    console.error('registerCalendarFeed error', err);
    res.status(500).json({ error: 'failed to register calendar feed' });
  }
}

// Trigger a sync for a calendar feed id
async function syncCalendarFeed(req: any, res: any) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'invalid id' });
  const feedRes = await pool.query('SELECT * FROM calendar_sync WHERE id = $1 AND is_active = true LIMIT 1', [id]);
  const feed = feedRes.rows[0];
  if (!feed) return res.status(404).json({ error: 'feed not found' });

  const resp = await fetch(feed.external_calendar_url || feed.externalCalendarUrl);
    if (!resp.ok) throw new Error(`failed to fetch calendar: ${resp.status}`);
    const text = await resp.text();

    // Try to parse with simple regex fallback to get DTSTART/DTEND blocks if node-ical isn't available
    const veventMatches = text.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];
    const events: { start: Date; end: Date; uid: string }[] = [];
    for (const v of veventMatches) {
      const dtstart = (v.match(/DTSTART(?:;[^:]*)?:(.*)/) || [])[1];
      const dtend = (v.match(/DTEND(?:;[^:]*)?:(.*)/) || [])[1] || dtstart;
      const uid = (v.match(/UID:(.*)/) || [])[1] || dtstart;
      if (!dtstart) continue;
      const s = parseICalDate(dtstart);
      const e = parseICalDate(dtend);
      events.push({ start: s, end: e, uid });
    }

    for (const ev of events) {
      const startDate = toDateOnlyStringUTC(ev.start);
      const endDate = toDateOnlyStringUTC(ev.end);
      await pool.query(
        `INSERT INTO blocked_dates (property_id, start_date, end_date, reason, source, external_id, created_at, updated_at, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,NOW(), NOW(), true)`,
        [feed.property_id || feed.propertyId, startDate, endDate, 'external_booking', feed.platform, ev.uid]
      );
    }

    // Update lastSyncAt
    await pool.query('UPDATE calendar_sync SET last_sync_at = NOW(), sync_status = $1, updated_at = NOW() WHERE id = $2', ['success', id]);

    res.json({ success: true, imported: events.length });
  } catch (err: any) {
    console.error('syncCalendarFeed error', err);
    if (req.params.id) {
      try {
        await pool.query('UPDATE calendar_sync SET sync_status = $1, sync_errors = $2, updated_at = NOW() WHERE id = $3', ['failed', String(err), Number(req.params.id)]);
      } catch (updateErr) {
        console.error('Failed to update sync error status:', updateErr);
      }
    }
    res.status(500).json({ error: String(err) });
  }
}

// Sync helper for a feed object (id, property_id, platform, external_calendar_url)
async function syncFeed(feed: any, pool: any) {
  if (!feed || !feed.external_calendar_url) return { imported: 0 };
  const resp = await fetch(feed.external_calendar_url || feed.externalCalendarUrl);
  if (!resp.ok) throw new Error(`failed to fetch calendar: ${resp.status}`);
  const text = await resp.text();

  const veventMatches = text.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];
  const events: { start: string; end: string; uid: string }[] = [];
  for (const v of veventMatches) {
    const dtstart = (v.match(/DTSTART(?:;[^:]*)?:(.*)/) || [])[1];
    const dtend = (v.match(/DTEND(?:;[^:]*)?:(.*)/) || [])[1] || dtstart;
    const uid = (v.match(/UID:(.*)/) || [])[1] || dtstart;
    if (!dtstart) continue;
    const s = parseICalDate(dtstart);
    const e = parseICalDate(dtend);
    // normalize to date-only YYYY-MM-DD (UTC)
    const sDate = toDateOnlyStringUTC(s);
    const eDate = toDateOnlyStringUTC(e);
    events.push({ start: sDate, end: eDate, uid });
  }

  let imported = 0;
  for (const ev of events) {
    // upsert by external_id + property_id: if exists, update start/end, else insert
    const existing = await pool.query('SELECT * FROM blocked_dates WHERE property_id = $1 AND external_id = $2 LIMIT 1', [feed.property_id || feed.propertyId, ev.uid]);
    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      if (row.start_date !== ev.start || row.end_date !== ev.end) {
        await pool.query('UPDATE blocked_dates SET start_date = $1, end_date = $2, reason = $3, source = $4, updated_at = NOW() WHERE id = $5', [ev.start, ev.end, 'external_booking', feed.platform, row.id]);
      }
    } else {
      await pool.query('INSERT INTO blocked_dates (property_id, start_date, end_date, reason, source, external_id, created_at, updated_at, is_active) VALUES ($1,$2,$3,$4,$5,$6,NOW(), NOW(), true)', [feed.property_id || feed.propertyId, ev.start, ev.end, 'external_booking', feed.platform, ev.uid]);
      imported++;
    }
  }

  await pool.query('UPDATE calendar_sync SET last_sync_at = NOW(), sync_status = $1, sync_errors = NULL, updated_at = NOW() WHERE id = $2', ['success', feed.id]);
  return { imported };
}

// Sync all active feeds
async function syncAllFeeds() {
  const feedsRes = await pool.query('SELECT * FROM calendar_sync WHERE is_active = true');
  const feeds = feedsRes.rows || [];
  let totalImported = 0;
  for (const feed of feeds) {
    try {
      const r = await syncFeed(feed, pool);
      totalImported += r.imported || 0;
    } catch (err: any) {
      console.error('syncAllFeeds: failed for feed', feed.id, err);
      await pool.query('UPDATE calendar_sync SET sync_status = $1, sync_errors = $2, updated_at = NOW() WHERE id = $3', ['failed', String(err), feed.id]);
    }
  }
  return { imported: totalImported, feeds: feeds.length };
}

// Endpoint to get blocked dates for a property
async function getBlockedDates(req: any, res: any) {
  try {
    const propertyId = Number(req.params.propertyId);
    if (!propertyId) return res.status(400).json({ error: 'invalid propertyId' });
    const rowsRes = await pool.query('SELECT * FROM blocked_dates WHERE property_id = $1 AND is_active = true', [propertyId]);
    
    // Convert snake_case column names to camelCase for frontend
    const blockedDates = rowsRes.rows.map((row: any) => ({
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
    }));
    
    res.json({ blocked: blockedDates });
  } catch (err) {
    console.error('getBlockedDates error', err);
    res.status(500).json({ error: 'failed to load blocked dates' });
  }
}

// Export an iCal feed for a property's blocked dates
async function exportPropertyICal(req: any, res: any) {
  try {
    const propertyId = Number(req.params.propertyId);
    if (!propertyId) return res.status(400).send('invalid propertyId');
    const rowsRes = await pool.query(
      'SELECT start_date, end_date, reason, source, id FROM blocked_dates WHERE property_id = $1 AND is_active = true ORDER BY start_date',
      [propertyId]
    );

    const lines: string[] = [];
    lines.push('BEGIN:VCALENDAR');
    lines.push('VERSION:2.0');
    lines.push('PRODID:-//boo-back//calendar//EN');

    for (const row of rowsRes.rows) {
      const uid = `blocked-${row.id}@boo-back`;
      const dtStart = new Date(row.start_date);
      const dtEnd = new Date(row.end_date);
      const toDateStr = (d: Date) => {
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        return `${y}${m}${day}`;
      };
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${toDateStr(new Date())}T000000Z`);
      lines.push(`DTSTART;VALUE=DATE:${toDateStr(dtStart)}`);
      lines.push(`DTEND;VALUE=DATE:${toDateStr(dtEnd)}`);
      lines.push(`SUMMARY:${row.reason || 'Blocked'}`);
      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');
    const ics = lines.join('\r\n');
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="property-${propertyId}.ics"`);
    res.send(ics);
  } catch (err) {
    console.error('exportPropertyICal error', err);
    res.status(500).send('failed to export calendar');
  }
}

module.exports = { registerCalendarFeed, syncCalendarFeed, getBlockedDates, exportPropertyICal, syncAllFeeds };
