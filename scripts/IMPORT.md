# Import properties and run migration (dev)

1. Ensure your `DB_URL` environment variable points to a Postgres database (dev/test).

2. Run the SQL migration to create tables (example using psql):

```powershell
psql "$env:DB_URL" -f migrations/0004_init_properties.sql
```

3. Run the import script to upsert properties from `client/src/data/properties.json`:

```powershell
node scripts/import_properties.js
```

Dry run (no DB writes):

```powershell
node scripts/import_properties.js --dry-run
```

The import script will also import `client/src/data/property-images.json` into the `property_images` table if present.

Notes:
- The migration file is intended for development/testing; review before running in production.
- The import script uses `ON CONFLICT (id) DO UPDATE` to upsert by id.
- You can extend the import script to load images, blocked dates, or calendar sync rows as needed.
