# Admin Dashboard Guide

## 🔐 Access the Admin Panel

Navigate to `/admin/login` to access the admin dashboard.

### Default Credentials
- **Username:** `admin`
- **Password:** `admin123`

> ⚠️ **Important:** Change these credentials in production by setting environment variables:
> - `ADMIN_USERNAME`
> - `ADMIN_PASSWORD`
> - `JWT_SECRET`

## 📋 Features

### Dashboard (`/admin/dashboard`)
- View key statistics at a glance:
  - Total properties
  - Active bookings
  - Total revenue
  - Total views
- Recent bookings overview
- Popular properties list

### Properties Management (`/admin/properties`)
- **View all properties** in a sortable table
- **Search** properties by name or location
- **Add new property** with comprehensive form
- **Edit existing properties** with all details
- **Delete properties** with confirmation
- **Preview properties** (opens in new tab)

### Property Form Features
- Basic information (name, category, location, description)
- Property details (price, guests, bedrooms, bathrooms)
- Media management (main image URL, Google Maps embed)
- Amenities management (add/remove with tags)
- Featured property toggle
- All changes auto-save to database

## 🎨 Admin UI Features

- **Responsive design** - works on all devices
- **Dark/Light theme** support
- **Sidebar navigation** (desktop) with active state indicators
- **Mobile menu** with slide-out drawer
- **Real-time updates** using React Query
- **Toast notifications** for all actions
- **Smooth animations** with Framer Motion

## 🔧 API Endpoints

All admin endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Authentication
- `POST /api/admin/login` - Admin login

### Dashboard
- `GET /api/admin/stats` - Get dashboard statistics

### Properties
- `POST /api/admin/properties` - Create new property
- `PUT /api/admin/properties/:id` - Update property
- `DELETE /api/admin/properties/:id` - Delete property

## 📝 Property Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Property name |
| description | text | Yes | Full description |
| location | string | Yes | Property location |
| category | enum | Yes | apartment, villa, house, penthouse, cottage |
| price_per_night | number | Yes | Price in KES |
| max_guests | number | Yes | Maximum occupancy |
| bedrooms | number | Yes | Number of bedrooms |
| bathrooms | number | Yes | Number of bathrooms |
| image_url | string | Yes | Main property image URL |
| map_url | string | No | Google Maps embed URL |
| amenities | array | No | List of amenities |
| featured | boolean | No | Featured property flag |

## 🖼️ Image Management

Currently, the admin panel uses image URLs. To add images:

1. Upload images to a hosting service (e.g., Cloudinary, AWS S3, ImgBB)
2. Copy the direct image URL
3. Paste it in the "Main Image URL" field
4. Preview will show automatically

### Recommended Image Specifications
- **Format:** JPG, PNG, or WebP
- **Dimensions:** 1920x1080px (16:9 ratio)
- **File Size:** < 500KB for optimal loading
- **Quality:** 80-90% compression

## 🗺️ Google Maps Integration

To add a map to a property:

1. Go to [Google Maps](https://www.google.com/maps)
2. Search for the property location
3. Click "Share" → "Embed a map"
4. Copy the `src` URL from the iframe code
5. Paste it in the "Google Maps Embed URL" field

Example:
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d...
```

## 🔒 Security Notes

1. **Always use HTTPS** in production
2. **Change default credentials** immediately
3. **Set strong JWT secret** via environment variables
4. **Implement rate limiting** for login attempts
5. **Enable CORS** only for trusted domains
6. **Regular security audits** recommended

## 🚀 Future Enhancements

Potential features for future development:
- Direct image upload to cloud storage
- Bulk property import/export (CSV, Excel)
- Advanced analytics and reports
- Booking management interface
- User roles and permissions
- Activity audit logs
- Email notifications
- Calendar sync management
- Revenue reports and charts

## 📞 Support

For issues or questions about the admin dashboard, check:
- Application logs for errors
- Browser console for client-side issues
- Network tab for API request failures

