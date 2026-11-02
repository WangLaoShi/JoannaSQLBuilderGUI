/** Split a script into statements and decide what the cursor is completing. */

function skipQuoted(sql, i) {
  const quote = sql[i];
  i += 1;
  while (i < sql.length) {
    if (sql[i] === '\\' && quote !== '`') { i += 2; continue; }
    if (sql[i] === quote) {
      if (sql[i + 1] === quote) { i += 2; continue; }
      return i + 1;
    }
    i += 1;
  }
  return i;
}

/** Statements split on semicolons that are outside quotes and comments. */
export function splitStatements(sql) {
  const text = String(sql ?? '');
  const out = [];
  let start = 0;
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === "'" || c === '"' || c === '`') { i = skipQuoted(text, i); continue; }
    if (c === '-' && text[i + 1] === '-') {
      const nl = text.indexOf('\n', i);
      i = nl < 0 ? text.length : nl + 1;
      continue;
    }
    if (c === '#') {
      const nl = text.indexOf('\n', i);
      i = nl < 0 ? text.length : nl + 1;
      continue;
    }
    if (c === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      i = end < 0 ? text.length : end + 2;
      continue;
    }
    if (c === ';') {
      const body = text.slice(start, i).trim();
      if (body) out.push({ start, end: i + 1, text: body });
      start = i + 1;
      i += 1;
      continue;
    }
    i += 1;
  }
  const tail = text.slice(start).trim();
  if (tail) out.push({ start, end: text.length, text: tail });
  return out;
}

/** The statement that contains pos. A gap belongs to the following statement. */
export function statementAt(sql, pos) {
  const text = String(sql ?? '');
  const at = Math.max(0, Math.min(Number(pos) || 0, text.length));
  const parts = splitStatements(text);
  if (!parts.length) return null;
  const hit = parts.find(part => at >= part.start && at <= part.end);
  if (hit) return hit;
  const next = parts.find(part => part.start >= at);
  return next || parts[parts.length - 1];
}

export function isRunnable(sql) {
  let i = 0;
  const text = String(sql ?? '');
  while (i < text.length) {
    const c = text[i];
    if (c === "'" || c === '"' || c === '`') { i = skipQuoted(text, i); return true; }
    if (c === '-' && text[i + 1] === '-') {
      const nl = text.indexOf('\n', i);
      i = nl < 0 ? text.length : nl + 1;
      continue;
    }
    if (c === '#') {
      const nl = text.indexOf('\n', i);
      i = nl < 0 ? text.length : nl + 1;
      continue;
    }
    if (c === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      i = end < 0 ? text.length : end + 2;
      continue;
    }
    if (!/\s/.test(c)) return true;
    i += 1;
  }
  return false;
}

export function unquote(token) {
  const s = String(token ?? '').trim();
  if (s.length >= 2 && s.startsWith('`') && s.endsWith('`')) return s.slice(1, -1).replaceAll('``', '`');
  return s;
}

/** Backtick names that are not plain identifiers, such as `market data`. */
export function quoteIdent(name) {
  const s = String(name ?? '');
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(s)) return s;
  return '`' + s.replaceAll('`', '``') + '`';
}

const ALIAS_STOP = new Set([
  'WHERE', 'ON', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'CROSS', 'FULL', 'JOIN',
  'GROUP', 'ORDER', 'LIMIT', 'UNION', 'SELECT', 'HAVING', 'AND', 'OR', 'SET',
  'USING', 'OFFSET', 'ASC', 'DESC',
]);

/** Names introduced by WITH name AS (. These are not tables in the current database. */
export function cteNames(sql) {
  const names = [];
  const re = /(?:\bWITH\b|,)\s*(`[^`]+`|[A-Za-z_][\w$]*)\s+AS\s*\(/gi;
  let match;
  while ((match = re.exec(String(sql ?? '')))) {
    const name = unquote(match[1]);
    if (name) names.push(name);
  }
  return names;
}

/** Map a table name or alias (lower case) to the table name as written. */
export function aliasMap(sql) {
  const map = new Map();
  const re = /\b(?:FROM|JOIN)\s+(`[^`]+`|[A-Za-z_][\w$]*)(?:\s+(?:AS\s+)?(`[^`]+`|[A-Za-z_][\w$]*))?/gi;
  let match;
  while ((match = re.exec(String(sql ?? '')))) {
    const table = unquote(match[1]);
    if (!table) continue;
    map.set(table.toLowerCase(), table);
    if (!match[2]) continue;
    const alias = unquote(match[2]);
    if (alias && !ALIAS_STOP.has(alias.toUpperCase())) map.set(alias.toLowerCase(), table);
  }
  return map;
}

/**
 * What the cursor is completing inside one statement's raw text.
 * `from` is an offset in that raw text, not the whole script.
 */
export function completionTarget(raw, cursor) {
  const text = String(raw ?? '');
  const head = text.slice(0, Math.max(0, Math.min(Number(cursor) || 0, text.length)));

  const fromJoin = head.match(/\b(?:FROM|JOIN)\s+([\s\S]*)$/i);
  if (fromJoin && !/\b(?:WHERE|ON|GROUP|ORDER|LIMIT|UNION|HAVING|SET|SELECT)\b/i.test(fromJoin[1])) {
    const rest = fromJoin[1];
    const tok = rest.match(/(`[^`]*|[A-Za-z_][\w$]*)$/);
    const rawTok = tok ? tok[1] : '';
    if (rawTok.startsWith('`')) {
      return { kind: 'tables', from: head.length - (rawTok.length - 1), prefix: rawTok.slice(1) };
    }
    return { kind: 'tables', from: head.length - rawTok.length, prefix: rawTok };
  }

  const col = head.match(/(?:`([^`]+)`|([A-Za-z_][\w$]*))\s*\.\s*(`([^`]*)|([A-Za-z_][\w$]*))?$/);
  if (col) {
    const name = col[1] || col[2];
    const partial = col[4] != null ? col[4] : (col[5] || '');
    const consumed = col[3] != null ? col[3].length : (col[5] || '').length;
    return { kind: 'columns', name, from: head.length - consumed, prefix: partial };
  }

  const word = head.match(/[A-Za-z_][\w$]*$/);
  if (!word) return { kind: 'mixed', from: head.length, prefix: '' };
  return { kind: 'mixed', from: head.length - word[0].length, prefix: word[0] };
}
