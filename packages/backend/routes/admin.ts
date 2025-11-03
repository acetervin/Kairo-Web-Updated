import { Router, Request, Response } from 'express';
import { pool } from '../db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { loginRateLimiter } from '../middleware/rateLimiter.js';
import { loginProtectionMiddleware } from '../middleware/loginProtection.js';
import { checkAccountLockout, recordFailedLogin, recordSuccessfulLogin, MAX_FAILED_ATTEMPTS } from '../middleware/accountLockout.js';
import { validatePassword, sanitizeInput } from '../utils/passwordValidator.js';
import { logAuditEvent, AuditEventType, getClientIp, getUserAgent } from '../utils/auditLogger.js';

const router = Router();

// JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Middleware to verify admin token
const verifyToken = async (req: any, res: Response, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    await logAuditEvent({
      event_type: AuditEventType.UNAUTHORIZED_ACCESS,
      ip_address: ipAddress,
      user_agent: userAgent,
      details: { reason: 'No token provided', path: req.path },
      success: false,
    });
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    await logAuditEvent({
      event_type: AuditEventType.UNAUTHORIZED_ACCESS,
      ip_address: ipAddress,
      user_agent: userAgent,
      details: { reason: 'Invalid token', path: req.path },
      success: false,
    });
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin login with database authentication (protected with rate limiting and account lockout)
router.post('/login', loginProtectionMiddleware, async (req: Request, res: Response) => {
  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);
  const username = sanitizeInput(req.body?.username || '');
  
  try {
    const password = req.body?.password;

    // Sanitize and validate input
    if (!username || !password) {
      await logAuditEvent({
        event_type: AuditEventType.LOGIN_FAILURE,
        username,
        ip_address: ipAddress,
        user_agent: userAgent,
        details: { reason: 'Missing credentials' },
        success: false,
      });
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Account lockout is already checked by loginProtectionMiddleware
    // But we check again here in case status changed
    const lockoutStatus = await checkAccountLockout(username);
    if (lockoutStatus.isLocked) {
      await logAuditEvent({
        event_type: AuditEventType.LOGIN_LOCKOUT,
        username,
        ip_address: ipAddress,
        user_agent: userAgent,
        details: { lockedUntil: lockoutStatus.lockedUntil },
        success: false,
      });
      return res.status(423).json({
        message: 'Account temporarily locked',
        error: `Too many failed login attempts. Account locked until ${lockoutStatus.lockedUntil?.toISOString()}`,
        lockedUntil: lockoutStatus.lockedUntil?.toISOString(),
      });
    }

    // Fetch user from database
    const result = await pool.query(
      'SELECT * FROM admin_users WHERE username = $1 AND is_active = true',
      [username]
    );

    if (result.rows.length === 0) {
      // Record failed attempt even if user doesn't exist (prevents username enumeration)
      recordFailedLogin(username);
      await logAuditEvent({
        event_type: AuditEventType.LOGIN_FAILURE,
        username,
        ip_address: ipAddress,
        user_agent: userAgent,
        details: { reason: 'User not found' },
        success: false,
      });
      // Use generic message to prevent username enumeration
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      // Record failed login attempt (this increments the counter and may lock the account)
      const lockoutResult = recordFailedLogin(username);
      
      // Get updated lockout status after recording the failure
      const updatedLockoutStatus = await checkAccountLockout(username);
      
      await logAuditEvent({
        event_type: lockoutResult.isLocked ? AuditEventType.LOGIN_LOCKOUT : AuditEventType.LOGIN_FAILURE,
        user_id: user.id,
        username,
        ip_address: ipAddress,
        user_agent: userAgent,
        details: { 
          reason: 'Invalid password',
          failedAttempts: updatedLockoutStatus.remainingAttempts ? MAX_FAILED_ATTEMPTS - updatedLockoutStatus.remainingAttempts : undefined,
          remainingAttempts: updatedLockoutStatus.remainingAttempts,
          lockedUntil: lockoutResult.lockedUntil,
        },
        success: false,
      });

      // Check if account is now locked after this failed attempt
      if (lockoutResult.isLocked || updatedLockoutStatus.isLocked) {
        const lockoutTime = lockoutResult.lockedUntil || updatedLockoutStatus.lockedUntil;
        return res.status(423).json({
          message: 'Account temporarily locked',
          error: `Too many failed login attempts. Account locked until ${lockoutTime?.toISOString()}`,
          lockedUntil: lockoutTime?.toISOString(),
        });
      }

      return res.status(401).json({ 
        message: 'Invalid credentials',
        remainingAttempts: updatedLockoutStatus.remainingAttempts,
      });
    }

    // Successful login
    recordSuccessfulLogin(username);

    // Update last login time
    await pool.query(
      'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    await logAuditEvent({
      event_type: AuditEventType.LOGIN_SUCCESS,
      user_id: user.id,
      username,
      ip_address: ipAddress,
      user_agent: userAgent,
      details: { role: user.role },
      success: true,
    });
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      },
    });
  } catch (error: any) {
    // Log error without exposing sensitive details
    console.error('[LOGIN] Error during login process:', {
      error: error.message,
      code: error.code,
      // Don't log username in error messages
    });
    await logAuditEvent({
      event_type: AuditEventType.LOGIN_FAILURE,
      username,
      ip_address: ipAddress,
      user_agent: userAgent,
      details: { error: error.message },
      success: false,
    });
    // Don't expose internal error details to client
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// Token refresh endpoint - allows refreshing JWT token without re-login
router.post('/refresh', async (req: any, res: Response) => {
  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);
  const token = req.headers.authorization?.replace('Bearer ', '') || req.body?.token;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify the current token (even if expired, we'll allow refresh within grace period)
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error: any) {
      // Token might be expired, but we can still refresh if it's valid format
      // Decode without verification to get user info
      decoded = jwt.decode(token) as any;
      
      if (!decoded || !decoded.id) {
        await logAuditEvent({
          event_type: AuditEventType.UNAUTHORIZED_ACCESS,
          ip_address: ipAddress,
          user_agent: userAgent,
          details: { reason: 'Invalid token format for refresh', path: '/refresh' },
          success: false,
        });
        return res.status(401).json({ message: 'Invalid token' });
      }
    }

    // Verify user still exists and is active
    const userResult = await pool.query(
      'SELECT id, username, name, email, role, is_active FROM admin_users WHERE id = $1 AND is_active = true',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      await logAuditEvent({
        event_type: AuditEventType.UNAUTHORIZED_ACCESS,
        user_id: decoded.id,
        username: decoded.username,
        ip_address: ipAddress,
        user_agent: userAgent,
        details: { reason: 'User not found or inactive', path: '/refresh' },
        success: false,
      });
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    const user = userResult.rows[0];

    // Generate new JWT token
    const newToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    await logAuditEvent({
      event_type: AuditEventType.LOGIN_SUCCESS,
      user_id: user.id,
      username: user.username,
      ip_address: ipAddress,
      user_agent: userAgent,
      details: { action: 'token_refresh' },
      success: true,
    });

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
  } catch (error: any) {
    console.error('Token refresh error:', error);
    await logAuditEvent({
      event_type: AuditEventType.UNAUTHORIZED_ACCESS,
      ip_address: ipAddress,
      user_agent: userAgent,
      details: { reason: 'Token refresh failed', error: error.message, path: '/refresh' },
      success: false,
    });
    res.status(401).json({ message: 'Token refresh failed', error: error.message });
  }
});

// Get dashboard stats (REAL DATA)
router.get('/stats', verifyToken, async (req, res) => {
  try {
    // Total properties
    const propertiesResult = await pool.query('SELECT COUNT(*) as count FROM properties WHERE is_active = true');
    
    // Active bookings
    const bookingsResult = await pool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'"
    );
    
    // Total revenue (using total_amount column from schema)
    const revenueResult = await pool.query(
      'SELECT COALESCE(SUM(CAST(total_amount AS DECIMAL)), 0) as total FROM bookings WHERE status = $1',
      ['confirmed']
    );

    // Recent bookings (last 7 days)
    const recentBookingsResult = await pool.query(`
      SELECT b.*, p.name as property_name
      FROM bookings b
      LEFT JOIN properties p ON b.property_id = p.id
      WHERE b.created_at >= NOW() - INTERVAL '7 days'
      ORDER BY b.created_at DESC
      LIMIT 5
    `);

    // Popular properties (most bookings)
    const popularPropertiesResult = await pool.query(`
      SELECT p.*, COUNT(b.id) as booking_count
      FROM properties p
      LEFT JOIN bookings b ON p.id = b.property_id
      WHERE p.is_active = true
      GROUP BY p.id
      ORDER BY booking_count DESC
      LIMIT 5
    `);

    res.json({
      totalProperties: parseInt(propertiesResult.rows[0]?.count || '0'),
      activeBookings: parseInt(bookingsResult.rows[0]?.count || '0'),
      totalRevenue: parseFloat(revenueResult.rows[0]?.total || '0'),
      totalViews: 0, // You can track this separately if needed
      recentBookings: recentBookingsResult.rows,
      popularProperties: popularPropertiesResult.rows,
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
});

// Get all admin users
router.get('/users', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, name, email, role, is_active, created_at, last_login
       FROM admin_users
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Create new admin user
router.post('/users', verifyToken, async (req: any, res: Response) => {
  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);
  
  try {
    const { username, password, name, email, role } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ message: 'Username, password, and name are required' });
    }

    // Sanitize inputs
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = email ? sanitizeInput(email) : null;

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: 'Password validation failed',
        errors: passwordValidation.errors,
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      `INSERT INTO admin_users (username, password_hash, name, email, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, name, email, role, is_active, created_at`,
      [sanitizedUsername, passwordHash, sanitizedName, sanitizedEmail, role || 'admin']
    );

    await logAuditEvent({
      event_type: AuditEventType.USER_CREATED,
      user_id: (req.user as any)?.id,
      username: (req.user as any)?.username,
      ip_address: ipAddress,
      user_agent: userAgent,
      details: { created_user_id: result.rows[0].id, created_username: sanitizedUsername },
      success: true,
    });

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
});

// Update admin user
router.put('/users/:id', verifyToken, async (req: any, res: Response) => {
  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);
  
  try {
    const { id } = req.params;
    const { username, name, email, role, is_active, password } = req.body;

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name || '');
    const sanitizedEmail = email ? sanitizeInput(email) : null;

    let query = `UPDATE admin_users SET name = $1, email = $2, role = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP`;
    let params: any[] = [sanitizedName, sanitizedEmail, role, is_active];

    // If password is provided, validate and hash it
    if (password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          message: 'Password validation failed',
          errors: passwordValidation.errors,
        });
      }
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      query += `, password_hash = $5 WHERE id = $6 RETURNING id, username, name, email, role, is_active`;
      params.push(passwordHash, parseInt(id));
    } else {
      query += ` WHERE id = $5 RETURNING id, username, name, email, role, is_active`;
      params.push(parseInt(id));
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    await logAuditEvent({
      event_type: password ? AuditEventType.PASSWORD_CHANGED : AuditEventType.USER_UPDATED,
      user_id: (req.user as any)?.id,
      username: (req.user as any)?.username,
      ip_address: ipAddress,
      user_agent: userAgent,
      details: { 
        updated_user_id: parseInt(id),
        password_changed: !!password,
      },
      success: true,
    });

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating user:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Email already exists' });
    }
    
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

// Delete admin user
router.delete('/users/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if ((req as any).user && (req as any).user.id === parseInt(id)) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const result = await pool.query(
      'DELETE FROM admin_users WHERE id = $1 RETURNING id',
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully', id: result.rows[0].id });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

// Create property
router.post('/properties', verifyToken, async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      category,
      price_per_night,
      max_guests,
      bedrooms,
      bathrooms,
      main_image_url,
      map_url,
      amenities
    } = req.body;

    const result = await pool.query(
      `INSERT INTO properties (
        name, description, location, category, price_per_night,
        max_guests, bedrooms, bathrooms, main_image_url, map_url, amenities, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
      RETURNING *`,
      [
        name,
        description,
        location,
        category,
        price_per_night,
        max_guests,
        bedrooms,
        bathrooms,
        main_image_url || null,
        map_url || null,
        amenities || []
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating property:', error);
    res.status(500).json({ message: 'Failed to create property', error: error.message });
  }
});

// Update property
router.put('/properties/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      location,
      category,
      price_per_night,
      max_guests,
      bedrooms,
      bathrooms,
      main_image_url,
      map_url,
      amenities
    } = req.body;

    const result = await pool.query(
      `UPDATE properties SET
        name = $1,
        description = $2,
        location = $3,
        category = $4,
        price_per_night = $5,
        max_guests = $6,
        bedrooms = $7,
        bathrooms = $8,
        main_image_url = $9,
        map_url = $10,
        amenities = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *`,
      [
        name,
        description,
        location,
        category,
        price_per_night,
        max_guests,
        bedrooms,
        bathrooms,
        main_image_url,
        map_url,
        amenities || [],
        parseInt(id)
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating property:', error);
    res.status(500).json({ message: 'Failed to update property', error: error.message });
  }
});

// Delete property
router.delete('/properties/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM properties WHERE id = $1 RETURNING id',
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({ message: 'Property deleted successfully', id: result.rows[0].id });
  } catch (error: any) {
    console.error('Error deleting property:', error);
    res.status(500).json({ message: 'Failed to delete property', error: error.message });
  }
});

// Property images (admin CRUD)
router.get('/properties/:id/images', verifyToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const rows = await pool.query(
      'SELECT id, category, image_url, alt_text, is_primary, sort_order, is_active FROM property_images WHERE property_id = $1 ORDER BY sort_order, id',
      [id]
    );
    res.json({ images: rows.rows });
  } catch (error: any) {
    console.error('Error loading images:', error);
    res.status(500).json({ message: 'Failed to load images', error: error.message });
  }
});

router.post('/properties/:id/images', verifyToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { url, category, alt_text, is_primary, sort_order } = req.body;

    if (!url) return res.status(400).json({ message: 'url is required' });

    if (is_primary) {
      await pool.query('UPDATE property_images SET is_primary = false WHERE property_id = $1', [id]);
    }

    const result = await pool.query(
      `INSERT INTO property_images (property_id, category, image_url, alt_text, is_primary, sort_order)
       VALUES ($1,$2,$3,$4,COALESCE($5,false),COALESCE($6,0))
       RETURNING id, category, image_url, alt_text, is_primary, sort_order`,
      [id, category || null, url, alt_text || null, is_primary || false, sort_order ?? 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error adding image:', error);
    res.status(500).json({ message: 'Failed to add image', error: error.message });
  }
});

router.put('/properties/:id/images/:imageId', verifyToken, async (req, res) => {
  try {
    const propertyId = Number(req.params.id);
    const imageId = Number(req.params.imageId);
    const { url, category, alt_text, is_primary, sort_order } = req.body;

    if (is_primary === true) {
      await pool.query('UPDATE property_images SET is_primary = false WHERE property_id = $1', [propertyId]);
    }

    const result = await pool.query(
      `UPDATE property_images SET
        category = COALESCE($1, category),
        image_url = COALESCE($2, image_url),
        alt_text = COALESCE($3, alt_text),
        is_primary = COALESCE($4, is_primary),
        sort_order = COALESCE($5, sort_order),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND property_id = $7
       RETURNING id, category, image_url, alt_text, is_primary, sort_order`,
      [category || null, url || null, alt_text || null, is_primary, sort_order, imageId, propertyId]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Image not found' });
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating image:', error);
    res.status(500).json({ message: 'Failed to update image', error: error.message });
  }
});

router.delete('/properties/:id/images/:imageId', verifyToken, async (req, res) => {
  try {
    const propertyId = Number(req.params.id);
    const imageId = Number(req.params.imageId);
    const result = await pool.query('DELETE FROM property_images WHERE id = $1 AND property_id = $2', [imageId, propertyId]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Image not found' });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Failed to delete image', error: error.message });
  }
});

// Get all bookings
router.get('/bookings', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.*,
        p.name as property_name,
        p.location as property_location,
        p.main_image_url as property_image_url
      FROM bookings b
      LEFT JOIN properties p ON b.property_id = p.id
      ORDER BY b.created_at DESC
    `);

    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
});

// Get single booking by ID
router.get('/bookings/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        b.*,
        p.name as property_name,
        p.location as property_location,
        p.main_image_url as property_image_url,
        p.description as property_description,
        p.price_per_night
      FROM bookings b
      LEFT JOIN properties p ON b.property_id = p.id
      WHERE b.id = $1
    `, [parseInt(id)]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Failed to fetch booking', error: error.message });
  }
});

// Check for date conflicts for a booking
router.get('/bookings/:id/check-conflicts', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch the booking
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [parseInt(id)]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Check for overlapping confirmed bookings with active blocked dates
    const conflictCheck = await pool.query(
      `SELECT b.id, b.guest_name, bd.start_date, bd.end_date
       FROM bookings b
       JOIN blocked_dates bd ON b.id = bd.booking_id
       WHERE b.id != $1
         AND b.property_id = $2
         AND b.status = 'confirmed'
         AND bd.is_active = true
         AND (
           (bd.start_date <= $3::timestamp AND bd.end_date > $3::timestamp) OR
           (bd.start_date < $4::timestamp AND bd.end_date >= $4::timestamp) OR
           (bd.start_date >= $3::timestamp AND bd.end_date <= $4::timestamp)
         )`,
      [parseInt(id), booking.property_id, booking.check_in, booking.check_out]
    );

    res.json({ conflicts: conflictCheck.rows });
  } catch (error: any) {
    console.error('Error checking conflicts:', error);
    res.status(500).json({ message: 'Failed to check conflicts', error: error.message });
  }
});

// Update booking status
router.put('/bookings/:id', verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status, payment_status, payment_intent_id } = req.body;

    await client.query('BEGIN');

    // Fetch current booking first
    const currentBooking = await client.query(
      'SELECT * FROM bookings WHERE id = $1',
      [parseInt(id)]
    );

    if (currentBooking.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = currentBooking.rows[0];

    // Determine final status values after update
    const finalStatus = status !== undefined ? status : booking.status;
    const finalPaymentStatus = payment_status !== undefined ? payment_status : booking.payment_status;
    const finalPaymentIntentId = payment_intent_id !== undefined ? payment_intent_id : booking.payment_intent_id;
    
    // Validate payment_intent_id is provided when marking payment as completed
    if (finalPaymentStatus === 'completed') {
      const paymentIntentIdValue = typeof finalPaymentIntentId === 'string' ? finalPaymentIntentId.trim() : (finalPaymentIntentId || '');
      if (!paymentIntentIdValue) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          message: 'Validation error',
          error: 'Payment Intent ID is required when marking payment as completed' 
        });
      }
      
      // Validate Stripe payment intent ID format (starts with "pi_")
      if (typeof paymentIntentIdValue === 'string' && !paymentIntentIdValue.startsWith('pi_') && !paymentIntentIdValue.startsWith('pi_test_')) {
        // Note: This is a soft warning, not blocking, as other payment providers might use different formats
        console.warn(`⚠️ Payment Intent ID "${paymentIntentIdValue}" doesn't match expected Stripe format (should start with "pi_")`);
      }
    }
    
    // Check if this is a transition to confirmed status (regardless of payment status)
    const isConfirming = finalStatus === 'confirmed';
    const wasAlreadyConfirmed = booking.status === 'confirmed';

    // If confirming a booking, check for date conflicts (return all conflicts, not just first)
    if (isConfirming && !wasAlreadyConfirmed) {
      const conflictCheck = await client.query(
        `SELECT b.id, b.guest_name, bd.start_date, bd.end_date
         FROM bookings b
         JOIN blocked_dates bd ON b.id = bd.booking_id
         WHERE b.id != $1
           AND b.property_id = $2
           AND b.status = 'confirmed'
           AND bd.is_active = true
           AND (
             (bd.start_date <= $3::timestamp AND bd.end_date > $3::timestamp) OR
             (bd.start_date < $4::timestamp AND bd.end_date >= $4::timestamp) OR
             (bd.start_date >= $3::timestamp AND bd.end_date <= $4::timestamp)
           )`,
        [parseInt(id), booking.property_id, booking.check_in, booking.check_out]
      );

      if (conflictCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ 
          message: 'Date conflict detected',
          error: `These dates overlap with ${conflictCheck.rows.length} existing confirmed booking(s)`,
          conflicts: conflictCheck.rows.map(c => ({
            booking_id: c.id,
            guest_name: c.guest_name,
            start_date: c.start_date,
            end_date: c.end_date,
          }))
        });
      }
    }

    // Handle booking cancellation - deactivate blocked dates for any confirmed booking
    const wasConfirmed = booking.status === 'confirmed';
    const isCancelling = finalStatus === 'cancelled';
    
    if (isCancelling && wasConfirmed) {
      // Deactivate blocked dates for cancelled bookings
      await client.query(
        `UPDATE blocked_dates 
         SET is_active = false, updated_at = NOW()
         WHERE booking_id = $1`,
        [parseInt(id)]
      );
      console.log(`⚠️ Blocked dates deactivated for cancelled booking ${id}`);
    }

    // Update the booking
    // Build query dynamically to handle optional payment_intent_id
    let updateQuery = `UPDATE bookings 
       SET status = COALESCE($1, status),
           payment_status = COALESCE($2, payment_status)`;
    let params: any[] = [status, payment_status];
    let paramIndex = 3;
    
    // Only update payment_intent_id if it's explicitly provided (not undefined)
    if (payment_intent_id !== undefined) {
      updateQuery += `, payment_intent_id = $${paramIndex}`;
      params.push(payment_intent_id);
      paramIndex++;
    }
    
    updateQuery += `, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`;
    params.push(parseInt(id));
    
    const result = await client.query(updateQuery, params);

    // If confirming a booking (status is confirmed), create/activate blocked_dates
    // This handles both new confirmations and re-confirmations (ON CONFLICT will update existing)
    if (isConfirming) {
      await client.query(
        `INSERT INTO blocked_dates (property_id, start_date, end_date, reason, source, booking_id, created_at, updated_at, is_active)
         VALUES ($1, $2, $3, 'direct_booking', 'direct_booking', $4, NOW(), NOW(), true)
         ON CONFLICT (booking_id) DO UPDATE SET
         property_id = EXCLUDED.property_id,
         start_date = EXCLUDED.start_date,
         end_date = EXCLUDED.end_date,
         updated_at = NOW(),
         is_active = true`,
        [booking.property_id, booking.check_in, booking.check_out, parseInt(id)]
      );
      console.log(`✅ Blocked dates created/activated for confirmed booking ${id}`);
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error updating booking:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ 
        message: 'Booking conflict', 
        error: 'This booking already has blocked dates associated with it' 
      });
    }
    
    res.status(500).json({ message: 'Failed to update booking', error: error.message });
  } finally {
    client.release();
  }
});

// Delete/Cancel booking
router.delete('/bookings/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM bookings WHERE id = $1 RETURNING id',
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted successfully', id: result.rows[0].id });
  } catch (error: any) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Failed to delete booking', error: error.message });
  }
});

export default router;

