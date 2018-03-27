'use strict'
import { app, BrowserWindow } from 'electron'
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let splashWindow

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

/**
 * Cuando la aplicacion este lista ejecutara este proceso
 */
app.on('ready', () => { createWindow() })

function createWindow () {
  /**
   * Initial window options
   */
  let titleBarStylev
  if (process.platform !== 'darwin') {
    titleBarStylev = 'customButtonsOnHover'
  } else if (process.platform === 'darwin') {
    titleBarStylev = 'hidden'
  }

  mainWindow = new BrowserWindow({
    title: 'Fact.Squid',
    height: 650,
    width: 1000,
    minHeight: 650,
    minWidth: 1000,
    center: true,
    autoHideMenuBar: true,
    titleBarStyle: titleBarStylev,
    enableLargerThanScreen: true,
    show: false,
    hasShadow: true,
    backgroundColor: '#ecf0f1',
    maximizable: false
  })

  splashWindow = new BrowserWindow({
    title: 'Cargando Fact.Squid',
    height: 300,
    width: 612,
    backgroundColor: '#fff',
    autoHideMenuBar: true,
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    frame: false,
    center: true,
    show: false,
    hasShadow: true
  })

  splashWindow.loadURL('file://' + __static + '/loading.html')
  mainWindow.loadURL(winURL)

  // Cuando el splash este listo
  splashWindow.on('ready-to-show', () => {
    splashWindow.show()
  })

  // Cuando la ventana principal este lista
  mainWindow.on('ready-to-show', () => {
    splashWindow.destroy()
    mainWindow.setResizable(false)
    mainWindow.show()
  })
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
