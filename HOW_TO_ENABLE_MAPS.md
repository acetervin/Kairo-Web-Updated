# 🗺️ How to Enable Maps for Each Property

## ✅ Map Feature is Already Implemented!

The Property Details page already has full map functionality built-in. You just need to add the map URLs to your database.

---

## 🚀 Quick Start (2 Steps)

### Step 1: Run the Migration

**Option A: Using the API Endpoint (Easiest)**

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. In a new terminal or browser, run:
   ```bash
   curl -X POST http://localhost:5000/api/migrate-map-url/run
   ```

   Or simply visit in your browser:
   ```
   http://localhost:5000/api/migrate-map-url/run
   ```

**Option B: Manual SQL**

If you prefer to run SQL directly in your database console:

```sql
-- 1. Add the column (if not already added)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS map_url TEXT;

-- 2. Add sample Google Maps for your properties
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

### Step 2: View the Maps

1. Visit any property page:
   ```
   http://localhost:5000/properties/247
   ```

2. Scroll down to the **"Location & Nearby"** section

3. You'll see:
   - ✅ Interactive Google Map embedded
   - ✅ Location details
   - ✅ Nearby attractions with distances

---

## 📍 How to Add Maps for New Properties

### Getting Google Maps Embed URL

1. Go to [Google Maps](https://maps.google.com)
2. Search for your property location
3. Click the **"Share"** button
4. Select the **"Embed a map"** tab
5. Copy the **`src`** URL from the `<iframe>` code
   - It starts with: `https://www.google.com/maps/embed?pb=...`

### Adding to Database

**Option 1: Through your admin panel/CMS**
- Edit the property
- Paste the embed URL in the `map_url` field
- Save

**Option 2: Direct SQL**
```sql
UPDATE properties 
SET map_url = 'YOUR_GOOGLE_MAPS_EMBED_URL_HERE'
WHERE id = YOUR_PROPERTY_ID;
```

**Option 3: Using API** (if you have an admin API)
```javascript
await fetch(`/api/properties/${propertyId}`, {
  method: 'PATCH',
  body: JSON.stringify({
    map_url: 'YOUR_GOOGLE_MAPS_EMBED_URL'
  })
});
```

---

## 🎨 What You Get

### Interactive Map Features:
- ✅ **Embedded Google Map** (320px height)
- ✅ **Zoom controls**
- ✅ **Street view** (if available)
- ✅ **Directions** link
- ✅ **Fullscreen mode**
- ✅ **Responsive** design

### Location Section Includes:
- 📍 Interactive map
- 📝 Location description
- 🎯 Nearby attractions (6 places)
- 📏 Distances from property

---

## 🔧 Already Set Up

The following is **already implemented** in your codebase:

1. ✅ Database schema has `map_url` field (`shared/schema.ts`)
2. ✅ Backend API returns `map_url` for each property
3. ✅ Frontend displays map in Property Details page
4. ✅ Migration files created (`migrations/0103_add_map_url.sql`, `0104_seed_map_urls.sql`)
5. ✅ API endpoint to run migration (`/api/migrate-map-url/run`)
6. ✅ Fallback to location text if no map URL

---

## 🐛 Troubleshooting

**Map not showing?**
- Check that `map_url` field exists in database
- Verify property has a valid `map_url` value
- Ensure URL is a Google Maps **embed** URL (not regular share link)
- Check browser console for iframe errors

**Wrong location?**
- Update the `map_url` with correct Google Maps embed link
- Make sure you copied the embed URL, not the share URL

**Map too small/large?**
- Adjust height in `PropertyDetail.tsx` line 748: `h-80` (80 = 320px)
- Change to `h-64` (256px) or `h-96` (384px) as needed

---

## 📚 Related Documentation

- `RUN_MIGRATION.md` - Full migration guide
- `SEED_MAP_URLS_INSTRUCTIONS.md` - Detailed map setup
- `PROPERTY_DETAIL_REDESIGN_COMPLETE.md` - All features overview

---

## ✨ Summary

Maps are **already working** in your code! Just run the migration to add sample map URLs, then every property detail page will display an interactive Google Map showing the exact location.

**Next step:** Run the migration using one of the methods above! 🗺️

