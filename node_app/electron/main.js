import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { startServer } from '../server/index.js';

let server;

async function open() {
  const storageDir = path.join(app.getPath('userData'), 'storage');
  const started = await startServer({ port: 0, storageDir });
  server = started.server;
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    title: 'SQL Joiner',
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  await win.loadURL(`http://127.0.0.1:${started.port}/`);
}

app.whenReady().then(open);
app.on('window-all-closed', () => {
  server?.close();
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) open();
});
