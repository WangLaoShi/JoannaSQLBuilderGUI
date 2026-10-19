import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HttpError } from './errors.js';
import { ProfileStore } from './profiles.js';
import { ContextStore } from './contexts.js';
import { openDb, projectResult } from './db.js';
import { assembleQuery, assertSingleRead, containsVariables } from './query-sql.js';
import { parseSql } from './query-parser.js';
import * as schema from './schema.js';
import { APP_NAME, APP_VERSION } from './version.js';

const here = path.dirname(fileURLToPath(import.meta.url));

const ABOUT = `${APP_NAME} ${APP_VERSION}

This is a graphical interpretation of debugging/processing SQL queries.

Its purpose is to transform SQL queries into graphical data sets,
enabling the user to focus on their essentials,
while the app performs all the joining, filtering, etc.
in the background.

https://github.com/webofmarius/SQLJoiner

Node build: the browser talks to a local Node server instead of PHP.
Students install the app; they do not install PHP or Node.
`;

export function createApp({ storageDir }) {
  const profiles = new ProfileStore(storageDir);
  const contexts = new ContextStore(storageDir);
  const active = new Map();

  async function withProfile(profileId) {
    if (!profileId) throw new HttpError('profileId is required.', 400);
    const profile = profiles.get(profileId);
    if (!profile) throw new HttpError('Profile not found.', 404);
    try {
      return { profile, db: await openDb(profile) };
    } catch (err) {
      throw new HttpError(`Connection failed: ${err.message}`, 503);
    }
  }

  async function runSelect(db, sql, tabId) {
    if (containsVariables(sql)) {
      throw new HttpError('Queries containing session variables (@name) cannot be executed against the database. Remove variables before running.', 400);
    }
    assertSingleRead(sql);
    const key = String(tabId || '').replace(/[^\w-]/g, '').slice(0, 40);
    if (db.kind === 'mysql' && key) active.set(key, { threadId: db.threadId, profileId: null });
    try {
      return projectResult(sql, await db.query(sql));
    } catch (err) {
      throw new HttpError(`Query failed: ${err.message}`, 400);
    } finally {
      if (key) active.delete(key);
    }
  }

  const routes = {
    async 'profile.list'() { return profiles.list(); },
    async 'profile.save'(_req, body) { return { data: profiles.save(body), message: 'Profile saved.' }; },
    async 'profile.delete'(_req, body) { profiles.delete(body.id); return { data: null, message: 'Profile deleted.' }; },
    async 'profile.test'(_req, body) {
      const profile = profiles.resolveForTest(body);
      let db;
      try { db = await openDb(profile); }
      catch (err) { throw new HttpError(`Connection failed: ${err.message}`); }
      finally { await db?.close(); }
      return { data: null, message: 'Connection successful.' };
    },

    async 'schema.databases'(_req, body) {
      const { profile, db } = await withProfile(body.profileId);
      try {
        return profile.type === 'sqlite' ? await schema.sqliteDatabases() : await schema.mysqlDatabases(db);
      } finally { await db.close(); }
    },
    async 'schema.tables'(_req, body) {
      const { profile, db } = await withProfile(body.profileId);
      try {
        return profile.type === 'sqlite'
          ? await schema.sqliteTables(db)
          : await schema.mysqlTables(db, String(body.database ?? ''));
      } finally { await db.close(); }
    },
    async 'schema.columns'(_req, body) {
      const { profile, db } = await withProfile(body.profileId);
      try {
        return profile.type === 'sqlite'
          ? await schema.sqliteColumns(db, body.table)
          : await schema.mysqlColumns(db, body.table, String(body.database ?? ''));
      } finally { await db.close(); }
    },
    async 'schema.createStatement'(_req, body) {
      const { profile, db } = await withProfile(body.profileId);
      try {
        return profile.type === 'sqlite'
          ? await schema.sqliteCreate(db, body.table)
          : await schema.mysqlCreate(db, body.table, String(body.database ?? ''));
      } finally { await db.close(); }
    },
    async 'schema.rowCounts'(_req, body) {
      const { profile, db } = await withProfile(body.profileId);
      try {
        return profile.type === 'sqlite'
          ? await schema.sqliteRowCounts(db, body.tables)
          : await schema.mysqlRowCounts(db, body.tables, String(body.database ?? ''));
      } finally { await db.close(); }
    },

    async 'query.preview'(_req, body) {
      await withProfile(body.profileId).then(async ({ db }) => { await db.close(); });
      const { sql, warnings } = assembleQuery(body, { forPreview: true });
      return { sql, warnings };
    },
    async 'query.execute'(req, body) {
      const { db } = await withProfile(body.profileId);
      try {
        const { sql } = assembleQuery(body, { forPreview: false });
        const key = String(req.headers['x-tab-id'] || '').replace(/[^\w-]/g, '').slice(0, 40);
        if (db.kind === 'mysql') active.set(key, { threadId: db.threadId });
        return await runSelect(db, sql, req.headers['x-tab-id']);
      } finally {
        await db.close();
      }
    },
    async 'query.executeRaw'(req, body) {
      const sql = String(body.sql ?? '').trim();
      if (sql === '') throw new HttpError('sql is required.', 400);
      const { db } = await withProfile(body.profileId);
      try { return await runSelect(db, sql, req.headers['x-tab-id']); }
      finally { await db.close(); }
    },
    async 'query.parseFromSQL'(_req, body) {
      const sql = String(body.sql ?? '').trim();
      if (sql === '') throw new HttpError('sql is required.', 400);
      const { profile, db } = await withProfile(body.profileId);
      const cleanSql = sql.replace(/^\s*EXPLAIN\s+/i, '');
      assertSingleRead(cleanSql);
      try {
        await db.query(`EXPLAIN ${cleanSql}`);
        const parsed = parseSql(cleanSql);
        for (const table of parsed.tables) {
          if (table.isSubquery) continue;
          try {
            const columns = profile.type === 'sqlite'
              ? await schema.sqliteColumns(db, table.name).catch(() => [])
              : await schema.mysqlColumns(db, table.name, String(table.database ?? ''));
            if (columns.length) table.columns = columns;
          } catch { /* keep empty columns */ }
        }
        return parsed;
      } catch (err) {
        if (err instanceof HttpError) throw err;
        throw new HttpError(`Query validation failed: ${err.message}`, 400);
      } finally {
        await db.close();
      }
    },

    async 'context.save'(_req, body) { return { data: contexts.save(body.name, body.context), message: 'Context saved.' }; },
    async 'context.load'(_req, body) { return contexts.load(body.id); },
    async 'context.list'() { return contexts.list(); },
    async 'context.delete'(_req, body) { contexts.delete(body.id); return { data: null, message: 'Context deleted.' }; },
    async 'context.rename'(_req, body) { return { data: contexts.rename(body.id, body.name), message: 'Context renamed.' }; },
    async 'context.update'(_req, body) { return { data: contexts.update(body.id, body.name, body.context), message: 'Context updated.' }; },

    async 'about.read'() { return { content: ABOUT }; },

    async 'timestamp.convert'(_req, body) {
      const direction = String(body.direction ?? '');
      if (direction !== 'to_datetime' && direction !== 'to_unix') {
        throw new HttpError('direction must be "to_datetime" or "to_unix".', 400);
      }
      const value = String(body.value ?? '');
      if (value === '') throw new HttpError('value is required.', 400);
      if (value.length > 64) throw new HttpError('value is too long (max 64 chars).', 400);
      if (!/^[\d\s\-:.T+Z]+$/.test(value)) throw new HttpError('value contains invalid characters.', 400);
      const { db } = await withProfile(body.profileId);
      if (db.kind !== 'mysql') {
        await db.close();
        throw new HttpError('Timestamp conversion requires a MySQL connection.', 400);
      }
      try {
        const trimmed = value.trim();
        const sql = direction === 'to_datetime'
          ? (Number.isFinite(Number(trimmed)) && trimmed !== ''
            ? 'SELECT FROM_UNIXTIME(?) AS result'
            : 'SELECT FROM_UNIXTIME(UNIX_TIMESTAMP(?)) AS result')
          : 'SELECT UNIX_TIMESTAMP(?) AS result';
        const [rows] = await db.conn.execute(sql, [trimmed]);
        const row = rows[0];
        const result = Array.isArray(row) ? row[0] : row?.result ?? null;
        return { result };
      } catch (err) {
        throw new HttpError(`MySQL error: ${err.message}`, 400);
      } finally {
        await db.close();
      }
    },
  };

  async function handleApi(req, body) {
    const action = new URL(req.url, 'http://local').searchParams.get('action') || '';
    if (!action) throw new HttpError('No action specified.', 400);
    const handler = routes[action];
    if (!handler) throw new HttpError(`Unknown action: ${action}`, 404);
    const result = await handler(req, body);
    if (result && typeof result === 'object' && Object.prototype.hasOwnProperty.call(result, 'message') && Object.prototype.hasOwnProperty.call(result, 'data')) {
      return { success: true, message: result.message, data: result.data };
    }
    return { success: true, message: '', data: result };
  }

  async function handleCancel(req, body) {
    const key = String(req.headers['x-tab-id'] || '').replace(/[^\w-]/g, '').slice(0, 40);
    const running = active.get(key);
    if (!running) return { status: 200, body: { success: false, message: 'No active query found.' } };
    const profileId = String(body.profileId ?? '');
    if (!profileId) return { status: 200, body: { success: false, message: 'profileId is required.' } };
    const profile = profiles.get(profileId);
    if (!profile) return { status: 200, body: { success: false, message: 'Profile not found.' } };
    let db;
    try {
      db = await openDb(profile);
      await db.exec(`KILL QUERY ${Number(running.threadId)}`);
      return { status: 200, body: { success: true } };
    } catch (err) {
      return { status: 200, body: { success: false, message: err.message } };
    } finally {
      await db?.close();
    }
  }

  return { handleApi, handleCancel, profiles, contexts };
}

export function publicDir() {
  return path.resolve(here, '../public');
}

export function readAboutFile() {
  const file = path.resolve(here, '../../app/about.php');
  if (!fs.existsSync(file)) return ABOUT;
  return ABOUT;
}
