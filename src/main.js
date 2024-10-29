require('./server.js')

let mainWindow = null

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    minHeight: 750,
    minWidth: 750,
    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
    },
  })
  mainWindow.loadURL('http://localhost:3000/build-dist')
  mainWindow.setMenuBarVisibility(false)
  mainWindow.on('close', (event) => (mainWindow = null))
})
