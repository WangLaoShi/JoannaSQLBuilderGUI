import test from 'node:test';
import assert from 'node:assert/strict';
import { splitStatements, statementAt, completionTarget, aliasMap, quoteIdent, isRunnable, cteNames } from '../server/sql-script.js';
import { assertSingleRead } from '../server/query-sql.js';

const marketScript = `SELECT * FROM \`market data\`;

SELECT MAX(END_DATE) FROM \`market data\`;

SELECT
  TYPE_NAME_CN AS '行业',
  SUM(MARKET_VALUE) AS '市值'
FROM \`market data\`
WHERE END_DATE = '2018-05-31'
GROUP BY TYPE_NAME_CN
ORDER BY 市值 DESC
LIMIT 3;


(SELECT
  TICKER_SYMBOL,
  MARKET_VALUE AS '市值'
FROM \`market data\`
WHERE END_DATE = '2018-05-31' AND TYPE_NAME_CN = '银行'
ORDER BY 市值 DESC
LIMIT 3)

UNION ALL

(SELECT
  TICKER_SYMBOL,
  MARKET_VALUE AS '市值'
FROM \`market data\`
WHERE END_DATE = '2018-05-31' AND TYPE_NAME_CN = '医药生物'
ORDER BY 市值 DESC
LIMIT 3)

UNION ALL

(SELECT
  TICKER_SYMBOL,
  MARKET_VALUE AS '市值'
FROM \`market data\`
WHERE END_DATE = '2018-05-31' AND TYPE_NAME_CN = '非银金融'
ORDER BY 市值 DESC
LIMIT 3
)
  ;


-- WITH 的做法
WITH
TYPE3 AS (
  SELECT
    TYPE_NAME_CN AS '行业',
    SUM(MARKET_VALUE) AS '市值'
  FROM \`market data\`
  WHERE END_DATE = '2018-05-31'
  GROUP BY TYPE_NAME_CN
  ORDER BY 市值 DESC
  LIMIT 3
),

TYPE3_COMPANY AS (
  SELECT *
  FROM TYPE3  AS T3
    INNER JOIN \`market data\`  AS MD ON T3.\`行业\` = MD.TYPE_NAME_CN
),

RANKED_DATA AS(
  SELECT
    TC.\`TICKER_SYMBOL\`,
    TC.\`行业\`,
    ROW_NUMBER() OVER(PARTITION BY TC.\`行业\` ORDER BY TC.\`MARKET_VALUE\` DESC) AS ROW_NUM
  FROM TYPE3_COMPANY AS TC
)

SELECT *
FROM RANKED_DATA AS RD
WHERE RD.ROW_NUM <=3
`;

const script = [
  'SELECT * FROM `market data`;',
  '',
  "SELECT MAX(END_DATE) FROM `market data`;",
  '',
  'SELECT TYPE_NAME_CN FROM `market data` WHERE END_DATE = \'2018-05-31;keep\' LIMIT 3;',
  '',
  '(SELECT TICKER_SYMBOL FROM `market data` WHERE TYPE_NAME_CN = \'银行\' LIMIT 3)',
  'UNION ALL',
  '(SELECT TICKER_SYMBOL FROM `market data` WHERE TYPE_NAME_CN = \'医药生物\' LIMIT 3);',
].join('\n');

test('a script splits on semicolons and keeps UNION ALL together', () => {
  const parts = splitStatements(script);
  assert.equal(parts.length, 4);
  assert.match(parts[0].text, /^SELECT \* FROM `market data`$/);
  assert.match(parts[2].text, /2018-05-31;keep/);
  assert.match(parts[3].text, /UNION ALL/);
  assert.doesNotMatch(parts[3].text, /SELECT \*/);
});

test('the cursor picks the statement it sits in', () => {
  const second = script.indexOf('SELECT MAX');
  assert.match(statementAt(script, second + 3).text, /^SELECT MAX/);
  const union = script.indexOf('UNION ALL');
  assert.match(statementAt(script, union + 2).text, /UNION ALL/);
});

test('FROM offers tables and a dotted alias offers columns', () => {
  const stmt = 'SELECT t.TI FROM `market data` t WHERE ';
  const fromTables = completionTarget('SELECT * FROM mar', 'SELECT * FROM mar'.length);
  assert.equal(fromTables.kind, 'tables');
  assert.equal(fromTables.prefix, 'mar');

  const afterFrom = completionTarget('SELECT * FROM ', 'SELECT * FROM '.length);
  assert.equal(afterFrom.kind, 'tables');
  assert.equal(afterFrom.prefix, '');

  const cols = completionTarget(stmt, 'SELECT t.TI'.length);
  assert.equal(cols.kind, 'columns');
  assert.equal(cols.name, 't');
  assert.equal(cols.prefix, 'TI');

  const map = aliasMap(stmt);
  assert.equal(map.get('t'), 'market data');
  assert.equal(map.get('market data'), 'market data');
});

test('the market-data script is five read statements and keeps CTE names', () => {
  const parts = splitStatements(marketScript);
  assert.equal(parts.length, 5);
  assert.match(parts[0].text, /^SELECT \*/);
  assert.match(parts[1].text, /^SELECT MAX/);
  assert.match(parts[2].text, /GROUP BY TYPE_NAME_CN/);
  assert.match(parts[3].text, /^\(SELECT/);
  assert.match(parts[3].text, /UNION ALL/);
  assert.match(parts[3].text, /非银金融/);
  assert.match(parts[4].text, /WITH/);
  assert.match(parts[4].text, /ROW_NUMBER/);
  assert.deepEqual(cteNames(parts[4].text), ['TYPE3', 'TYPE3_COMPANY', 'RANKED_DATA']);
  for (const part of parts) assert.doesNotThrow(() => assertSingleRead(part.text));
  assert.throws(() => assertSingleRead('(DELETE FROM t)'), /read query/);
});

test('names with a space or hyphen are backtick-quoted', () => {
  assert.equal(quoteIdent('market data'), '`market data`');
  assert.equal(quoteIdent('winequality-red'), '`winequality-red`');
  assert.equal(quoteIdent('TICKER_SYMBOL'), 'TICKER_SYMBOL');
  assert.equal(isRunnable('-- only a comment'), false);
  assert.equal(isRunnable("SELECT 'a;b'"), true);
});
