import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp, publicDir } from './app.js';
import { HttpError } from './errors.js';
import { APP_VERSION } from './version.js';

const root = path.dirname(fileURLToPath(import.meta.url));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.map': 'application/json',
};

function send(res, status, body, type = 'application/json; charset=utf-8') {
  const payload = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': type,
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch { reject(new HttpError('Invalid JSON body.', 400)); }
    });
    req.on('error', reject);
  });
}

export function startServer({ port = 4173, storageDir, host = '127.0.0.1' } = {}) {
  const storage = storageDir || path.join(root, '../storage');
  const pub = publicDir();
  const app = createApp({ storageDir: storage });

  const server = http.createServer(async (req, res) => {
    try {
      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Tab-Id',
        });
        res.end();
        return;
      }
      const url = new URL(req.url, 'http://local');
      if (req.method === 'POST' && (url.pathname === '/api.php' || url.pathname === '/api')) {
        const body = await readBody(req);
        const json = await app.handleApi(req, body);
        send(res, 200, json);
        return;
      }
      if (req.method === 'POST' && url.pathname === '/cancel_query.php') {
        const body = await readBody(req);
        const result = await app.handleCancel(req, body);
        send(res, result.status, result.body);
        return;
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        send(res, 405, { success: false, message: 'Method not allowed.' });
        return;
      }
      let file = null;
      if (url.pathname === '/' || url.pathname === '/index.php' || url.pathname === '/shell.html') {
        file = url.searchParams.has('tab') ? path.join(pub, 'index.html') : path.join(pub, 'shell.html');
        if (url.pathname === '/index.php' && url.searchParams.has('tab')) file = path.join(pub, 'index.html');
        if ((url.pathname === '/' || url.pathname === '/index.php') && !url.searchParams.has('tab')) file = path.join(pub, 'shell.html');
      } else {
        const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');
        const resolved = path.resolve(pub, rel);
        if (resolved.startsWith(pub + path.sep)) file = resolved;
      }
      if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        send(res, 404, { success: false, message: 'Not found.' });
        return;
      }
      const type = MIME[path.extname(file)] || 'application/octet-stream';
      let body = fs.readFileSync(file);
      if (file.endsWith(`${path.sep}index.html`) || file.endsWith(`${path.sep}shell.html`)) {
        body = body.toString('utf8').replaceAll('__APP_VERSION__', APP_VERSION);
      }
      send(res, 200, body, type);
    } catch (err) {
      const status = err instanceof HttpError ? err.status : 500;
      send(res, status, { success: false, message: err.message || 'Server error.', data: null });
    }
  });

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(port, host, () => {
      const address = server.address();
      resolve({ server, port: address.port, storageDir: storage, app });
    });
  });
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  const port = Number(process.env.PORT || 4173);
  const started = await startServer({ port, storageDir: process.env.SQLJOINER_STORAGE });
  console.log(`SQL Joiner Node http://127.0.0.1:${started.port}`);
}
