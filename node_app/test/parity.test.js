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

test('limit is capped and unsafe identifiers are rejected', () => {
  assert.match(assembleQuery({ tables: [course], limit: 9000 }).sql, /LIMIT 5000/);
  assert.throws(() => assembleQuery({ tables: [{ id: 'x', name: 'bad-name', alias: 'b' }] }), /Invalid table name/);
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
