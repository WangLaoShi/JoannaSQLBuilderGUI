/**
 * SQL → canvas parser, ported from app/src/Query/QueryParser.php.
 * parseSql() does not need a database. The HTTP route still EXPLAINs first,
 * matching the PHP handler.
 */
import crypto from 'node:crypto';

function hid(prefix, bytes) {
  return prefix + crypto.randomBytes(bytes).toString('hex');
}

function isAlnum(ch) {
  return !!ch && /[A-Za-z0-9]/.test(ch);
}

function wordBoundary(upper, i, kwLen) {
  const after = i + kwLen;
  const charAfter = after < upper.length ? upper[after] : ' ';
  if (isAlnum(charAfter) || charAfter === '_') return false;
  const charBefore = i > 0 ? upper[i - 1] : ' ';
  if (isAlnum(charBefore) || charBefore === '_') return false;
  return true;
}

export function stripComments(sql) {
  return sql.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/--[^\n]*/g, ' ').trim();
}

export function findTopLevelKeywords(sql, keywords) {
  const found = [];
  const upper = sql.toUpperCase();
  let depth = 0;
  let inString = false;
  let strChar = '';
  let i = 0;
  while (i < sql.length) {
    if (!inString && (sql[i] === "'" || sql[i] === '"')) {
      inString = true; strChar = sql[i]; i++; continue;
    }
    if (inString) {
      if (sql[i] === strChar) {
        if (i + 1 < sql.length && sql[i + 1] === strChar) { i += 2; continue; }
        inString = false;
      }
      i++; continue;
    }
    if (sql[i] === '`') {
      let j = i + 1;
      while (j < sql.length && sql[j] !== '`') j++;
      i = j + 1; continue;
    }
    if (sql[i] === '(') { depth++; i++; continue; }
    if (sql[i] === ')') { depth--; i++; continue; }
    if (depth === 0) {
      let matched = false;
      for (const kw of keywords) {
        if (upper.slice(i, i + kw.length) !== kw) continue;
        if (!wordBoundary(upper, i, kw.length)) continue;
        found.push([kw, i, i + kw.length]);
        i += kw.length;
        matched = true;
        break;
      }
      if (matched) continue;
    }
    i++;
  }
  return found;
}

export function splitSections(sql) {
  const sectionMap = {
    SELECT: 'select', FROM: 'from', WHERE: 'where', 'GROUP BY': 'groupby',
    HAVING: 'having', 'ORDER BY': 'orderby', LIMIT: 'limit',
  };
  const positions = findTopLevelKeywords(sql, Object.keys(sectionMap))
    .sort((a, b) => a[1] - b[1]);
  const sections = {};
  for (let i = 0; i < positions.length; i++) {
    const [kw, , kwEnd] = positions[i];
    const nextStart = positions[i + 1] ? positions[i + 1][1] : sql.length;
    sections[sectionMap[kw]] = sql.slice(kwEnd, nextStart).trim();
  }
  return sections;
}

function splitByTopLevelComma(text) {
  const parts = [];
  let depth = 0;
  let inString = false;
  let strChar = '';
  let cur = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (!inString && (ch === "'" || ch === '"')) {
      inString = true; strChar = ch; cur += ch; continue;
    }
    if (inString) {
      cur += ch;
      if (ch === strChar) {
        if (i + 1 < text.length && text[i + 1] === strChar) { cur += text[++i]; continue; }
        inString = false;
      }
      continue;
    }
    if (ch === '(') { depth++; cur += ch; continue; }
    if (ch === ')') { depth--; cur += ch; continue; }
    if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim() !== '') parts.push(cur);
  return parts;
}

function extractExprAndAlias(text) {
  text = text.trim();
  const upper = text.toUpperCase();
  let depth = 0;
  let inString = false;
  let strChar = '';
  let lastAs = -1;
  let lastAsEnd = -1;
  let i = 0;
  while (i < text.length) {
    if (!inString && (text[i] === "'" || text[i] === '"')) {
      inString = true; strChar = text[i]; i++; continue;
    }
    if (inString) {
      if (text[i] === strChar) {
        if (i + 1 < text.length && text[i + 1] === strChar) { i += 2; continue; }
        inString = false;
      }
      i++; continue;
    }
    if (text[i] === '(') { depth++; i++; continue; }
    if (text[i] === ')') { depth--; i++; continue; }
    if (depth === 0 && upper.slice(i, i + 2) === 'AS' && wordBoundary(upper, i, 2)) {
      lastAs = i;
      lastAsEnd = i + 2;
    }
    i++;
  }
  if (lastAs !== -1) {
    const expr = text.slice(0, lastAs).trim();
    const alias = text.slice(lastAsEnd).replaceAll('`', '').trim();
    if (/^\w+$/.test(alias)) return [expr, alias];
  }
  return [text, ''];
}

function parseSelect(text, tables) {
  const rawText = text.trim();
  const parts = splitByTopLevelComma(text);
  const cols = [];
  const selectAliases = {};
  const customExprs = [];
  const soleAlias = tables.length === 1 ? (tables[0].alias || tables[0].name || null) : null;
  const literals = new Set(['NULL', 'TRUE', 'FALSE', 'DEFAULT']);
  for (let part of parts) {
    part = part.trim();
    if (part === '') continue;
    const cleanForStar = part.replaceAll('`', '').trim().toUpperCase();
    if (cleanForStar === '*') continue;
    const clean = part.replaceAll('`', '');
    let m = clean.match(/^(\w+)\.(\w+)(?:\s+AS\s+(\w+))?$/i);
    if (m) {
      const key = `${m[1].toLowerCase()}.${m[2]}`;
      cols.push(key);
      if (m[3]) selectAliases[key] = m[3];
      continue;
    }
    m = clean.match(/^(\w+)(?:\s+AS\s+(\w+))?$/i);
    if (soleAlias && m && !/^\d+$/.test(m[1]) && !literals.has(m[1].toUpperCase())) {
      const key = `${soleAlias.toLowerCase()}.${m[1]}`;
      cols.push(key);
      if (m[2]) selectAliases[key] = m[2];
      continue;
    }
    const [expr, alias] = extractExprAndAlias(part);
    customExprs.push({ id: hid('cx_', 4), expr, alias, label: alias, enabled: true });
  }
  return [cols, rawText, selectAliases, customExprs];
}

function splitByJoin(text) {
  const joinKeywords = [
    'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN',
    'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'CROSS JOIN', 'FULL JOIN', 'JOIN',
  ];
  const parts = [];
  const upper = text.toUpperCase();
  let depth = 0;
  let inString = false;
  let strChar = '';
  let start = 0;
  let curJoin = null;
  let i = 0;
  while (i < text.length) {
    if (!inString && (text[i] === "'" || text[i] === '"')) {
      inString = true; strChar = text[i]; i++; continue;
    }
    if (inString) {
      if (text[i] === strChar) {
        if (i + 1 < text.length && text[i + 1] === strChar) { i += 2; continue; }
        inString = false;
      }
      i++; continue;
    }
    if (text[i] === '(') { depth++; i++; continue; }
    if (text[i] === ')') { depth--; i++; continue; }
    if (depth === 0) {
      let matched = false;
      for (const jk of joinKeywords) {
        if (upper.slice(i, i + jk.length) !== jk) continue;
        if (!wordBoundary(upper, i, jk.length)) continue;
        parts.push({ text: text.slice(start, i), joinType: curJoin });
        curJoin = jk;
        i += jk.length;
        start = i;
        matched = true;
        break;
      }
      if (matched) continue;
    }
    i++;
  }
  if (start < text.length) parts.push({ text: text.slice(start), joinType: curJoin });
  return parts;
}

function splitOnKeyword(text) {
  const upper = text.toUpperCase();
  let depth = 0;
  let inString = false;
  let strChar = '';
  let i = 0;
  while (i < text.length) {
    if (!inString && (text[i] === "'" || text[i] === '"')) {
      inString = true; strChar = text[i]; i++; continue;
    }
    if (inString) {
      if (text[i] === strChar) {
        if (i + 1 < text.length && text[i + 1] === strChar) { i += 2; continue; }
        inString = false;
      }
      i++; continue;
    }
    if (text[i] === '(') { depth++; i++; continue; }
    if (text[i] === ')') { depth--; i++; continue; }
    if (depth === 0 && upper.slice(i, i + 2) === 'ON' && wordBoundary(upper, i, 2)) {
      return [text.slice(0, i), text.slice(i + 2)];
    }
    i++;
  }
  return [text, ''];
}

function parseSubqueryTableRef(text) {
  let depth = 0;
  let closePos = -1;
  let inString = false;
  let strChar = '';
  for (let i = 0; i < text.length; i++) {
    if (!inString && (text[i] === "'" || text[i] === '"')) {
      inString = true; strChar = text[i]; continue;
    }
    if (inString) {
      if (text[i] === strChar) {
        if (i + 1 < text.length && text[i + 1] === strChar) { i++; continue; }
        inString = false;
      }
      continue;
    }
    if (text[i] === '(') { depth++; continue; }
    if (text[i] === ')') {
      depth--;
      if (depth === 0) { closePos = i; break; }
    }
  }
  if (closePos < 0) return null;
  const subquerySql = text.slice(1, closePos).trim();
  const after = text.slice(closePos + 1).trim();
  const m = after.match(/^(?:AS\s+)?(\w+)$/i);
  if (!m) return null;
  return {
    id: hid('sq_', 5),
    name: m[1],
    alias: m[1],
    database: null,
    columns: [],
    position: null,
    isSubquery: true,
    subquery: subquerySql,
  };
}

function parseTableRef(text) {
  text = text.trim();
  if (text === '') return null;
  if (text[0] === '(') return parseSubqueryTableRef(text);
  text = text.replaceAll('`', '');
  let m = text.match(/^(\w+)\.(\w+)(?:\s+(?:AS\s+)?(\w+))?$/i);
  if (m) {
    return { id: hid('t_', 5), name: m[2], alias: m[3] || m[2], database: m[1], columns: [], position: null };
  }
  m = text.match(/^(\w+)(?:\s+(?:AS\s+)?(\w+))?$/i);
  if (m) {
    return { id: hid('t_', 5), name: m[1], alias: m[2] || m[1], database: null, columns: [], position: null };
  }
  return null;
}

function normaliseJoinType(raw) {
  const up = raw.trim().toUpperCase();
  if (up.includes('LEFT')) return 'LEFT';
  if (up.includes('RIGHT')) return 'RIGHT';
  if (up.includes('CROSS')) return 'CROSS';
  if (up.includes('FULL')) return 'FULL';
  return 'INNER';
}

function parseOnClause(onText, joinType, tables) {
  const clean = onText.replaceAll('`', '');
  const all = [...clean.matchAll(/(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)/gi)];
  if (!all.length) return null;
  const byAlias = Object.fromEntries(tables.map(t => [t.alias.toLowerCase(), t]));
  const primary = all[0];
  const fromTable = byAlias[primary[1].toLowerCase()];
  const toTable = byAlias[primary[3].toLowerCase()];
  if (!fromTable || !toTable) return null;
  const join = {
    id: hid('j_', 5),
    fromTableId: fromTable.id,
    fromCol: primary[2],
    toTableId: toTable.id,
    toCol: primary[4],
    type: joinType,
    extraConditions: [],
  };
  const fromAlias = fromTable.alias.toLowerCase();
  for (let i = 1; i < all.length; i++) {
    const m = all[i];
    if (m[1].toLowerCase() === fromAlias) join.extraConditions.push({ fromCol: m[2], toCol: m[4] });
    else join.extraConditions.push({ fromCol: m[4], toCol: m[2] });
  }
  return join;
}

function hasColumn(columns, name) {
  return columns.some(col => (typeof col === 'object' ? col.name : col) === name);
}

function parseFrom(fromText) {
  const parts = splitByJoin(fromText);
  if (!parts.length) return [[], []];
  const tables = [];
  const joins = [];
  const fromTable = parseTableRef(parts[0].text.trim());
  if (fromTable) {
    fromTable.order = 1;
    tables.push(fromTable);
  }
  for (let i = 1; i < parts.length; i++) {
    const joinType = normaliseJoinType(parts[i].joinType || 'JOIN');
    const [tableRefText, onClause] = splitOnKeyword(parts[i].text.trim());
    const joinTable = parseTableRef(tableRefText.trim());
    if (!joinTable) continue;
    joinTable.order = tables.length + 1;
    tables.push(joinTable);
    if (onClause.trim() !== '') {
      const joinDef = parseOnClause(onClause.trim(), joinType, tables);
      if (joinDef) joins.push(joinDef);
    }
  }
  for (const joinDef of joins) {
    for (const table of tables) {
      if (!table.isSubquery) continue;
      if (table.id === joinDef.fromTableId) {
        const cols = [joinDef.fromCol, ...(joinDef.extraConditions || []).map(ec => ec.fromCol)];
        for (const col of cols) {
          if (col && !hasColumn(table.columns, col)) table.columns.push({ name: col });
        }
      }
      if (table.id === joinDef.toTableId) {
        const cols = [joinDef.toCol, ...(joinDef.extraConditions || []).map(ec => ec.toCol)];
        for (const col of cols) {
          if (col && !hasColumn(table.columns, col)) table.columns.push({ name: col });
        }
      }
    }
  }
  return [tables, joins];
}

function parseGroupBy(text) {
  const parts = splitByTopLevelComma(text);
  const cols = [];
  let hasComplex = false;
  for (let part of parts) {
    part = part.replaceAll('`', '').trim();
    const m = part.match(/^(\w+)\.(\w+)$/i);
    if (m) cols.push(`${m[1].toLowerCase()}.${m[2]}`);
    else hasComplex = true;
  }
  if (hasComplex || !cols.length) return [[], text.trim()];
  return [cols, ''];
}

function parseOrderBy(text) {
  const parts = splitByTopLevelComma(text);
  const cols = [];
  let hasComplex = false;
  for (let part of parts) {
    part = part.replaceAll('`', '').trim();
    const m = part.match(/^(\w+)\.(\w+)(?:\s+(ASC|DESC))?$/i);
    if (m) cols.push({ col: `${m[1].toLowerCase()}.${m[2]}`, dir: m[3] ? m[3].toUpperCase() : 'ASC' });
    else hasComplex = true;
  }
  if (hasComplex || !cols.length) return [[], text.trim()];
  return [cols, ''];
}

function splitByAndOr(text) {
  const parts = [];
  const upper = text.toUpperCase();
  let depth = 0;
  let inString = false;
  let strChar = '';
  let start = 0;
  let curConn = null;
  let betweenPending = 0;
  let i = 0;
  while (i < text.length) {
    if (!inString && (text[i] === "'" || text[i] === '"')) {
      inString = true; strChar = text[i]; i++; continue;
    }
    if (inString) {
      if (text[i] === strChar) {
        if (i + 1 < text.length && text[i + 1] === strChar) { i += 2; continue; }
        inString = false;
      }
      i++; continue;
    }
    if (text[i] === '(') { depth++; i++; continue; }
    if (text[i] === ')') { depth--; i++; continue; }
    if (depth === 0) {
      if (upper.slice(i, i + 7) === 'BETWEEN' && wordBoundary(upper, i, 7)) {
        betweenPending++;
        i += 7;
        continue;
      }
      if (upper.slice(i, i + 3) === 'AND' && wordBoundary(upper, i, 3)) {
        if (betweenPending > 0) { betweenPending--; i += 3; continue; }
        parts.push([curConn, text.slice(start, i)]);
        curConn = 'AND';
        i += 3;
        start = i;
        continue;
      }
      if (upper.slice(i, i + 2) === 'OR' && wordBoundary(upper, i, 2)) {
        parts.push([curConn, text.slice(start, i)]);
        curConn = 'OR';
        i += 2;
        start = i;
        continue;
      }
    }
    i++;
  }
  if (start < text.length) parts.push([curConn, text.slice(start)]);
  return parts;
}

function stripOuterParens(text) {
  text = text.trim();
  if (text === '' || text[0] !== '(') return text;
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')') {
      depth--;
      if (depth === 0 && i < text.length - 1) return text;
    }
  }
  return stripOuterParens(text.slice(1, -1).trim());
}

function containsSubquery(text) {
  let inString = false;
  let strChar = '';
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (!inString && (ch === "'" || ch === '"')) { inString = true; strChar = ch; i++; continue; }
    if (inString) {
      if (ch === strChar) {
        if (i + 1 < text.length && text[i + 1] === strChar) { i += 2; continue; }
        inString = false;
      }
      i++; continue;
    }
    if (ch === '(' && /^\(\s*SELECT\b/i.test(text.slice(i))) return true;
    i++;
  }
  return false;
}

function normaliseInVal(raw) {
  return raw.trim().replace(/\s*,\s*/g, ', ').trim();
}

function parseConditionExpr(expr) {
  let clean = stripOuterParens(expr.trim()).replaceAll('`', '');
  if (containsSubquery(clean)) return { type: 'raw', expr: expr.trim() };
  let m;
  if ((m = clean.match(/^(.+?)\s+IS\s+NOT\s+NULL\s*$/i))) return { col: m[1].trim(), op: 'IS NOT NULL', val: '' };
  if ((m = clean.match(/^(.+?)\s+IS\s+NULL\s*$/i))) return { col: m[1].trim(), op: 'IS NULL', val: '' };
  if ((m = clean.match(/^(.+?)\s+NOT\s+BETWEEN\s+(.+?)\s+AND\s+(.+)$/i))) return { col: m[1].trim(), op: 'NOT BETWEEN', val: m[2].trim(), val2: m[3].trim() };
  if ((m = clean.match(/^(.+?)\s+BETWEEN\s+(.+?)\s+AND\s+(.+)$/i))) return { col: m[1].trim(), op: 'BETWEEN', val: m[2].trim(), val2: m[3].trim() };
  if ((m = clean.match(/^(.+?)\s+NOT\s+LIKE\s+(.+)$/i))) return { col: m[1].trim(), op: 'NOT LIKE', val: m[2].trim() };
  if ((m = clean.match(/^(.+?)\s+NOT\s+IN\s*\((.+)\)\s*$/is))) return { col: m[1].trim(), op: 'NOT IN', val: normaliseInVal(m[2]) };
  if ((m = clean.match(/^(.+?)\s+IN\s*\((.+)\)\s*$/is))) return { col: m[1].trim(), op: 'IN', val: normaliseInVal(m[2]) };
  if ((m = clean.match(/^(.+?)\s+LIKE\s+(.+)$/i))) return { col: m[1].trim(), op: 'LIKE', val: m[2].trim() };
  for (const op of ['<>', '!=', '<=', '>=', '=', '<', '>']) {
    const escaped = op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    m = clean.match(new RegExp(`^(.+?)\\s*${escaped}\\s*(.+)$`, 's'));
    if (m) return { col: m[1].trim(), op: op === '<>' ? '!=' : op, val: m[2].trim() };
  }
  return { type: 'raw', expr };
}

function parseWhereConditions(text) {
  text = text.trim();
  if (text === '') return [];
  const conditions = [];
  for (const [connector, expr] of splitByAndOr(text)) {
    const trimmed = expr.trim();
    if (trimmed === '') continue;
    const cond = parseConditionExpr(trimmed);
    cond.operator = connector || 'AND';
    cond.enabled = true;
    conditions.push(cond);
  }
  return conditions;
}

function parseHavingConditions(text) {
  text = text.trim();
  if (text === '') return [];
  const conditions = [];
  for (const [connector, expr] of splitByAndOr(text)) {
    const trimmed = expr.trim();
    if (trimmed === '') continue;
    const cond = parseConditionExpr(trimmed);
    if (cond.type === 'raw') return null;
    if (!cond.col || !/^\w+\.\w+$/.test(cond.col)) return null;
    cond.operator = connector || 'AND';
    conditions.push(cond);
  }
  return conditions;
}

export function parseSql(sql) {
  sql = stripComments(sql);
  const sections = splitSections(sql);
  const [tables, joins] = sections.from ? parseFrom(sections.from) : [[], []];
  const [select, selectRaw, selectAliases, selectCustomExprs] = sections.select
    ? parseSelect(sections.select, tables)
    : [[], '', {}, []];
  const where = (sections.where || '').trim();
  const [groupBy, groupByRaw] = sections.groupby ? parseGroupBy(sections.groupby) : [[], ''];
  const having = (sections.having || '').trim();
  const [orderBy, orderByRaw] = sections.orderby ? parseOrderBy(sections.orderby) : [[], ''];
  let limit = 10;
  if (sections.limit) {
    const lv = Number.parseInt(String(sections.limit).replace(/[^0-9]/g, ''), 10);
    if (lv > 0) limit = Math.min(lv, 5000);
  }
  return {
    tables, joins, select, selectRaw, selectAliases, selectCustomExprs,
    where, whereConditions: parseWhereConditions(where),
    groupBy, groupByRaw,
    having, havingConditions: parseHavingConditions(having),
    orderBy, orderByRaw, limit,
  };
}
