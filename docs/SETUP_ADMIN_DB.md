# Setup Admin Database - Complete Guide

## ✅ What's Been Implemented

### 🔐 **Secure Database-Based Authentication**
- Admin users stored in PostgreSQL database
- Passwords hashed with **bcrypt** (industry standard)
- JWT token-based authentication
- Automatic session management

### 👥 **User Management System**
- Create new admin users
- Edit existing users
- Delete users (with protection against self-deletion)
- Role-based access (admin, super_admin, editor)
- Track last login times

### 📊 **Real-Time Dashboard**
- Fetches live data from database
- Shows actual property count
- Displays confirmed bookings
- Calculates total revenue
- Lists recent bookings (last 7 days)
- Shows popular properties

---

## 🚀 Quick Setup (Run These Commands)

### 1. Initialize the Admin Users Table

Run this command in your terminal (from project root):

```bash
npm run init-admin
```

If that doesn't work, run directly:

```bash
npx tsx scripts/init-admin-user.ts
```

This will:
- ✅ Create the `admin_users` table
- ✅ Add indexes for performance
- ✅ Create default admin user:
  - **Username:** `admin`
  - **Password:** `admin123` (bcrypt hashed)

### 2. Restart Your Server

```bash
npm run dev
```

### 3. Login to Admin Panel

Navigate to: `http://localhost:5000/admin/login`

**Default Credentials:**
- Username: `admin`
- Password: `admin123`

---

## 🛠️ Manual Setup (If Automatic Fails)

If the automatic script doesn't work, run this SQL directly in your database:

```sql
-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Insert default admin (password: admin123)
INSERT INTO admin_users (username, password_hash, name, email, role)
VALUES (
  'admin',
  '$2b$10$YourBcryptHashHere',  -- You'll need to generate this
  'Administrator',
  'admin@kairokenya.com',
  'super_admin'
);
```

To generate a bcrypt hash for "admin123", you can use this Node.js code:

```javascript
const bcrypt = require('bcrypt');
bcrypt.hash('admin123', 10).then(hash => console.log(hash));
```

---

## 📋 Database Schema

### `admin_users` Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| username | VARCHAR(255) | Unique username |
| password_hash | VARCHAR(255) | Bcrypt hashed password |
| name | VARCHAR(255) | Full name |
| email | VARCHAR(255) | Email (optional, unique) |
| role | VARCHAR(50) | User role (admin, super_admin, editor) |
| is_active | BOOLEAN | Account status |
| created_at | TIMESTAMP | When user was created |
| updated_at | TIMESTAMP | Last update time |
| last_login | TIMESTAMP | Last successful login |

---

## 🔒 Security Features

### ✅ Implemented Security

1. **Password Hashing**
   - Uses bcrypt with 10 salt rounds
   - Passwords never stored in plain text
   - Industry-standard encryption

2. **JWT Authentication**
   - Secure token-based sessions
   - 24-hour expiration
   - Stored in localStorage (client-side)

3. **Database Security**
   - Parameterized queries prevent SQL injection
   - Unique constraints on username/email
   - Password validation before update

4. **Self-Protection**
   - Cannot delete your own admin account
   - Password required for new users
   - Optional password update for existing users

### ⚠️ Production Recommendations

1. **Change JWT Secret**
   ```bash
   JWT_SECRET=your-super-secret-key-here
   ```

2. **Use Environment Variables**
   ```bash
   ADMIN_USERNAME=your_username
   ADMIN_PASSWORD=your_secure_password
   ```

3. **Enable HTTPS**
   - Never use HTTP in production
   - Tokens sent over HTTPS only

4. **Rate Limiting**
   - Add rate limiting to login endpoint
   - Prevent brute-force attacks

5. **Password Policy**
   - Enforce minimum 8 characters
   - Require special characters
   - Implement password complexity rules

---

## 👥 User Management Guide

### Access User Management

1. Login to admin panel
2. Click "Users" in the sidebar
3. View all admin users

### Create New User

1. Click "Add User" button
2. Fill in:
   - Username (required, unique)
   - Full Name (required)
   - Email (optional)
   - Password (required)
   - Role (admin/super_admin/editor)
3. Click "Create User"

### Edit User

1. Click the menu (⋮) next to user
2. Click "Edit"
3. Update information
4. Leave password blank to keep current
5. Click "Update User"

### Delete User

1. Click the menu (⋮) next to user
2. Click "Delete"
3. Confirm deletion
4. **Note:** Cannot delete yourself

---

## 📊 Dashboard Data

The dashboard now shows **REAL DATA** from your database:

### Statistics
- **Total Properties:** Count from `properties` table
- **Active Bookings:** Confirmed bookings count
- **Total Revenue:** Sum of all confirmed bookings
- **Total Views:** (Currently mock data - can be tracked separately)

### Recent Bookings
- Shows last 5 bookings from past 7 days
- Includes property name and booking price
- Ordered by most recent first

### Popular Properties
- Shows top 5 properties by booking count
- Displays number of bookings for each
- Helps identify best-performing properties

---

## 🔑 API Endpoints

All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Authentication
```
POST /api/admin/login
Body: { username, password }
```

### User Management
```
GET    /api/admin/users           - List all users
POST   /api/admin/users           - Create new user
PUT    /api/admin/users/:id       - Update user
DELETE /api/admin/users/:id       - Delete user
```

### Dashboard
```
GET /api/admin/stats              - Get dashboard statistics
```

### Properties
```
POST   /api/admin/properties      - Create property
PUT    /api/admin/properties/:id  - Update property
DELETE /api/admin/properties/:id  - Delete property
```

---

## 🐛 Troubleshooting

### Cannot Login
1. Check database connection
2. Verify `admin_users` table exists
3. Ensure default user was created
4. Check server logs for errors

### "Table does not exist" Error
Run the initialization script:
```bash
npx tsx scripts/init-admin-user.ts
```

### Password Doesn't Work
Default password is: `admin123`
- Case sensitive
- No spaces
- Exact match required

### Cannot Create Users
1. Check JWT token is valid
2. Verify you're logged in
3. Check for unique constraint violations
4. Review server logs

---

## 🎯 Next Steps

1. **Run the initialization script**
2. **Login with default credentials**
3. **Create your own admin account**
4. **Delete or disable the default admin**
5. **Set strong passwords for all users**

---

## 📞 Support

If you encounter issues:
1. Check server terminal for error logs
2. Check browser console for client errors
3. Verify database connection
4. Review this setup guide

**Your admin system is now secure and database-backed!** 🎉

