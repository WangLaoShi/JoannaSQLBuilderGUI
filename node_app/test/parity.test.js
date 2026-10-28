import test from 'node:test';
import assert from 'node:assert/strict';
import { assembleQuery, containsVariables } from '../server/query-sql.js';
import { parseSql } from '../server/query-parser.js';

const course = { id: 't1', name: 'course', alias: 'c', order: 1, columns: [{ name: 'c_id' }, { name: 'c_name' }] };

test('single table matches the PHP SELECT layout', () => {
  const { sql, warnings } = assembleQuery({ tables: [course], limit: 10 });
  assert.deepEqual(warnings, []);
  assert.equal(sql, 'SELECT\n\t*\nFROM\n\t`course` c\nLIMIT 10');
});

test('chosen columns are backtick-quoted, values in WHERE stay as typed', () => {
  const { sql } = assembleQuery({
    tables: [course],
    select: ['c.c_name'],
    where: [{ col: 'c.c_name', op: 'LIKE', val: "'猴%'", operator: 'AND', enabled: true }],
    groupBy: ['c.c_name'],
    orderBy: [{ col: 'c.c_id', dir: 'DESC' }],
    limit: 20,
  });
  assert.equal(sql, [
    'SELECT',
    '\tc.`c_name`',
    'FROM',
    '\t`course` c',
    'WHERE',
    "\t    c.c_name LIKE '猴%'",
    'GROUP BY c.c_name',
    'ORDER BY c.c_id DESC',
    'LIMIT 20',
  ].join('\n'));
});

test('joins, having, distinct and a subquery table', () => {
  const student = { id: 's', name: 'student', alias: 's', order: 1 };
  const score = { id: 'sc', name: 'score', alias: 'sc', order: 2 };
  const { sql } = assembleQuery({
    tables: [student, score],
    joins: [{ fromTableId: 's', fromCol: 's_id', toTableId: 'sc', toCol: 's_id', type: 'LEFT', enabled: true }],
    selectDistinct: true,
    having: [{ col: 's.s_id', op: '>', val: '1' }],
    limit: 5,
  });
  assert.match(sql, /^SELECT DISTINCT\n\t\*/);
  assert.match(sql, /LEFT JOIN `score` sc ON s\.`s_id` = sc\.`s_id`/);
  assert.match(sql, /HAVING\n\t    s\.s_id > 1/);

  const sub = assembleQuery({
    tables: [{ id: 'sq', name: 'sq', alias: 'sq', order: 1, isSubquery: true, subquery: 'SELECT id FROM t' }],
    selectCustomExprs: [{ expr: 'COUNT(*)', alias: 'n', enabled: true }],
    selectCustomExprsOrder: 'first',
    limit: 10,
  });
  assert.match(sub.sql, /COUNT\(\*\) AS n,\n\tsq\.\*/);
  assert.match(sub.sql, /FROM\n\t\(SELECT id FROM t\) sq/);
});

test('a trailing semicolon in a subquery is omitted from the outer statement', () => {
  const { sql } = assembleQuery({
    tables: [{
      id: 'sq',
      name: 'sq',
      alias: 's',
      order: 1,
      isSubquery: true,
      subquery: 'SELECT product_type, sale_price FROM product WHERE id = 1;',
    }],
    limit: 10,
  });
  assert.match(sql, /FROM\n\t\(SELECT product_type, sale_price FROM product WHERE id = 1\) s/);
  assert.doesNotMatch(sql, /;/);
});

test('a disconnected second table is a preview warning and an execute error', () => {
  const state = {
    tables: [course, { id: 't2', name: 'teacher', alias: 't', order: 2 }],
    limit: 10,
  };
  const preview = assembleQuery(state, { forPreview: true });
  assert.equal(preview.warnings.length, 1);
  assert.match(preview.warnings[0], /course/);
  assert.throws(() => assembleQuery(state), /Multiple disconnected table groups/);
});

test('HAVING can filter a SELECT aggregate by its alias', () => {
  const { sql } = assembleQuery({
    tables: [course],
    groupBy: ['c.c_name'],
    selectCustomExprs: [{ expr: 'SUM(c.c_id)', alias: 'SUM_PRICE', enabled: true }],
    selectCustomExprsMode: 'only',
    having: [{ col: 'SUM_PRICE', op: '>', val: '600', kind: 'agg' }],
    limit: 10,
  });
  assert.match(sql, /SUM\(c\.c_id\) AS SUM_PRICE/);
  assert.match(sql, /GROUP BY c\.c_name/);
  assert.match(sql, /HAVING\n\t    SUM_PRICE > 600/);
});

test('all rows omit LIMIT and pages use OFFSET', () => {
  assert.doesNotMatch(assembleQuery({ tables: [course], limitMode: 'all', limit: 10 }).sql, /\bLIMIT\b/);
  assert.match(
    assembleQuery({ tables: [course], limitMode: 'page', pageSize: 100, page: 1 }).sql,
    /LIMIT 100$/,
  );
  assert.match(
    assembleQuery({
      tables: [course],
      limitMode: 'page',
      pageSize: 100,
      page: 2,
      orderBy: [{ col: 'c.c_id', dir: 'DESC' }],
    }).sql,
    /ORDER BY c\.c_id DESC\nLIMIT 100 OFFSET 100$/,
  );
  assert.match(
    assembleQuery({ tables: [course], limitMode: 'page', pageSize: 9000, page: 1 }).sql,
    /LIMIT 1000$/,
  );
  const counted = assembleQuery({
    tables: [course],
    limitMode: 'page',
    pageSize: 100,
    page: 2,
    orderBy: [{ col: 'c.c_id', dir: 'DESC' }],
  }, { forCount: true });
  assert.doesNotMatch(counted.sql, /\bLIMIT\b|\bOFFSET\b|\bORDER BY\b/);
  assert.match(counted.sql, /FROM\n\t`course` c/);
  assert.match(assembleQuery({ tables: [course], limit: 10 }).sql, /LIMIT 10$/);
});

test('limit is capped and unsafe identifiers are rejected', () => {
  assert.match(assembleQuery({ tables: [course], limit: 9000 }).sql, /LIMIT 5000/);
  assert.throws(() => assembleQuery({ tables: [{ id: 'x', name: 'bad`name', alias: 'b' }] }), /Invalid table name/);
  assert.match(
    assembleQuery({ tables: [{ id: 'x', name: 'market data', alias: 'md', database: 'task06' }] }).sql,
    /FROM\n\t`task06`\.`market data` md/,
  );
  assert.match(
    assembleQuery({
      tables: [{ id: 'w', name: 'winequality-red', alias: 'w', columns: [{ name: 'fixed acidity' }, { name: 'quality' }] }],
      select: ['w.fixed acidity', 'w.quality'],
      where: [{ col: 'w.fixed acidity', op: '>', val: '7', enabled: true }],
      limit: 10,
    }).sql,
    /SELECT\n\tw\.`fixed acidity`,\n\tw\.`quality`[\s\S]*FROM\n\t`winequality-red` w\nWHERE\n\t    w\.`fixed acidity` > 7/,
  );
  assert.equal(containsVariables('SET @age = 1; SELECT @age'), true);
  assert.equal(containsVariables("SELECT name FROM t WHERE name LIKE 'a@b'"), false);
});

test('parser keeps a simple join visual and forces aggregate HAVING to raw', () => {
  const parsed = parseSql(`
    SELECT s.name, COUNT(*) AS cnt
    FROM student s
    JOIN score sc ON s.id = sc.student_id
    WHERE s.name LIKE '猴%' AND s.id IN (SELECT id FROM dropped)
    GROUP BY s.name
    HAVING COUNT(*) > 1
    ORDER BY s.name DESC
    LIMIT 20
  `);
  assert.equal(parsed.tables.length, 2);
  assert.equal(parsed.tables[0].name, 'student');
  assert.equal(parsed.tables[1].alias, 'sc');
  assert.equal(parsed.joins[0].type, 'INNER');
  assert.equal(parsed.joins[0].fromCol, 'id');
  assert.equal(parsed.joins[0].toCol, 'student_id');
  assert.deepEqual(parsed.groupBy, ['s.name']);
  assert.equal(parsed.groupByRaw, '');
  assert.equal(parsed.havingConditions, null);
  assert.equal(parsed.orderBy[0].dir, 'DESC');
  assert.equal(parsed.limit, 20);
  assert.equal(parsed.whereConditions[0].op, 'LIKE');
  assert.equal(parsed.whereConditions[0].val, "'猴%'");
  assert.equal(parsed.whereConditions[1].type, 'raw');
  assert.match(parsed.whereConditions[1].expr, /SELECT id FROM dropped/);
});

test('a grouped subquery join keeps detail rows and the aggregate column', () => {
  const parsed = parseSql(`
    SELECT P1.product_id, P1.product_name, P1.product_type, P1.sale_price, P2.avg_price
    FROM product AS P1
    INNER JOIN (
      SELECT product_type, AVG(sale_price) AS avg_price
      FROM product
      GROUP BY product_type
    ) AS P2
    ON P1.product_type = P2.product_type
  `);
  assert.equal(parsed.tables[0].alias, 'P1');
  assert.equal(parsed.tables[0].name, 'product');
  assert.equal(parsed.tables[1].isSubquery, true);
  assert.equal(parsed.tables[1].alias, 'P2');
  assert.deepEqual(parsed.tables[1].columns.map(c => c.name), ['product_type', 'avg_price']);
  assert.match(parsed.tables[1].subquery, /AVG\(sale_price\) AS avg_price/);
  assert.equal(parsed.joins[0].type, 'INNER');
  assert.equal(parsed.joins[0].fromCol, 'product_type');
  assert.equal(parsed.joins[0].toCol, 'product_type');
  assert.deepEqual(parsed.select, [
    'P1.product_id', 'P1.product_name', 'P1.product_type', 'P1.sale_price', 'P2.avg_price',
  ]);
  assert.deepEqual(parsed.selectCustomExprs, []);
  assert.deepEqual(parsed.groupBy, []);
});

test('two subquery cards combine with UNION ALL and the outer alias is u', () => {
  const online = {
    id: 'a', name: 'sq1', alias: 'sq1', order: 1, isSubquery: true,
    subquery: "SELECT Merchant_id, SUM(amount) AS sum_\nFROM online\nWHERE Coupon_id != 'fixed';",
    columns: [{ name: 'Merchant_id' }, { name: 'sum_' }],
  };
  const offline = {
    id: 'b', name: 'sq2', alias: 'sq2', order: 2, isSubquery: true,
    subquery: 'SELECT Merchant_id, SUM(amount) AS sum_\nFROM offline',
    columns: [{ name: 'Merchant_id' }, { name: 'sum_' }],
  };
  const { sql, warnings } = assembleQuery({
    tables: [online, offline],
    unions: [{ id: 'u1', fromTableId: 'a', toTableId: 'b', op: 'UNION ALL', enabled: true }],
    select: ['sq1.Merchant_id', 'sq2.sum_'],
    groupBy: ['sq1.Merchant_id'],
    orderBy: [{ col: 'sq1.sum_', dir: 'DESC' }],
    where: [{ col: 'sq1.Merchant_id', op: '!=', val: "''", operator: 'AND', enabled: true }],
    limit: 10,
  });
  assert.deepEqual(warnings, []);
  assert.match(sql, /SELECT\n\tu\.`Merchant_id`,\n\tu\.`sum_`/);
  assert.match(sql, /UNION ALL/);
  assert.doesNotMatch(sql, /JOIN/);
  assert.doesNotMatch(sql, /;/);
  assert.match(sql, /\) u\nWHERE/);
  assert.match(sql, /u\.Merchant_id != ''/);
  assert.match(sql, /GROUP BY u\.Merchant_id/);
  assert.match(sql, /ORDER BY u\.sum_ DESC/);
  assert.match(sql, /Coupon_id != 'fixed'/);

  const distinct = assembleQuery({
    tables: [online, offline],
    unions: [{ fromTableId: 'a', toTableId: 'b', op: 'UNION', enabled: true }],
    limit: 10,
  });
  assert.match(distinct.sql, /\tUNION\n/);
  assert.doesNotMatch(distinct.sql, /UNION ALL/);
});

test('a union group rejects a join, a column-count mismatch, and a cycle shape', () => {
  const card = (id, alias, cols) => ({
    id, name: alias, alias, order: 1, isSubquery: true,
    subquery: 'SELECT 1 AS n',
    columns: cols,
  });
  const base = {
    tables: [card('a', 'a', [{ name: 'n' }]), card('b', 'b', [{ name: 'n' }, { name: 'm' }])],
    unions: [{ fromTableId: 'a', toTableId: 'b', op: 'UNION ALL' }],
    limit: 10,
  };
  assert.throws(() => assembleQuery(base), /same number of columns/);
  assert.throws(() => assembleQuery({
    tables: [card('a', 'a', []), card('b', 'b', [])],
    joins: [{ fromTableId: 'a', fromCol: 'n', toTableId: 'b', toCol: 'n', type: 'INNER', enabled: true }],
    unions: [{ fromTableId: 'a', toTableId: 'b', op: 'UNION ALL' }],
    limit: 10,
  }), /cannot also contain a join/);
});

test('SJ-014: frontend and backend preserve SELECT quoted commas', async () => {
  const { readFileSync } = await import('node:fs');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { runInNewContext } = await import('node:vm');
  const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)),
    '../public/assets/js/config.js'), 'utf8');
  const front = runInNewContext(source + '\nQueryPanel', {
    document: { addEventListener() {} }, window: {},
    State: { tables: [], joins: [], columnOrder: [], selectAliases: {} },
    App: { computeIslands: tables => [tables.map(table => table.id)] },
  }, { filename: 'config.js', timeout: 5000 });
  const cases = [
    ["'A,B' AS label", "'A,B' AS label"],
    ["c.c_id, 'A,B' AS label", "'A,B' AS label"],
    ["'It''s,a' AS label, c.c_id", "'It''s,a' AS label"],
    ["c.`last,first` AS label, c.c_id", 'c.`last,first` AS label'],
    ["COALESCE(c.c_name, 'A,B') AS label, c.c_id", "COALESCE(c.c_name, 'A,B') AS label"],
    ["ROW_NUMBER() OVER (PARTITION BY c.c_id ORDER BY c.c_id) AS rn, c.c_id", 'ROW_NUMBER() OVER'],
  ];
  for (const [raw, atom] of cases) for (const sortAlpha of [false, true]) {
    const state = {
      tables: [course], joins: [], unions: [], select: [], columnOrder: [],
      selectedIslandKey: 't1',
      selectMode: 'raw', selectRaw: raw, selectSortAlpha: sortAlpha,
      selectAddDelimiter: false, selectDistinct: false,
      selectAliases: {}, selectCustomExprs: [], selectCustomExprsMode: 'exclude',
      where: [], groupBy: [], having: [], orderBy: [], limit: 10,
    };
    const preview = front.buildSQL(state).split('\nFROM\n')[0];
    const executed = assembleQuery(state).sql.split('\nFROM\n')[0];
    assert.equal(preview, executed, `SELECT mismatch for ${JSON.stringify(raw)}`);
    assert.ok(executed.includes(atom), `SELECT lost ${JSON.stringify(atom)}`);
  }
});
