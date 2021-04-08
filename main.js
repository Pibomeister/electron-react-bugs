const path = require('path');
const url = require('url');
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const connectDb = require('./config/db');
const Log = require('./models/Log');

require('dotenv').config();

// Connect to database
connectDb();

const isMac = process.platform === 'darwin';

const isDev =
  process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'development';

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: isDev ? 1600 : 1100,
    height: 800,
    show: false,
    icon: './assets/icons/icon.png',
    backgroundColor: 'white',
    webPreferences: {
      nodeIntegration: true,
    },
  });

  let indexPath;

  if (isDev && process.argv.indexOf('--noDevServer') === -1) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true,
    });
  } else {
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist', 'index.html'),
      slashes: true,
    });
  }

  mainWindow.loadURL(indexPath);

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Open devtools if dev
    if (isDev) {
      const {
        default: installExtension,
        REACT_DEVELOPER_TOOLS,
      } = require('electron-devtools-installer');

      installExtension(REACT_DEVELOPER_TOOLS).catch((err) =>
        console.log('Error loading React DevTools: ', err)
      );
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => (mainWindow = null));
}

const menu = [
  ...(isMac ? [{ role: 'appMenu' }] : []),
  { role: 'fileMenu' },
  { role: 'editMenu' },
  {
    label: 'Logs',
    submenu: [
      {
        label: 'Clear Logs',
        click: async () => await clearLogs(),
      },
    ],
  },
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { role: 'separator' },
            { role: 'toggledevtools' },
          ],
        },
      ]
    : []),
];

app.on('ready', () => {
  createMainWindow();
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);
});

ipcMain.on('logs:load', sendLogs);

ipcMain.on('logs:add', addLog);

ipcMain.on('logs:delete', deleteLog);

ipcMain.on('logs:clear', clearLogs);

async function sendLogs() {
  try {
    const logs = await Log.find().sort({ created: 1 });
    mainWindow.webContents.send('logs:get', JSON.stringify(logs));
  } catch (error) {
    console.error(error);
  }
}

async function addLog(e, item) {
  try {
    await Log.create(JSON.parse(item));
    await sendLogs();
  } catch (error) {
    console.error(error);
  }
}

async function deleteLog(e, id) {
  try {
    await Log.findByIdAndDelete(id);
    await sendLogs();
  } catch (error) {
    console.error(error);
  }
}

async function clearLogs() {
  try {
    await Log.deleteMany({});
    await sendLogs();
  } catch (error) {
    console.error(error);
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

// Stop error
app.allowRendererProcessReuse = true;
