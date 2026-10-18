import { HttpError } from './errors.js';

const SYSTEM_DBS = new Set(['information_schema', 'performance_schema', 'mysql', 'sys']);

function assertIdent(value, label) {
  if (!/^\w+$/.test(String(value))) throw new HttpError(`Invalid ${label}.`, 400);
}

function shortType(type) {
  return String(type || '').replace(/\(.*\)/, '').toLowerCase();
}

export async function mysqlDatabases(db) {
  const { rows } = await db.query('SHOW DATABASES');
  const names = rows.map(r => String(r[0])).filter(name => !SYSTEM_DBS.has(name.toLowerCase()));
  names.sort();
  return names;
}

export async function mysqlTables(db, database) {
  if (database && !/^\w+$/.test(database)) throw new HttpError('Invalid database name.', 400);
  if (!database) {
    const { rows } = await db.query('SELECT DATABASE()');
    database = rows[0]?.[0] ? String(rows[0][0]) : '';
  }
  if (!database) throw new HttpError('No database selected.', 400);
  const { rows } = await db.query(
    `SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES WHERE TABLE_SCHEMA = ${db.conn.escape(database)} AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME`
  );
  return rows.map(r => ({ name: r[0], rows: Number(r[1] ?? 0) }));
}

export async function mysqlColumns(db, table, database = '') {
  if (!table) throw new HttpError('table is required.', 400);
  assertIdent(table, 'table name');
  if (database) assertIdent(database, 'database name');
  const ref = database ? `\`${database}\`.\`${table}\`` : `\`${table}\``;
  const { rows } = await db.query(`DESCRIBE ${ref}`);
  return rows.map(col => ({
    name: col[0],
    type: col[1],
    shortType: shortType(col[1]),
    nullable: col[2] === 'YES',
    key: col[3],
    default: col[4],
    extra: col[5],
  }));
}

export async function mysqlCreate(db, table, database = '') {
  if (!table) throw new HttpError('table is required.', 400);
  assertIdent(table, 'table name');
  if (database) assertIdent(database, 'database name');
  const ref = database ? `\`${database}\`.\`${table}\`` : `\`${table}\``;
  const { rows } = await db.query(`SHOW CREATE TABLE ${ref}`);
  let ddl = rows[0]?.[1] ?? '';
  if (database && ddl) ddl = ddl.replace(/^(CREATE TABLE\s+)`/, `$1\`${database}\`.\``);
  return { ddl };
}

export async function mysqlRowCounts(db, tables, database = '') {
  if (!Array.isArray(tables) || !tables.length) throw new HttpError('tables array is required.', 400);
  for (const t of tables) {
    if (!/^\w+$/.test(String(t))) throw new HttpError(`Invalid table name: ${t}`, 400);
  }
  if (database && !/^\w+$/.test(database)) throw new HttpError('Invalid database name.', 400);
  if (!database) {
    const { rows } = await db.query('SELECT DATABASE()');
    database = rows[0]?.[0] ? String(rows[0][0]) : '';
  }
  if (!database) throw new HttpError('No database selected.', 400);
  const list = tables.map(t => db.conn.escape(String(t))).join(',');
  const { rows } = await db.query(
    `SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES WHERE TABLE_SCHEMA = ${db.conn.escape(database)} AND TABLE_NAME IN (${list})`
  );
  const counts = {};
  for (const row of rows) counts[row[0]] = Number(row[1] ?? 0);
  return counts;
}

export async function sqliteDatabases() {
  return ['main'];
}

export async function sqliteTables(db) {
  const { rows } = await db.query("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
  return rows.map(r => ({ name: r[0], rows: 0 }));
}

export async function sqliteColumns(db, table) {
  if (!table) throw new HttpError('table is required.', 400);
  assertIdent(table, 'table name');
  const { rows } = await db.query(`PRAGMA table_info("${table}")`);
  if (!rows.length) throw new HttpError(`Table '${table}' not found.`, 404);
  return rows.map(col => ({
    name: col[1],
    type: col[2],
    shortType: shortType(col[2]),
    nullable: Number(col[3]) === 0,
    key: Number(col[5]) === 1 ? 'PRI' : '',
    default: col[4],
    extra: '',
  }));
}

export async function sqliteCreate(db, table) {
  if (!table) throw new HttpError('table is required.', 400);
  assertIdent(table, 'table name');
  const { rows } = await db.query(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = '${table.replaceAll("'", "''")}'`);
  if (!rows.length || rows[0][0] == null) throw new HttpError(`Table '${table}' not found.`, 404);
  return { ddl: rows[0][0] };
}

export async function sqliteRowCounts(db, tables) {
  if (!Array.isArray(tables) || !tables.length) throw new HttpError('tables array is required.', 400);
  const counts = {};
  for (const table of tables) {
    if (!/^\w+$/.test(String(table))) throw new HttpError(`Invalid table name: ${table}`, 400);
    const { rows } = await db.query(`SELECT COUNT(*) FROM "${table}"`);
    counts[table] = Number(rows[0]?.[0] ?? 0);
  }
  return counts;
}
