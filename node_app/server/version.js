/**
 * The only version number. package.json is what electron-builder prints
 * on the installer, and the server copies it into the page.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(fs.readFileSync(path.join(here, '../package.json'), 'utf8'));

export const APP_NAME = 'SQL Joiner';
export const APP_VERSION = String(pkg.version || '0.0.0');
