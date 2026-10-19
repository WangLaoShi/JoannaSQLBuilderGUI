import fs from 'node:fs';
import mysql from 'mysql2/promise';

function sqliteType(rows, name) {
  const value = rows.find(row => row[name] != null)?.[name];
  if (typeof value === 'bigint' || (typeof value === 'number' && Number.isInteger(value))) return 'INTEGER';
  if (value instanceof Date) return 'DATETIME';
  return '';
}

function fallbackColumns(sql) {
  const match = sql.match(/^\s*select\s+([\s\S]+?)\s+from\s/i);
  if (!match || match[1].trim() === '*') return [];
  return match[1].split(',').map(part => {
    const alias = part.trim().match(/\bAS\s+`?(\w+)`?\s*$/i);
    if (alias) return alias[1];
    const ident = part.replaceAll('`', '').trim().match(/(\w+)\s*$/);
    return ident ? ident[1] : part.trim();
  });
}

const INT_TYPES = new Set([1, 2, 3, 8, 9, 16]); // TINY SHORT LONG LONGLONG INT24 BIT
const DATE_TYPES = new Set([10, 14]);
const DATETIME_TYPES = new Set([7, 12]);

export async function openDb(profile) {
  if ((profile.type || 'mysql') === 'sqlite') {
    if (!profile.file_path || !fs.existsSync(profile.file_path)) {
      const err = new Error(`unable to open database file: ${profile.file_path || ''}`);
      err.code = 'SQLITE_CANTOPEN';
      throw err;
    }
    const { DatabaseSync } = await import('node:sqlite');
    const db = new DatabaseSync(profile.file_path);
    return {
      kind: 'sqlite',
      db,
      async query(sql) {
        const trimmed = sql.trim();
        const isRead = /^(select|pragma|explain|with)\b/i.test(trimmed);
        if (!isRead) {
          throw new Error('Only a read query can be executed.');
        }
        const stmt = db.prepare(sql);
        const objects = stmt.all();
        const names = objects.length ? Object.keys(objects[0]) : fallbackColumns(sql);
        return {
          rows: objects.map(row => names.map(name => row[name])),
          fields: names.map(name => ({ name, table: '', type: sqliteType(objects, name) })),
        };
      },
      async exec(sql) { db.exec(sql); },
      async close() { db.close(); },
    };
  }

  const conn = await mysql.createConnection({
    host: profile.host,
    port: Number(profile.port || 3306),
    user: profile.user,
    password: profile.password ?? '',
    database: profile.database || undefined,
    charset: 'utf8mb4',
    connectTimeout: 5000,
    multipleStatements: false,
    rowsAsArray: true,
    dateStrings: true,
  });
  await conn.query("SET NAMES 'utf8mb4'");
  return {
    kind: 'mysql',
    conn,
    threadId: conn.threadId,
    async query(sql) {
      const [rows, fields] = await conn.query(sql);
      return firstResult(rows, fields);
    },
    async exec(sql) { await conn.query(sql); },
    async close() { await conn.end(); },
  };
}

function firstResult(rows, fields) {
  const multi = Array.isArray(fields) && fields.length > 0 && Array.isArray(fields[0]);
  if (!multi) return { rows: rows || [], fields: fields || [] };
  for (let i = 0; i < fields.length; i++) {
    if (fields[i]?.length) return { rows: rows[i] || [], fields: fields[i] };
  }
  return { rows: [], fields: [] };
}

export function normaliseColType(field) {
  if (!field) return '';
  if (field.columnType != null) {
    const t = field.columnType;
    if (INT_TYPES.has(t)) return 'INT';
    if (DATE_TYPES.has(t)) return 'DATE';
    if (DATETIME_TYPES.has(t)) return 'DATETIME';
    return '';
  }
  const name = String(field.type || '').toUpperCase();
  if (['INTEGER', 'INT', 'TINYINT', 'SMALLINT', 'BIGINT'].includes(name)) return 'INT';
  if (name === 'DATE') return 'DATE';
  if (name === 'DATETIME' || name === 'TIMESTAMP') return 'DATETIME';
  return '';
}

export function projectResult(sql, result) {
  const cols = [];
  const colTables = [];
  const colTypes = [];
  for (let i = 0; i < (result.fields || []).length; i++) {
    const field = result.fields[i];
    cols.push(field.name || `col_${i}`);
    colTables.push(field.orgTable || field.table || '');
    colTypes.push(normaliseColType(field));
  }
  const rows = (result.rows || []).map(row => Array.isArray(row) ? row : Object.values(row));
  return { sql, cols, col_tables: colTables, col_types: colTypes, rows, count: rows.length };
}
