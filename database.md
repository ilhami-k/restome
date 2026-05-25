# RestoMe Database Requirements

This document defines the database schema and configuration needed for the RestoMe app.

## Source of Truth: Supabase (PostgreSQL)

All operational data lives in Supabase. The customer device only keeps local personalization in SQLite.

---

## Tables

### `tables`
Restaurant tables. Each has a physical QR code.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| number | int | not null, unique |
| qr_code | text | not null, unique |

**Sample data**
```sql
insert into tables (number, qr_code) values
  (1, 'TABLE_001'),
  (2, 'TABLE_002'),
  (3, 'TABLE_003'),
  (4, 'TABLE_004'),
  (5, 'TABLE_005'),
  (6, 'TABLE_006');
```

These values match the QR files in `src/qr-codes/`.

---

### `sessions`
A dining session at a table. Opened when the first customer scans, closed by kitchen.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| table_id | uuid | not null → tables.id |
| status | text | not null, check(status in ('open','closed')) |
| created_at | timestamptz | default now() |
| closed_at | timestamptz | nullable |

**Index**
```sql
create index idx_sessions_table_status on sessions(table_id, status);
```

---

### `menu_items`
Items on the menu.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| name | text | not null |
| price | decimal(10,2) | not null, >= 0 |
| category | text | not null, check(category in ('starter','main','dessert','drink')) |
| available | boolean | not null, default true |
| availability_message | text | nullable |
| image_url | text | nullable |
| created_at | timestamptz | default now() |

---

### `allergens`
Reference list of allergens. Pre-seed with the 14 EU allergens.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| name | text | not null, unique |

**Pre-seed**
```sql
insert into allergens (name) values
  ('Gluten'), ('Crustaceans'), ('Eggs'), ('Fish'),
  ('Peanuts'), ('Soybeans'), ('Milk'), ('Nuts'),
  ('Celery'), ('Mustard'), ('Sesame'), ('Sulphites'),
  ('Lupin'), ('Molluscs');
```

---

### `menu_item_allergens`
Many-to-many link between menu items and allergens.

| Column | Type | Constraints |
|--------|------|-------------|
| menu_item_id | uuid | not null → menu_items.id, on delete cascade |
| allergen_id | uuid | not null → allergens.id, on delete cascade |

**PK**: `(menu_item_id, allergen_id)`

---

### `orders`
One order row per session. Created lazily on first item submission.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| session_id | uuid | not null → sessions.id |
| status | text | not null, check(status in ('open','closed','paid')) |
| created_at | timestamptz | default now() |

**Constraint**
```sql
alter table orders add constraint orders_session_id_key unique (session_id);
```

---

### `order_items`
Individual line items in an order.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| order_id | uuid | not null → orders.id |
| menu_item_id | uuid | not null → menu_items.id |
| notes | text | nullable |
| status | text | not null, check(status in ('pending','preparing','ready','unavailable')) |
| created_at | timestamptz | default now() |

---

### `status_updates`
Kitchen messages and status changes pushed to customers in real time.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| order_item_id | uuid | not null → order_items.id |
| message | text | nullable |
| created_at | timestamptz | default now() |

---

## Row Level Security (RLS)

Enable RLS on all tables. Policies:

- **Anonymous customers** (anon key) can:
  - `select` from `tables`, `menu_items`, `allergens`, `menu_item_allergens`
  - `select`, `insert` on `sessions` (open a session)
  - `select`, `insert` on `orders`
  - `select`, `insert` on `order_items`
  - `select` on `status_updates`

- **Authenticated kitchen staff** (service role or auth users) can:
  - Full CRUD on `menu_items`, `allergens`, `menu_item_allergens`
  - `select`, `update` on `order_items` (status changes)
  - `insert` on `status_updates`
  - `select`, `update` on `sessions` (close sessions)

**Important**: In this version the app uses the Supabase anon key for customers and email/password auth for kitchen staff. Apply policies accordingly.

---

## Realtime

Enable Supabase Realtime on these tables:

1. `order_items` — kitchen subscribes to `INSERT` and `UPDATE` (new orders appear instantly)
2. `orders` — kitchen refreshes when open orders are created or closed
3. `sessions` — kitchen refreshes when tables are opened or closed
4. `status_updates` — customer subscribes to `INSERT` (kitchen messages appear instantly)
5. `menu_items` — customer subscribes to `UPDATE` on `available` field (availability changes pushed in real time)

If you already created the database before `availability_message` was added, run:

```sql
alter table menu_items add column if not exists availability_message text;
```

Enable the tables in the Supabase Dashboard → Database → Replication.

The app also uses Supabase Realtime broadcast channels:

- `kitchen_orders` — customer notifies kitchen after submitting an order
- `session_joins` — customer notifies kitchen when a table session is opened or joined

These broadcast channels do not require database replication, but the app still needs the normal Supabase Realtime service to be available.

---

## Storage

Kitchen menu image upload uses Supabase Storage.

Create one public bucket:

```txt
menu-images
```

Expected behavior:

- Kitchen staff can upload images to `menu-images`.
- Public read access is enabled so customer menu images can render from their public URL.
- Uploaded paths are stored in `menu_items.image_url`.

If Storage policies are enabled, authenticated kitchen users need permission to upload into the `menu-images` bucket.

---

## Local Device: SQLite (Customer only)

SQLite lives only on the customer device. No menu cache, no offline queue.

### Schema

```sql
-- Device identity (never sent to server)
CREATE TABLE IF NOT EXISTS device (
  id TEXT PRIMARY KEY
);

-- Theme preference (single row, id = 1)
CREATE TABLE IF NOT EXISTS preferences (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  theme TEXT CHECK (theme IN ('light', 'dark'))
);

-- Order history for suggestions
CREATE TABLE IF NOT EXISTS order_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_item_id TEXT NOT NULL,
  menu_item_name TEXT NOT NULL,
  ordered_at TEXT NOT NULL
);

-- Local allergen preferences
CREATE TABLE IF NOT EXISTS user_allergens (
  allergen_id TEXT PRIMARY KEY,
  allergen_name TEXT NOT NULL
);
```

**Initialization** (run on app first launch):
```sql
INSERT OR IGNORE INTO device (id) VALUES ('<generated-uuid>');
INSERT OR IGNORE INTO preferences (id, theme) VALUES (1, 'light');
```

---

## Environment Variables

The app expects these values (typically in a `.env` file, never committed):

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Kitchen staff authentication uses Supabase Auth (email/password).

Create at least one kitchen demo user in Supabase Auth before testing. Do not commit demo credentials to the public repository; provide them privately to the evaluator during the demo or by private message.

---

## Notes for Implementation

- Orders are immutable once submitted — no `update` or `delete` on `order_items` from the customer side.
- Multiple customers at the same table share one active session and one active `orders` row.
- When a customer scans a QR code, look up `tables.qr_code`, then check for an existing `open` session for that `table_id`.
- If an open session exists, prompt the customer to join it.
- If no open session exists, create a new one.
