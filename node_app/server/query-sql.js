/**
 * SQL assembly ported from app/src/Query/*.php.
 * assembleQuery() does not open a database, so preview SQL can be compared
 * with the PHP builder without a live server.
 */
import { HttpError } from './errors.js';

const MAX_LIMIT = 5000;
const WHERE_OPS = ['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'NOT LIKE', 'IS NULL', 'IS NOT NULL', 'IN', 'NOT IN', 'BETWEEN', 'NOT BETWEEN'];
const HAVING_OPS = ['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'NOT LIKE', 'IS NULL', 'IS NOT NULL', 'IN', 'NOT IN'];
const JOIN_KEYWORDS = {
  INNER: 'INNER JOIN',
  LEFT: 'LEFT JOIN',
  RIGHT: 'RIGHT JOIN',
  FULL: 'FULL OUTER JOIN',
  CROSS: 'CROSS JOIN',
};

const ident = /^\w+$/;

function esc(name) {
  return String(name).replaceAll('`', '``');
}

function tableRef(table) {
  if (table.isSubquery) return `(${String(table.subquery ?? '').trim()})`;
  const name = `\`${esc(table.name)}\``;
  if (table.database) return `\`${esc(table.database)}\`.${name}`;
  return name;
}

function col(name) {
  return `\`${esc(name)}\``;
}

function splitSelectExprs(raw) {
  const parts = [];
  let depth = 0;
  let cur = '';
  for (const ch of raw) {
    if (ch === '(' || ch === '[') { depth++; cur += ch; }
    else if (ch === ')' || ch === ']') { depth--; cur += ch; }
    else if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; }
    else cur += ch;
  }
  if (cur.trim() !== '') parts.push(cur);
  return parts;
}

function exprSortKey(expr) {
  const t = expr.trim();
  let m = t.match(/\bAS\s+`?(\w+)`?\s*$/i);
  if (m) return m[1].toLowerCase();
  m = t.match(/\w+\.`?(\w+)`?/);
  if (m) return m[1].toLowerCase();
  const clean = t.replaceAll('`', '');
  m = clean.match(/^\s*(\w+)/);
  if (m) return m[1].toLowerCase();
  return t.toLowerCase();
}

export function containsVariables(sql) {
  return /\bSET[\s]{0,}@[a-zA-Z_]/i.test(sql);
}

function buildSelect(select, addDelimiter, selectAliases, sortAlpha) {
  if (!select.length) return '*';
  const cols = [];
  for (const item of select) {
    const text = String(item);
    let m = text.match(/^(\w+)\.\*$/);
    if (m) {
      cols.push({ alias: m[1], sortkey: m[1], expr: `${m[1]}.*` });
      continue;
    }
    m = text.match(/^(\w+)\.(\w+)$/);
    if (!m) continue;
    let expr = `${m[1]}.\`${esc(m[2])}\``;
    const colAlias = selectAliases[text] != null ? String(selectAliases[text]).trim() : '';
    if (colAlias !== '') expr += ` AS \`${esc(colAlias)}\``;
    cols.push({
      alias: m[1],
      sortkey: colAlias !== '' ? colAlias : m[2],
      expr,
    });
  }
  if (!cols.length) return '*';
  if (sortAlpha) cols.sort((a, b) => a.sortkey.localeCompare(b.sortkey, undefined, { sensitivity: 'accent' }));
  if (!addDelimiter) return cols.map(c => c.expr).join(', ');
  const parts = [];
  if (sortAlpha) {
    let prev = null;
    for (const c of cols) {
      const sk = c.sortkey.toLowerCase();
      if (prev !== null && sk !== prev) parts.push("'|||'");
      parts.push(c.expr);
      prev = sk;
    }
    return parts.join(', ');
  }
  let prevAlias = null;
  for (const c of cols) {
    if (prevAlias !== null && c.alias !== prevAlias) parts.push("'|||'");
    parts.push(c.expr);
    prevAlias = c.alias;
  }
  return parts.join(', ');
}

function buildJoins(joins, tables) {
  if (!joins.length) return '';
  const tableMap = Object.fromEntries(tables.map(t => [t.id, t]));
  const chain = new Set(tables[0] ? [tables[0].id] : []);
  const lines = [];
  for (const join of joins) {
    const fromT = tableMap[join.fromTableId];
    const toT = tableMap[join.toTableId];
    if (!fromT || !toT) continue;
    const kw = JOIN_KEYWORDS[join.type] || 'INNER JOIN';
    const fromIn = chain.has(join.fromTableId);
    const toIn = chain.has(join.toTableId);
    let joinTable;
    let onLeft;
    let onRight;
    let reversed = false;
    if (!toIn) {
      joinTable = toT;
      onLeft = `${fromT.alias}.${col(join.fromCol ?? '')}`;
      onRight = `${toT.alias}.${col(join.toCol ?? '')}`;
      chain.add(join.toTableId);
    } else if (!fromIn) {
      joinTable = fromT;
      onLeft = `${toT.alias}.${col(join.toCol ?? '')}`;
      onRight = `${fromT.alias}.${col(join.fromCol ?? '')}`;
      chain.add(join.fromTableId);
      reversed = true;
    } else {
      joinTable = toT;
      onLeft = `${fromT.alias}.${col(join.fromCol ?? '')}`;
      onRight = `${toT.alias}.${col(join.toCol ?? '')}`;
    }
    const extra = [];
    for (const ec of join.extraConditions || []) {
      const ecFrom = col(String(ec.fromCol ?? ''));
      const ecTo = col(String(ec.toCol ?? ''));
      extra.push(reversed
        ? `${toT.alias}.${ecTo} = ${fromT.alias}.${ecFrom}`
        : `${fromT.alias}.${ecFrom} = ${toT.alias}.${ecTo}`);
    }
    let onSql = `${onLeft} = ${onRight}`;
    if (extra.length) onSql += ` AND ${extra.join(' AND ')}`;
    lines.push(`${kw} ${tableRef(joinTable)} ${joinTable.alias} ON ${onSql}`);
  }
  return lines.join('\n');
}

export function connectedComponents(joins, tables) {
  if (!tables.length) return [];
  const adj = new Map(tables.map(t => [t.id, []]));
  for (const j of joins) {
    if (adj.has(j.fromTableId)) adj.get(j.fromTableId).push(j.toTableId);
    if (adj.has(j.toTableId)) adj.get(j.toTableId).push(j.fromTableId);
  }
  const visited = new Set();
  const islands = [];
  for (const t of tables) {
    if (visited.has(t.id)) continue;
    const island = [];
    const queue = [t.id];
    visited.add(t.id);
    while (queue.length) {
      const cur = queue.shift();
      island.push(cur);
      for (const nbr of adj.get(cur) || []) {
        if (!visited.has(nbr)) {
          visited.add(nbr);
          queue.push(nbr);
        }
      }
    }
    islands.push(island);
  }
  return islands;
}

function buildWhere(conditions, rawWhere, mode) {
  const raw = mode === 'raw' ? rawWhere.trim() : '';
  const visual = (conditions || []).filter(c => c.enabled !== false);
  if (!visual.length && raw === '') return '';
  const parts = [];
  for (const cond of visual) {
    let operator = String(cond.operator || 'AND').toUpperCase();
    if (operator !== 'AND' && operator !== 'OR') operator = 'AND';
    let part = '';
    if ((cond.type || 'column') === 'raw') {
      let expr = String(cond.expr ?? '').trim();
      if (expr === '') continue;
      if (/^select\s/i.test(expr)) expr = `(${expr})`;
      part = expr;
    } else {
      const colName = String(cond.col ?? '');
      const op = String(cond.op ?? '=');
      const val = String(cond.val ?? '');
      if (!WHERE_OPS.includes(op)) continue;
      if (!/^\w+(\.\w+)?$/.test(colName)) continue;
      if (op === 'IS NULL' || op === 'IS NOT NULL') part = `${colName} ${op}`;
      else if (op === 'IN' || op === 'NOT IN') part = `${colName} ${op} (${val.split(',').map(v => v.trim()).join(', ')})`;
      else if (op === 'BETWEEN' || op === 'NOT BETWEEN') part = `${colName} ${op} ${val} AND ${cond.val2 ?? ''}`;
      else part = `${colName} ${op} ${val}`;
    }
    if (cond.startGroup) part = `(${part}`;
    if (cond.endGroup) part = `${part})`;
    parts.push(parts.length === 0 ? `WHERE\n\t    ${part}` : `\t${operator} ${part}`);
  }
  if (raw !== '') {
    parts.push(parts.length === 0 ? `WHERE\n\t${raw}` : `\tAND (${raw})`);
  }
  return parts.join('\n');
}

function buildGroupBy(groupBy, rawText, mode) {
  if (mode === 'raw') {
    const raw = rawText.trim();
    return raw !== '' ? `GROUP BY ${raw}` : '';
  }
  const parts = (groupBy || []).map(String).filter(c => /^\w+\.\w+$/.test(c));
  return parts.length ? `GROUP BY ${parts.join(', ')}` : '';
}

function havingRef(cond) {
  const colName = String(cond?.col ?? '');
  if (cond?.kind === 'agg') return /^\w+$/.test(colName) ? colName : '';
  return /^\w+\.\w+$/.test(colName) ? colName : '';
}

function buildHaving(conditions, rawHaving, mode) {
  if (mode === 'raw') {
    const raw = rawHaving.trim();
    return raw !== '' ? `HAVING\n\t${raw}` : '';
  }
  const parts = [];
  for (const cond of conditions || []) {
    const colName = havingRef(cond);
    const op = String(cond.op ?? '=');
    const val = String(cond.val ?? '');
    if (!colName || !HAVING_OPS.includes(op)) continue;
    if (op === 'IS NULL' || op === 'IS NOT NULL') parts.push(`${colName} ${op}`);
    else if (op === 'IN' || op === 'NOT IN') parts.push(`${colName} ${op} (${val.split(',').map(v => v.trim()).join(', ')})`);
    else parts.push(`${colName} ${op} ${val}`);
  }
  return parts.length ? `HAVING\n\t    ${parts.join('\n\tAND ')}` : '';
}

function buildOrderBy(orderBy, rawText, mode) {
  if (mode === 'raw') {
    const raw = rawText.trim();
    return raw !== '' ? `ORDER BY ${raw}` : '';
  }
  const parts = [];
  for (const item of orderBy || []) {
    const colName = String(item.col ?? '');
    if (!/^\w+\.\w+$/.test(colName)) continue;
    let dir = String(item.dir || 'ASC').toUpperCase();
    if (dir !== 'ASC' && dir !== 'DESC') dir = 'ASC';
    parts.push(`${colName} ${dir}`);
  }
  return parts.length ? `ORDER BY ${parts.join(', ')}` : '';
}

function columnName(col) {
  return typeof col === 'object' && col ? (col.name ?? '') : String(col);
}

function expandFromTables(tables) {
  const out = [];
  for (const t of tables) {
    for (const col of t.columns || []) {
      const name = columnName(col);
      if (name !== '') out.push(`${t.alias}.${name}`);
    }
  }
  return out;
}

/**
 * @param {object} state canvas state, same shape as the PHP QueryBuilder
 * @param {{forPreview?: boolean}} [opts]
 * @returns {{sql: string, warnings: string[]}}
 */
export function assembleQuery(state, opts = {}) {
  const forPreview = !!opts.forPreview;
  let tables = [...(state.tables || [])];
  if (!tables.length) throw new HttpError('No tables specified.', 400);

  let joins = (state.joins || []).filter(j => j.enabled !== false);
  tables.sort((a, b) => (a.order ?? 1) - (b.order ?? 1));
  if (joins.length) {
    const orderMap = Object.fromEntries(tables.map(t => [t.id ?? '', t.order ?? 1]));
    joins = [...joins].sort((a, b) => {
      const minA = Math.min(orderMap[a.fromTableId ?? ''] ?? 99, orderMap[a.toTableId ?? ''] ?? 99);
      const minB = Math.min(orderMap[b.fromTableId ?? ''] ?? 99, orderMap[b.toTableId ?? ''] ?? 99);
      return minA - minB;
    });
  }

  const activeAliases = new Set(tables.map(t => String(t.alias ?? '').toLowerCase()).filter(Boolean));
  const aliasFilter = (k) => {
    const dot = String(k).indexOf('.');
    return dot !== -1 && activeAliases.has(String(k).slice(0, dot).toLowerCase());
  };

  let columnOrder = [...(state.columnOrder || [])].filter(k => aliasFilter(k));
  let select = [...(state.select || [])].filter(k => aliasFilter(k));
  const selectMode = state.selectMode || 'visual';
  const selectAddDelimiter = !!state.selectAddDelimiter;
  const selectSortAlpha = !!state.selectSortAlpha;
  const selectAliases = state.selectAliases || {};

  const fillFromOrderOrTables = () => {
    if (columnOrder.length) return columnOrder.filter(k => /^\w+\.\w+$/.test(String(k)));
    return expandFromTables(tables);
  };

  if (selectAddDelimiter && !select.length && selectMode !== 'raw') {
    if (tables.some(t => t.isSubquery)) select = tables.map(t => `${t.alias ?? ''}.*`);
    else select = fillFromOrderOrTables();
  }
  if (selectSortAlpha && !select.length && selectMode !== 'raw') select = fillFromOrderOrTables();
  if (!select.length && selectMode !== 'raw' && Object.keys(selectAliases).length) select = fillFromOrderOrTables();
  if (!select.length && selectMode !== 'raw' && columnOrder.length) {
    const defaultOrder = expandFromTables(tables);
    const same = columnOrder.length === defaultOrder.length && columnOrder.every((v, i) => v === defaultOrder[i]);
    if (!same) select = columnOrder.filter(k => /^\w+\.\w+$/.test(String(k)));
  }

  for (const t of tables) {
    if (t.isSubquery) {
      if (!ident.test(String(t.alias ?? ''))) throw new HttpError(`Invalid table alias: ${t.alias ?? ''}`, 400);
      continue;
    }
    if (!ident.test(String(t.name ?? ''))) throw new HttpError(`Invalid table name: ${t.name ?? ''}`, 400);
    if (!ident.test(String(t.alias ?? ''))) throw new HttpError(`Invalid table alias: ${t.alias ?? ''}`, 400);
    if (t.database && !ident.test(String(t.database))) throw new HttpError(`Invalid database name: ${t.database}`, 400);
  }

  const selectRaw = String(state.selectRaw ?? '');
  const selectCustomExprs = state.selectCustomExprs || [];
  const selectCustomExprsMode = state.selectCustomExprsMode || 'combined';
  const selectCustomExprsOrder = state.selectCustomExprsOrder || 'first';
  const selectNone = !!state.selectNone;
  const selectDistinct = !!state.selectDistinct;

  let selectSql;
  if (selectMode === 'raw' && selectRaw.trim() !== '') {
    let raw = selectRaw.trim();
    if (selectSortAlpha) {
      const exprs = splitSelectExprs(raw);
      exprs.sort((a, b) => exprSortKey(a) < exprSortKey(b) ? -1 : exprSortKey(a) > exprSortKey(b) ? 1 : 0);
      raw = exprs.map(e => e.trim()).join(', ');
    }
    selectSql = raw;
  } else if (selectCustomExprsMode === 'only') {
    selectSql = '/* no columns selected */';
  } else {
    selectSql = buildSelect(select, selectAddDelimiter, selectAliases, selectSortAlpha);
  }

  if (selectMode !== 'raw' && selectCustomExprsMode !== 'exclude') {
    let customParts = [];
    for (const e of selectCustomExprs) {
      if (e.enabled === false) continue;
      let expr = String(e.expr ?? '').trim();
      if (expr === '') continue;
      if (/^select\s/i.test(expr)) expr = `(${expr})`;
      const alias = String(e.alias ?? '').trim();
      customParts.push({
        sql: alias !== '' ? `${expr} AS ${alias}` : expr,
        key: (alias !== '' ? alias : expr).toLowerCase(),
      });
    }
    if (selectSortAlpha && customParts.length) customParts.sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
    if (customParts.length) {
      const customSql = customParts.map(p => p.sql).join(', ');
      if (selectCustomExprsMode === 'only' || (selectNone && selectSql === '*')) selectSql = customSql;
      else {
        const sep = selectAddDelimiter ? ", '|||', " : ', ';
        if (selectCustomExprsOrder === 'first') {
          if (selectSql === '*') selectSql = tables.map(t => `${t.alias ?? ''}.*`).join(', ');
          selectSql = customSql + sep + selectSql;
        } else selectSql = selectSql + sep + customSql;
      }
    }
  }

  const first = tables[0];
  const fromSql = `${tableRef(first)} ${first.alias}`;
  const joinSql = buildJoins(joins, tables);
  const components = connectedComponents(joins, tables);
  const warnings = [];
  if (components.length > 1) {
    const tableMap = Object.fromEntries(tables.map(t => [t.id, t]));
    const labels = components.map(island => `[${island.map(id => tableMap[id]?.name ?? id).join(', ')}]`);
    const msg = `Multiple disconnected table groups found: ${labels.join(' and ')}. Select one group to query.`;
    if (!forPreview) throw new HttpError(msg, 400);
    warnings.push(msg);
  }

  const whereSql = buildWhere(state.where || [], String(state.whereRaw ?? ''), state.whereMode || 'visual');
  const groupBySql = buildGroupBy(state.groupBy || [], String(state.groupByRaw ?? ''), state.groupByMode || 'visual');
  const havingSql = buildHaving(state.having || [], String(state.havingRaw ?? ''), state.havingMode || 'visual');
  const orderSql = buildOrderBy(state.orderBy || [], String(state.orderByRaw ?? ''), state.orderByMode || 'visual');
  const limit = Math.min(Number.parseInt(state.limit ?? 10, 10) || 0, MAX_LIMIT);

  const selectParts = splitSelectExprs(selectSql);
  const selectKw = selectDistinct ? 'SELECT DISTINCT' : 'SELECT';
  const selectLine = selectParts.length <= 1
    ? `${selectKw}\n\t${selectSql}`
    : `${selectKw}\n\t${selectParts.map(p => p.trim()).join(',\n\t')}`;

  const lines = [selectLine, `FROM\n\t${fromSql}`];
  if (joinSql) lines.push(joinSql);
  if (whereSql) lines.push(whereSql);
  if (groupBySql) lines.push(groupBySql);
  if (havingSql) lines.push(havingSql);
  if (orderSql) lines.push(orderSql);
  lines.push(`LIMIT ${limit}`);
  return { sql: lines.join('\n'), warnings };
}
