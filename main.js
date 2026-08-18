// const { app, BrowserWindow, ipcMain } = require('electron');
// const path = require('path');
// require('dotenv').config({ path: path.join(__dirname, '.env') });

// let mainWindow = null;

// const LOCKED_BY = process.env.LOCKED_BY || 'user';
// const LOCK_PASSWORD = process.env.LOCK_PASSWORD || '123';

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     fullscreen: true,
//     width: 3840,
//     height: 2260,
//     kiosk: true,
//     frame: false,
//     resizable: false,
//     autoHideMenuBar: true,
//     backgroundColor: '#000000',
//     webPreferences: {
//     preload: path.join(__dirname, 'preload.js'),
//     contextIsolation: true,
//     nodeIntegration: false
//     }
//   });

//   mainWindow.setMenuBarVisibility(false);
//   mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

//   // Keep the window pinned to the front so the "lock" cannot be
//   // trivially alt-tabbed away from.
//   mainWindow.on('blur', () => {
//     if (mainWindow && !mainWindow.isDestroyed()) {
//       mainWindow.focus();
//     }
//   });

//   mainWindow.on('closed', () => {
//     mainWindow = null;
//   });
// }

// // Expose the lock configuration to the renderer via preload/IPC
// // rather than via nodeIntegration.
// ipcMain.handle('get-lock-config', () => {
//   return { lockedBy: LOCKED_BY };
// });

// ipcMain.handle('check-password', (event, attempt) => {
//   return attempt === LOCK_PASSWORD;
// });

// ipcMain.handle('unlock-app', () => {
//   if (mainWindow && !mainWindow.isDestroyed()) {
//     if (mainWindow.isFullScreen()) {
//       mainWindow.setFullScreen(false);
//     }
//     mainWindow.setKiosk(false);
//   }
//   app.quit();
// });

// app.whenReady().then(createWindow);

// app.on('window-all-closed', () => {
//   app.quit();
// });

// app.on('activate', () => {
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow();
//   }
// });
const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

// Désactiver la barre système sur Ubuntu
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-features', 'UseOzonePlatform');
app.commandLine.appendSwitch('ozone-platform', 'x11');

// Désactiver les notifications système
app.setAppUserModelId('ft_lock');

require('dotenv').config({
  path: path.join(__dirname, '.env')
});

let mainWindow = null;

const LOCKED_BY = process.env.LOCKED_BY || 'user';
const LOCK_PASSWORD = process.env.LOCK_PASSWORD || '123456';

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    fullscreen: true,
    kiosk: true,
    frame: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    closable: false,
    skipTaskbar: true,
    autoHideMenuBar: true,
    backgroundColor: '#000000',
    transparent: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Masquer la barre de menu
  mainWindow.setMenuBarVisibility(false);
  
  // Charger le fichier
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Forcer le fullscreen
  mainWindow.webContents.on('did-finish-load', async () => {
    // Attendre un peu pour s'assurer que la fenêtre est chargée
    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.setFullScreen(true);
        mainWindow.setKiosk(true);
        mainWindow.setAlwaysOnTop(true, 'screen-saver');
        // Forcer le focus
        mainWindow.focus();
      }
    }, 100);
  });

  // Forcer le fullscreen en cas de changement
  mainWindow.on('leave-full-screen', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      setTimeout(() => {
        mainWindow.setFullScreen(true);
      }, 50);
    }
  });

  mainWindow.on('leave-kiosk', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      setTimeout(() => {
        mainWindow.setKiosk(true);
      }, 50);
    }
  });

  // Keep the window pinned to the front
  mainWindow.on('blur', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.focus();
          mainWindow.setAlwaysOnTop(true, 'screen-saver');
        }
      }, 50);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ============================================
// IPC
// ============================================

ipcMain.handle('get-lock-config', () => {
  return {
    lockedBy: LOCKED_BY
  };
});

ipcMain.handle('check-password', (event, attempt) => {
  return attempt === LOCK_PASSWORD;
});

ipcMain.handle('unlock-app', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setFullScreen(false);
    mainWindow.setKiosk(false);
  }
  app.quit();
});

// ============================================
// APP
// ============================================

app.whenReady().then(() => {
  createWindow();

  app.on('before-quit', (event) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isFullScreen() || mainWindow.isKiosk()) {
        event.preventDefault();
        setTimeout(() => {
          app.exit(0);
        }, 100);
      }
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});