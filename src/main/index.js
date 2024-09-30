import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { spawn, exec } from 'child_process'
import https from 'https'
import fs from 'fs'

// Function to check if Python is installed
function checkAndInstallPython(mainWindow) {
  exec('python --version', (error, stdout, stderr) => {
    if (error) {
      console.log('Python is not installed. Installing...')
      downloadAndInstallPython(mainWindow)
    } else {
      console.log(`Python is installed: ${stdout}`)
    }
  })
}

// Function to download and install Python
function downloadAndInstallPython(mainWindow) {
  const installerUrl = 'https://www.python.org/ftp/python/3.13.0/python-3.13.0a1-amd64.exe'
  const installerPath = join(__dirname, 'python-installer.exe')

  const file = fs.createWriteStream(installerPath)
  https
    .get(installerUrl, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        runInstaller(installerPath, mainWindow)
      })
    })
    .on('error', (err) => {
      fs.unlink(installerPath)
      console.error('Error downloading Python installer:', err.message)
    })
}

// Function to run the Python installer
function runInstaller(installerPath, mainWindow) {
  exec(`"${installerPath}" /quiet InstallAllUsers=1 PrependPath=1`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error installing Python:', error.message)
      mainWindow.webContents.send('python-install-error', error.message)
      return
    }
    console.log('Python installed successfully.')
    mainWindow.webContents.send('python-install-success')
  })
}

// Function to handle Python processes
function handlePythonProcess(command, scriptPath, mainWindow) {
  const pythonProcess = spawn('python', [join(scriptPath), command])

  pythonProcess.stdout.on('data', (data) => {
    const output = data.toString()
    mainWindow.webContents.send('python-output', output)
  })

  pythonProcess.stderr.on('data', (data) => {
    mainWindow.webContents.send('python-error', data.toString())
  })

  pythonProcess.on('close', (code) => {
    mainWindow.webContents.send('python-close', `exited with code ${code}`)
  })
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 425,
    frame: false,
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: true,
      fullscreen: false,
      fullscreenable: false,
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  ipcMain.on('minimize-window', () => {
    mainWindow.minimize()
  })

  ipcMain.on('close-window', () => {
    mainWindow.close()
  })

  ipcMain.on('optimize', () => {
    const appDataPath = app.getPath('appData');
    const optimizeScriptPath = join(appDataPath, 'DextolSolutions/ZenSL/App/Optimizer/Optimize.py');
    handlePythonProcess('optimize', optimizeScriptPath, mainWindow);
  });

  ipcMain.on('revert', () => {
    const appDataPath = app.getPath('appData');
    const revertScriptPath = join(appDataPath, 'DextolSolutions/ZenSL/App/Optimizer/Revert.py');
    handlePythonProcess('revert', revertScriptPath, mainWindow);
  });

  ipcMain.on('restart-computer', () => {
    const appDataPath = app.getPath('appData');
    const revertScriptPath = join(appDataPath, 'DextolSolutions/ZenSL/App/components/Reboot.py');
    handlePythonProcess('restart-computer', revertScriptPath, mainWindow);
  });

  ipcMain.on('open-source-folder', () => {
    const appDataPath = app.getPath('appData');
    const revertScriptPath = join(appDataPath, 'DextolSolutions/ZenSL/App/components/openFolder.py');
    handlePythonProcess('open-source-folder', revertScriptPath, mainWindow);
  })

  // Check and install Python if not installed
  checkAndInstallPython(mainWindow)
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
