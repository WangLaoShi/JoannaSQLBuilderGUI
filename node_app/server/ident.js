import { HttpError } from './errors.js';

/**
 * Table names are always quoted. Spaces and hyphens are real names
 * (`market data`, `winequality-red`). A backtick or a line break would
 * break out of the quotes, so those stay rejected.
 */
export function assertTableName(value) {
  const name = String(value ?? '');
  if (name.length === 0 || name.length > 64 || name.trim() === '' || /[\0\r\n`]/.test(name)) {
    throw new HttpError(`Invalid table name: ${name}`, 400);
  }
}

export function quoteIdent(name) {
  return '`' + String(name).replaceAll('`', '``') + '`';
}
