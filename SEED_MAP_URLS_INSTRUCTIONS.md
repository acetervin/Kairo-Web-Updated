# How to Add Google Maps to Your Properties

## Overview
Your Property Details page is now ready to display embedded Google Maps for each property using the `map_url` field stored in your database.

## What's Been Done ✅

1. **Database Schema** - `map_url` field is already defined in `shared/schema.ts` (line 23)
2. **Backend API** - Your API already returns all fields from properties table including `map_url`
3. **Frontend** - Property Detail page displays maps from `property.map_url` if available
4. **Gallery** - Updated to show 3 images per row on mobile devices
5. **WhatsApp Button** - Added floating WhatsApp chat button on mobile

## What You Need to Do 📝

### Option 1: Manual Database Update (Recommended)

Run these SQL commands in your database console or admin panel:

```sql
-- 1. Ensure the column exists (if not already added by Drizzle)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS map_url TEXT;

-- 2. Add Google Maps for each property
UPDATE properties
SET map_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8214748627883!2d36.37298061431382!3d-0.7893148993150658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182aa2d52cffb471%3A0x7b7fa0da403babc2!2sLake%20Naivasha!5e0!3m2!1sen!2ske!4v1685435408351!5m2!1sen!2ske'
WHERE id = 247;

UPDATE properties
SET map_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.816896338629!2d36.780859314313205!3d-1.2921000990438953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10f5d6931cdd%3A0xc8c5be3c01403b07!2sGeorge%20Padmore%20Rd%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1730288000000!5m2!1sen!2ske'
WHERE id = 239;

UPDATE properties
SET map_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.816896338629!2d36.780859314313205!3d-1.2921000990438953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10f5d6931cdd%3A0xc8c5be3c01403b07!2sGeorge%20Padmore%20Rd%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1730288000000!5m2!1sen!2ske'
WHERE id = 240;

UPDATE properties
SET map_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63752.56080982412!2d39.56035407910155!3d-4.287446200000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x184013b265fd0b1f%3A0xbdbbbf4f32f9578d!2sDiani%20Beach!5e0!3m2!1sen!2ske!4v1730288100000!5m2!1sen!2ske'
WHERE id = 241;
```

### Option 2: Using the Migration Script

If you have access to your database environment variables:

```bash
npx tsx apply-map-url.ts
```

## How to Get Google Maps Embed Links

For any new properties, follow these steps:

1. Go to [Google Maps](https://maps.google.com)
2. Search for your property location
3. Click the **"Share"** button
4. Select **"Embed a map"** tab
5. Copy the `src` URL from the `<iframe>` code (it starts with `https://www.google.com/maps/embed?pb=...`)
6. Store this URL in your database's `map_url` field for that property

## Verifying It Works

1. Start your development server: `npm run dev`
2. Navigate to any property details page
3. Scroll down to the "Location & Nearby Attractions" section
4. You should see an embedded Google Map (if `map_url` is set) or fallback text (if not set)

## Features Included

- ✅ **Interactive Google Maps** per property
- ✅ **3-column gallery grid** on mobile devices
- ✅ **Floating WhatsApp button** for mobile users
- ✅ **Modern, luxurious design** with smooth animations
- ✅ **Responsive** across all screen sizes

## Troubleshooting

**Map not showing?**
- Check that the `map_url` field is populated in the database for that property
- Verify the URL is a Google Maps embed URL (starts with `https://www.google.com/maps/embed`)
- Check browser console for any iframe errors

**Database column doesn't exist?**
- The `map_url` field is already in your schema
- When you restart your dev server, Drizzle should automatically sync the schema

## Files Modified

- ✅ `shared/schema.ts` - Already has `map_url: text("map_url")` field
- ✅ `client/src/pages/PropertyDetail.tsx` - Now uses `property.map_url` to display maps
- ✅ `client/src/components/CategoryGallery.tsx` - Updated to show 3 columns on mobile
- ✅ `migrations/0103_add_map_url.sql` - Migration file created
- ✅ `migrations/0104_seed_map_urls.sql` - Sample data migration created
- ✅ `apply-map-url.ts` - Script to apply migrations (optional)

---

**Need help?** All the infrastructure is in place. Just add the map URLs to your database and refresh your property pages!

