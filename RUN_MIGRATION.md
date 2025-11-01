# Quick Start: Add Maps to Your Properties

## ✅ Everything is Ready!

All code changes have been completed. Your property details page will now display Google Maps for each property.

## 🚀 Run the Migration (Choose One Method)

### Method 1: Using the API Endpoint (EASIEST)

1. **Start your development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open a new terminal** and run this command:
   ```bash
   curl -X POST http://localhost:5000/api/migrate-map-url/run
   ```

   Or visit this URL in your browser:
   ```
   http://localhost:5000/api/migrate-map-url/run
   ```

3. **Done!** You should see a success message with the updated properties.

### Method 2: Manual SQL (If you prefer)

Run these commands in your database console:

```sql
ALTER TABLE properties ADD COLUMN IF NOT EXISTS map_url TEXT;

UPDATE properties SET map_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8214748627883!2d36.37298061431382!3d-0.7893148993150658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182aa2d52cffb471%3A0x7b7fa0da403babc2!2sLake%20Naivasha!5e0!3m2!1sen!2ske!4v1685435408351!5m2!1sen!2ske' WHERE id = 247;

UPDATE properties SET map_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.816896338629!2d36.780859314313205!3d-1.2921000990438953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10f5d6931cdd%3A0xc8c5be3c01403b07!2sGeorge%20Padmore%20Rd%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1730288000000!5m2!1sen!2ske' WHERE id = 239;

UPDATE properties SET map_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.816896338629!2d36.780859314313205!3d-1.2921000990438953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10f5d6931cdd%3A0xc8c5be3c01403b07!2sGeorge%20Padmore%20Rd%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1730288000000!5m2!1sen!2ske' WHERE id = 240;

UPDATE properties SET map_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63752.56080982412!2d39.56035407910155!3d-4.287446200000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x184013b265fd0b1f%3A0xbdbbbf4f32f9578d!2sDiani%20Beach!5e0!3m2!1sen!2ske!4v1730288100000!5m2!1sen!2ske' WHERE id = 241;
```

## 🎉 View the Results

1. Navigate to any property details page (e.g., `http://localhost:5000/properties/247`)
2. Scroll down to **"Location & Nearby Attractions"**
3. You should now see an embedded Google Map!

## 🎨 What's New

- ✅ **Interactive Google Maps** for each property location
- ✅ **3-column gallery grid** on mobile devices (was 1 column before)
- ✅ **Floating WhatsApp button** on mobile for instant inquiries
- ✅ **Modern, luxurious redesign** with smooth animations

## 📝 Adding Maps to New Properties

When adding new properties in the future:

1. Go to [Google Maps](https://maps.google.com)
2. Search for the location
3. Click **"Share" → "Embed a map"**
4. Copy the `src` URL from the `<iframe>` code
5. Save it in the `map_url` field for that property

---

**That's it! Your property detail pages now have beautiful embedded maps! 🗺️**

