const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { spawn } = require("child_process");
const syncWorker = require("./sync/worker");

const isDev = !app.isPackaged;
const port = process.env.PORT || 3000;
const url = `http://localhost:${port}`;

let serverProcess;
let mainWindow;

function loadEnvFile() {
  const envPath = path.join(__dirname, "..", ".env.local");
  const env = {};
  if (!fs.existsSync(envPath)) return env;

  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return env;
}

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

  const env = loadEnvFile();
  if (env.DATABASE_URL && env.SUPABASE_DATABASE_URL) {
    syncWorker.start({
      localConnectionString: env.DATABASE_URL,
      cloudConnectionString: env.SUPABASE_DATABASE_URL,
    });
  } else {
    console.warn("[sync] faltan DATABASE_URL/SUPABASE_DATABASE_URL en .env.local, el worker no arranca");
  }

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
  syncWorker.stop();
});
