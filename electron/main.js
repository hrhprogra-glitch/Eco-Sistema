const { app, BrowserWindow } = require("electron");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");

const isDev = !app.isPackaged;
const port = process.env.PORT || 3000;
const url = `http://localhost:${port}`;

let serverProcess;
let mainWindow;

function waitForServer(targetUrl, callback) {
  const attempt = () => {
    http
      .get(targetUrl, () => callback())
      .on("error", () => setTimeout(attempt, 300));
  };
  attempt();
}

function startStandaloneServer() {
  const serverPath = path.join(process.resourcesPath, "standalone", "server.js");
  serverProcess = spawn(process.execPath, [serverPath], {
    env: { ...process.env, PORT: String(port), NODE_ENV: "production" },
    stdio: "inherit",
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "..", "src", "app", "imagenes", "logo.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenu(null);


  mainWindow.loadURL(url);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  if (!isDev) {
    startStandaloneServer();
  }

  waitForServer(url, createWindow);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (serverProcess) serverProcess.kill();
});
