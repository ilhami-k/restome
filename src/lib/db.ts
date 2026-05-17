import type { SQLiteDatabase } from 'expo-sqlite';
import type { Allergen } from '../types';

const DATABASE_VERSION = 1;

export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS device (
        id TEXT PRIMARY KEY
      );

      CREATE TABLE IF NOT EXISTS preferences (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        theme TEXT CHECK (theme IN ('light', 'dark'))
      );

      CREATE TABLE IF NOT EXISTS order_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        menu_item_id TEXT NOT NULL,
        menu_item_name TEXT NOT NULL,
        ordered_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_allergens (
        allergen_id TEXT PRIMARY KEY,
        allergen_name TEXT NOT NULL
      );

      INSERT OR IGNORE INTO preferences (id, theme) VALUES (1, 'light');
    `);
    currentVersion = 1;
  }

  await db.execAsync(`PRAGMA user_version = ${currentVersion}`);
}

export async function ensureDeviceId(db: SQLiteDatabase): Promise<string> {
  const row = await db.getFirstAsync<{ id: string }>('SELECT id FROM device LIMIT 1');
  if (row?.id) return row.id;

  const id = generateUuid();
  await db.runAsync('INSERT INTO device (id) VALUES (?)', id);
  await db.runAsync("INSERT OR IGNORE INTO preferences (id, theme) VALUES (1, 'light')");
  return id;
}

export async function getThemePreference(db: SQLiteDatabase): Promise<'light' | 'dark'> {
  const row = await db.getFirstAsync<{ theme: string }>('SELECT theme FROM preferences WHERE id = 1');
  return (row?.theme as 'light' | 'dark') ?? 'light';
}

export async function setThemePreference(db: SQLiteDatabase, theme: 'light' | 'dark'): Promise<void> {
  await db.runAsync('INSERT OR REPLACE INTO preferences (id, theme) VALUES (1, ?)', theme);
}

export async function addOrderHistory(db: SQLiteDatabase, menuItemId: string, menuItemName: string): Promise<void> {
  await db.runAsync(
    'INSERT INTO order_history (menu_item_id, menu_item_name, ordered_at) VALUES (?, ?, ?)',
    menuItemId,
    menuItemName,
    new Date().toISOString()
  );
}

export async function getSavedAllergens(db: SQLiteDatabase): Promise<Allergen[]> {
  return db.getAllAsync<Allergen>(
    'SELECT allergen_id AS id, allergen_name AS name FROM user_allergens ORDER BY allergen_name COLLATE NOCASE ASC'
  );
}

export async function replaceSavedAllergens(db: SQLiteDatabase, allergens: Allergen[]): Promise<void> {
  await db.runAsync('DELETE FROM user_allergens');

  for (const allergen of allergens) {
    await db.runAsync(
      'INSERT INTO user_allergens (allergen_id, allergen_name) VALUES (?, ?)',
      allergen.id,
      allergen.name
    );
  }
}

export async function getOrderHistory(
  db: SQLiteDatabase
): Promise<{ menu_item_id: string; menu_item_name: string; ordered_at: string }[]> {
  return db.getAllAsync<{ menu_item_id: string; menu_item_name: string; ordered_at: string }>(
    'SELECT menu_item_id, menu_item_name, ordered_at FROM order_history ORDER BY ordered_at DESC'
  );
}

export async function getSuggestedMenuItemIds(db: SQLiteDatabase): Promise<string[]> {
  const rows = await db.getAllAsync<{ menu_item_id: string; times_ordered: number; last_ordered_at: string }>(
    `SELECT menu_item_id, COUNT(*) AS times_ordered, MAX(ordered_at) AS last_ordered_at
     FROM order_history
     GROUP BY menu_item_id
     ORDER BY times_ordered DESC, last_ordered_at DESC
     LIMIT 5`
  );

  return rows.map((row) => row.menu_item_id);
}

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
