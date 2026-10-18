import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { HttpError } from './errors.js';

export class ContextStore {
  constructor(storageDir) {
    this.dir = path.join(storageDir, 'contexts');
  }

  save(name, context) {
    name = String(name ?? '').trim();
    if (name === '') throw new HttpError('Context name is required.', 400);
    if (!context || typeof context !== 'object' || Array.isArray(context)) {
      throw new HttpError('Context payload is required.', 400);
    }
    fs.mkdirSync(this.dir, { recursive: true });
    const id = this.makeId(name);
    const savedAt = new Date().toISOString();
    const payload = { id, name, savedAt, context };
    fs.writeFileSync(this.filePath(id), JSON.stringify(payload, null, 4));
    return { id, name, savedAt };
  }

  load(id) {
    const payload = JSON.parse(fs.readFileSync(this.requireFile(id), 'utf8'));
    if (!payload || typeof payload !== 'object') throw new HttpError('Corrupt context file.', 500);
    return payload.context ?? payload;
  }

  list() {
    fs.mkdirSync(this.dir, { recursive: true });
    const list = [];
    for (const file of fs.readdirSync(this.dir).filter(f => f.endsWith('.json'))) {
      try {
        const payload = JSON.parse(fs.readFileSync(path.join(this.dir, file), 'utf8'));
        if (!payload?.id) continue;
        list.push({ id: payload.id, name: payload.name ?? payload.id, savedAt: payload.savedAt ?? '' });
      } catch { /* skip corrupt files, same as PHP */ }
    }
    list.sort((a, b) => (a.savedAt < b.savedAt ? 1 : a.savedAt > b.savedAt ? -1 : 0));
    return list;
  }

  delete(id) {
    fs.unlinkSync(this.requireFile(id));
  }

  rename(id, name) {
    name = String(name ?? '').trim();
    if (name === '') throw new HttpError('Context name is required.', 400);
    const file = this.requireFile(id);
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!payload?.id) throw new HttpError('Corrupt context file.', 500);
    payload.name = name;
    fs.writeFileSync(file, JSON.stringify(payload, null, 4));
    return { id: payload.id, name: payload.name, savedAt: payload.savedAt ?? '' };
  }

  update(id, name, context) {
    name = String(name ?? '').trim();
    if (name === '') throw new HttpError('Context name is required.', 400);
    if (!context || typeof context !== 'object' || Array.isArray(context)) {
      throw new HttpError('Context payload is required.', 400);
    }
    const file = this.requireFile(id);
    const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!payload?.id) throw new HttpError('Corrupt context file.', 500);
    payload.name = name;
    payload.context = context;
    payload.savedAt = new Date().toISOString();
    fs.writeFileSync(file, JSON.stringify(payload, null, 4));
    return { id: payload.id, name: payload.name, savedAt: payload.savedAt };
  }

  filePath(id) {
    const safe = String(id).replace(/[^\w-]/g, '');
    return path.join(this.dir, `${safe}.json`);
  }

  requireFile(id) {
    if (!id) throw new HttpError('Context id is required.', 400);
    const file = this.filePath(id);
    if (!fs.existsSync(file)) throw new HttpError('Context not found.', 404);
    return file;
  }

  makeId(name) {
    let slug = name.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
    if (!slug) slug = 'context';
    return `${slug.slice(0, 40)}_${crypto.randomBytes(3).toString('hex')}`;
  }
}
