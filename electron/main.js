
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// 处理 ES Module 中的 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "CORVON RTK Configurator",
    backgroundColor: '#09090b', // 对应 bg-zinc-950
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    // 隐藏默认菜单栏（可选）
    autoHideMenuBar: true, 
  });

  // 判断环境：开发模式加载 localhost，生产模式加载打包后的 html
  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // 开发模式下打开控制台
    // mainWindow.webContents.openDevTools();
  } else {
    // 生产模式：加载 dist/index.html
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
