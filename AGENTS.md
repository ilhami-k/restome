# AGENTS.md
# 1. Think Before Coding
Don't assume. Don't hide confusion. Surface tradeoffs.
Before implementing:

* State your assumptions explicitly. If uncertain, ask.
* If multiple interpretations exist, present them - don't pick silently.
* If a simpler approach exists, say so. Push back when warranted.
* If something is unclear, stop. Name what's confusing. Ask.

# 2. Simplicity First
Minimum code that solves the problem. Nothing speculative.

* No features beyond what was asked.
* No abstractions for single-use code.
* No "flexibility" or "configurability" that wasn't requested.
* No error handling for impossible scenarios.
* If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

# 3. Surgical Changes
Touch only what you must. Clean up only your own mess.
When editing existing code:

* Don't "improve" adjacent code, comments, or formatting.
* Don't refactor things that aren't broken.
* Match existing style, even if you'd do it differently.
* If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

* Remove imports/variables/functions that YOUR changes made unused.
* Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

# 4. Goal-Driven Execution
Define success criteria. Loop until verified.
Transform tasks into verifiable goals:

* "Add validation" → "Write tests for invalid inputs, then make them pass"
* "Fix the bug" → "Write a test that reproduces it, then make it pass"
* "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.
These guidelines are working if: fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

# 5. Project Context — Restaurant App

## Tech Stack

- **TypeScript** — all code is written in TypeScript. No JavaScript.
- Keep types simple: explicit types over generics, no complex type gymnastics.

## Architecture

Single React Native (Expo) app with two modes in one codebase:

- **Customer mode** — anonymous, entry via QR code scan. Requires an active connection.
- **Kitchen mode** — authenticated, entry via a staff QR code that redirects to the login screen. No visible button or link from the customer side.
**Source of truth: Supabase (PostgreSQL).** SQLite lives only on the customer's device for local personalization (device identity, order history, theme preference, saved allergen preferences). The kitchen does not use SQLite.

## Features

### Customer
- Scan the table QR code to start a session
- Browse the menu by category (starter / main / dessert / drink)
- View item detail (name, price, photo, allergens)
- Add items to the order with per-item notes
- View an order summary before submitting
- Get item suggestions based on previous orders
- Track item status in real time (pending → preparing → ready → unavailable)
- Toggle dark mode / light mode
### Kitchen
- Log in via staff QR code + email / password
- View the live order queue across all tables
- Update the status of individual items
- Send a message to the customer on a specific item
- Add a new menu item (name, price, category, photo, allergens)
- Edit an existing menu item
- Toggle item availability in real time
- Add a new allergen to the reference list
## Supabase Schema

| Table | Field | Type | Role |
|---|---|---|---|
| tables | id | uuid PK, default gen_random_uuid() | Table identifier |
| | number | int, not null, unique | Display number (e.g. "Table 4") |
| | qr_code | text, not null, unique | Value encoded in the physical QR code |
| sessions | id | uuid PK, default gen_random_uuid() | Session identifier |
| | table_id | uuid FK, not null | References `tables.id` |
| | status | text, not null | open / closed |
| | created_at | timestamptz, default now() | Session start |
| | closed_at | timestamptz, nullable | Session end |
| menu_items | id | uuid PK, default gen_random_uuid() | Item identifier |
| | name | text, not null | Display name |
| | price | decimal(10,2), not null | Unit price, must be >= 0 |
| | category | text, not null | starter / main / dessert / drink |
| | available | boolean, not null, default true | Kitchen toggle, pushed in real time |
| | availability_message | text, nullable | Reason shown when an item is unavailable |
| | image_url | text, nullable | Image URL |
| | created_at | timestamptz, default now() | Creation date |
| allergens | id | uuid PK, default gen_random_uuid() | Allergen identifier |
| | name | text, not null, unique | Allergen name (e.g. "Gluten") |
| menu_item_allergens | menu_item_id | uuid FK, not null | References `menu_items.id`, on delete cascade |
| | allergen_id | uuid FK, not null | References `allergens.id`, on delete cascade |
| orders | id | uuid PK, default gen_random_uuid() | Order identifier |
| | session_id | uuid FK, not null, unique | References `sessions.id`; one order per session |
| | status | text, not null | open / closed / paid |
| | created_at | timestamptz, default now() | Order opened at |
| order_items | id | uuid PK, default gen_random_uuid() | Line identifier |
| | order_id | uuid FK, not null | References `orders.id` |
| | menu_item_id | uuid FK, not null | References `menu_items.id` |
| | notes | text, nullable | Per-item customer notes |
| | status | text, not null | pending / preparing / ready / unavailable |
| | created_at | timestamptz, default now() | Timestamp |
| status_updates | id | uuid PK, default gen_random_uuid() | Update identifier |
| | order_item_id | uuid FK, not null | References `order_items.id` |
| | message | text, nullable | Kitchen-to-customer message |
| | created_at | timestamptz, default now() | Timestamp |

`menu_item_allergens` uses a composite primary key: `(menu_item_id, allergen_id)`.

## SQLite Schema (customer device only)

Local personalization only — no menu cache, no offline queue.

| Table | Field | Type | Role |
|---|---|---|---|
| device | id | text PK | UUID generated on first launch, never sent to server |
| preferences | id | integer PK, check(id = 1) | Single row |
| | theme | text, check(theme in ('light', 'dark')) | light / dark |
| order_history | id | integer PK autoincrement | Auto-increment |
| | menu_item_id | text, not null | Supabase item id |
| | menu_item_name | text, not null | Snapshot of name at order time |
| | ordered_at | text, not null | Timestamp |
| user_allergens | allergen_id | text PK | Supabase allergen id |
| | allergen_name | text, not null | Snapshot of allergen name |

## Realtime

Two Supabase Realtime subscriptions run in parallel:

- Kitchen subscribes to `order_items` — new orders appear on the dashboard instantly.
- Customer subscribes to `status_updates` — kitchen messages appear on the order screen instantly.
Menu availability changes (`menu_items.available`) are also pushed to customers in real time.

## Key Constraints

- App requires an active connection — no offline support.
- Orders are immutable once submitted — no edits, no cancellations.
- No customer accounts — session identity is the table QR code, stored in React Context.
- Multiple customers at the same table share one active order (append-only, no conflicts).
- Customer personalization (history, theme, saved allergens) is device-local only — identified by a locally generated UUID, never sent to Supabase.
- Kitchen auth is hidden — staff access via staff QR code only.
- The 14 standard EU allergens are pre-seeded in the `allergens` table. Kitchen staff can add custom ones.

## Session Flow

When a customer scans a table QR code:
1. The app looks up the table by `qr_code`.
2. It checks for an existing `open` session for that `table_id`.
3. If an open session exists: the customer is prompted to join it. If they confirm, the kitchen is notified via Realtime.
4. If no open session exists (last one was closed by the kitchen): a new session is created automatically.
5. The customer is then taken to the menu.
6. The kitchen can manually close a session (payment is out of scope for now).

## Order Creation Flow

- Each session has exactly one `orders` row (created with the first submission or lazily on first item add).
- Customers add items to a **local cart** (React state only) while browsing.
- When the customer taps "Submit", the app creates the `orders` row if it doesn't exist, then inserts all cart items as `order_items`.
- The cart is cleared after successful submission.
- Subsequent customers joining the same session append to the same `orders` row.
