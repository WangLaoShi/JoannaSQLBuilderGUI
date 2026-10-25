import { app, BrowserWindow, Menu, nativeImage } from 'electron';
import path from 'node:path';
import { startServer } from '../server/index.js';

function windowIcon() {
  const image = nativeImage.createFromPath(
    path.join(__dirname, '..', 'public', 'assets', 'img', 'icon.png')
  );
  return image.isEmpty() ? undefined : image;
}

let server;
let quitting = false;

function stopServer() {
  const current = server;
  if (!current) return;
  server = null;
  current.closeAllConnections?.();
  current.close();
}

function installMenu() {
  const mac = process.platform === 'darwin';
  const template = [
    ...(mac ? [{
      label: app.name,
      submenu: [
        { role: 'about', label: `关于 ${app.name}` },
        { type: 'separator' },
        { role: 'services', label: '服务' },
        { type: 'separator' },
        { role: 'hide', label: `隐藏 ${app.name}` },
        { role: 'hideOthers', label: '隐藏其他' },
        { role: 'unhide', label: '显示全部' },
        { type: 'separator' },
        { role: 'quit', label: `退出 ${app.name}` },
      ],
    }] : []),
    {
      label: '文件',
      submenu: [
        mac ? { role: 'close', label: '关闭窗口' } : { role: 'quit', label: '退出' },
      ],
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'pasteAndMatchStyle', label: '粘贴并匹配样式' },
        { role: 'delete', label: '删除' },
        { role: 'selectAll', label: '全选' },
        ...(mac ? [
          { type: 'separator' },
          {
            label: '语音',
            submenu: [
              { role: 'startSpeaking', label: '开始朗读' },
              { role: 'stopSpeaking', label: '停止朗读' },
            ],
          },
        ] : []),
      ],
    },
    {
      label: '显示',
      submenu: [
        { role: 'reload', label: '重新加载' },
        { role: 'forceReload', label: '强制重新加载' },
        { role: 'toggleDevTools', label: '开发者工具' },
        { type: 'separator' },
        { role: 'resetZoom', label: '实际大小' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '切换全屏' },
      ],
    },
    {
      label: '窗口',
      submenu: [
        { role: 'minimize', label: '最小化' },
        { role: 'zoom', label: '缩放' },
        ...(mac ? [
          { type: 'separator' },
          { role: 'front', label: '全部置于顶层' },
        ] : [
          { role: 'close', label: '关闭' },
        ]),
      ],
    },
    {
      role: 'help',
      label: '帮助',
      submenu: [
        { role: 'about', label: `关于 ${app.name}` },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function open() {
  const storageDir = path.join(app.getPath('userData'), 'storage');
  const started = await startServer({ port: 0, storageDir });
  server = started.server;
  const icon = windowIcon();
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    title: 'SQL Joiner',
    ...(icon ? { icon } : {}),
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  // The page calls preventDefault() on beforeunload. In this desktop window
  // that cancels Quit and the confirmation never appears, so the process stays.
  win.webContents.on('will-prevent-unload', event => {
    event.preventDefault();
  });
  await win.loadURL(`http://127.0.0.1:${started.port}/`);
}

app.whenReady().then(() => {
  const icon = windowIcon();
  if (icon && process.platform === 'darwin') app.dock.setIcon(icon);
  installMenu();
  return open();
});
app.on('before-quit', () => {
  quitting = true;
  stopServer();
});
app.on('window-all-closed', () => {
  stopServer();
  app.quit();
});
app.on('activate', () => {
  if (quitting) return;
  if (BrowserWindow.getAllWindows().length === 0) open();
});
