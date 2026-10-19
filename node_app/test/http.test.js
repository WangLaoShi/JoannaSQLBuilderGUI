import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { startServer } from '../server/index.js';
import { APP_VERSION } from '../server/version.js';

async function post(port, action, body = {}, headers = {}) {
  const res = await fetch(`http://127.0.0.1:${port}/api.php?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return { status: res.status, json };
}

test('profiles hide passwords, contexts round-trip, and the page is served', async () => {
  const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sqljoiner-'));
  const started = await startServer({ port: 0, storageDir });
  try {
    const page = await fetch(`http://127.0.0.1:${started.port}/`);
    const html = await page.text();
    assert.equal(page.status, 200);
    assert.match(html, /i18n\.js/);
    assert.match(html, /tabbar/);
    assert.match(html, new RegExp(`SQL Joiner ${APP_VERSION}`));
    assert.doesNotMatch(html, /__APP_VERSION__/);

    const appPage = await fetch(`http://127.0.0.1:${started.port}/index.php?tab=1`);
    const appHtml = await appPage.text();
    assert.match(appHtml, /btn-run-query/);
    assert.match(appHtml, new RegExp(`id="app-version">${APP_VERSION}`));
    assert.doesNotMatch(appHtml, /__APP_VERSION__/);

    const empty = await post(started.port, 'profile.list');
    assert.equal(empty.json.success, true);
    assert.deepEqual(empty.json.data, []);

    const saved = await post(started.port, 'profile.save', {
      name: 'School', type: 'mysql', host: '127.0.0.1', port: 3306,
      database: 'school', user: 'student', password: 'secret-value',
    });
    assert.equal(saved.json.data.password, '');
    const listed = await post(started.port, 'profile.list');
    assert.equal(listed.json.data[0].password, '');
    assert.equal(JSON.parse(fs.readFileSync(path.join(storageDir, 'profiles.json'), 'utf8'))[0].password, 'secret-value');

    const kept = await post(started.port, 'profile.save', { id: saved.json.data.id, name: 'School', type: 'mysql', host: '127.0.0.1', database: 'school', user: 'student', password: '' });
    assert.equal(kept.json.success, true);
    assert.equal(JSON.parse(fs.readFileSync(path.join(storageDir, 'profiles.json'), 'utf8'))[0].password, 'secret-value');

    const ctx = await post(started.port, 'context.save', { name: '按班级', context: { tables: [{ name: 'student' }] } });
    assert.equal(ctx.json.success, true);
    const loaded = await post(started.port, 'context.load', { id: ctx.json.data.id });
    assert.equal(loaded.json.data.tables[0].name, 'student');
    const renamed = await post(started.port, 'context.rename', { id: ctx.json.data.id, name: '按班级-改' });
    assert.equal(renamed.json.data.name, '按班级-改');
    await post(started.port, 'context.delete', { id: ctx.json.data.id });
    const missing = await post(started.port, 'context.load', { id: ctx.json.data.id });
    assert.equal(missing.status, 404);

    const unknown = await post(started.port, 'no.such');
    assert.equal(unknown.status, 404);
    const noProfile = await post(started.port, 'query.preview', { tables: [{ id: 't', name: 'course', alias: 'c' }] });
    assert.equal(noProfile.json.success, false);
    assert.match(noProfile.json.message, /profileId/);
  } finally {
    started.server.close();
    fs.rmSync(storageDir, { recursive: true, force: true });
  }
});

test('sqlite profile can list tables, run a query, and import SQL', async () => {
  const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sqljoiner-'));
  const dbFile = path.join(storageDir, 'school.db');
  const db = new DatabaseSync(dbFile);
  db.exec("CREATE TABLE course (c_id INTEGER PRIMARY KEY, c_name TEXT); INSERT INTO course (c_id, c_name) VALUES (1, '语文'), (2, '数学');");
  db.close();

  const started = await startServer({ port: 0, storageDir });
  try {
    const saved = await post(started.port, 'profile.save', { name: '本地', type: 'sqlite', file_path: dbFile });
    const id = saved.json.data.id;
    const tested = await post(started.port, 'profile.test', { id });
    assert.equal(tested.json.success, true, tested.json.message);

    const tables = await post(started.port, 'schema.tables', { profileId: id });
    assert.deepEqual(tables.json.data, [{ name: 'course', rows: 0 }]);
    const cols = await post(started.port, 'schema.columns', { profileId: id, table: 'course' });
    assert.equal(cols.json.data[1].name, 'c_name');
    assert.equal(cols.json.data[0].key, 'PRI');

    const ran = await post(started.port, 'query.executeRaw', { profileId: id, sql: 'SELECT c_name FROM course ORDER BY c_id' });
    assert.equal(ran.json.success, true, ran.json.message);
    assert.deepEqual(ran.json.data.rows, [['语文'], ['数学']]);
    assert.deepEqual(ran.json.data.cols, ['c_name']);

    const built = await post(started.port, 'query.execute', {
      profileId: id,
      tables: [{ id: 't1', name: 'course', alias: 'c', order: 1, columns: cols.json.data }],
      select: ['c.c_name'],
      where: [{ col: 'c.c_id', op: '=', val: '1', operator: 'AND', enabled: true }],
      limit: 10,
    });
    assert.equal(built.json.success, true, built.json.message);
    assert.deepEqual(built.json.data.rows, [['语文']]);
    assert.match(built.json.data.sql, /c\.`c_name`/);

    const parsed = await post(started.port, 'query.parseFromSQL', {
      profileId: id,
      sql: "SELECT c_name FROM course c WHERE c.c_id = 1",
    });
    assert.equal(parsed.json.success, true, parsed.json.message);
    assert.equal(parsed.json.data.tables[0].name, 'course');
    assert.equal(parsed.json.data.tables[0].columns.length, 2);
    assert.equal(parsed.json.data.whereConditions[0].op, '=');
  } finally {
    started.server.close();
    fs.rmSync(storageDir, { recursive: true, force: true });
  }
});
