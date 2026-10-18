import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { HttpError } from './errors.js';

export class ProfileStore {
  constructor(storageDir) {
    this.file = path.join(storageDir, 'profiles.json');
  }

  list() {
    return this.read().map(p => ({ ...p, password: '' }));
  }

  save(data) {
    const type = data.type || 'mysql';
    if (type === 'sqlite') this.requireFields(data, ['name', 'file_path']);
    else this.requireFields(data, ['name', 'host', 'database', 'user']);
    const profiles = this.read();
    let id = data.id || null;
    if (id) {
      const stored = profiles.find(p => p.id === id);
      if (!stored) throw new HttpError(`Profile not found: ${id}`, 404);
      const password = (data.password ?? '') !== '' ? data.password : (stored.password ?? '');
      Object.assign(stored, this.build(data, id, password));
    } else {
      id = `p_${Date.now().toString(16)}${crypto.randomBytes(3).toString('hex')}`;
      profiles.push(this.build(data, id, data.password ?? ''));
    }
    this.write(profiles);
    const saved = profiles.find(p => p.id === id);
    return { ...saved, password: '' };
  }

  delete(id) {
    if (!id) throw new HttpError('Profile ID is required.', 400);
    const profiles = this.read();
    const filtered = profiles.filter(p => p.id !== id);
    if (filtered.length === profiles.length) throw new HttpError(`Profile not found: ${id}`, 404);
    this.write(filtered);
  }

  get(id) {
    return this.read().find(p => p.id === id) ?? null;
  }

  resolveForTest(data) {
    const modeA = data.id && !data.host && !data.file_path;
    if (modeA) {
      const profile = this.get(data.id);
      if (!profile) throw new HttpError('Profile not found.', 404);
      return profile;
    }
    const type = data.type || 'mysql';
    const profile = { ...data };
    if (type === 'sqlite') this.requireFields(data, ['file_path']);
    else {
      this.requireFields(data, ['host', 'database', 'user']);
      if (data.id && (data.password ?? '') === '') {
        profile.password = this.get(data.id)?.password ?? '';
      }
    }
    return profile;
  }

  build(data, id, password) {
    if ((data.type || 'mysql') === 'sqlite') {
      return { id, name: String(data.name ?? '').trim(), type: 'sqlite', file_path: String(data.file_path ?? '').trim() };
    }
    return {
      id,
      name: String(data.name ?? '').trim(),
      type: 'mysql',
      host: String(data.host ?? 'localhost').trim(),
      port: Number.parseInt(data.port ?? 3306, 10) || 3306,
      database: String(data.database ?? '').trim(),
      user: String(data.user ?? '').trim(),
      password,
    };
  }

  requireFields(data, fields) {
    for (const field of fields) {
      if (!data[field]) throw new HttpError(`Field '${field}' is required.`, 400);
    }
  }

  read() {
    if (!fs.existsSync(this.file)) return [];
    return JSON.parse(fs.readFileSync(this.file, 'utf8')) ?? [];
  }

  write(profiles) {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(profiles, null, 4));
  }
}
