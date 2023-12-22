var dev = false;

// if --dev in command line, dev = true
if (process.argv.includes('dev')) dev = true;

const { app, BrowserWindow } = require('electron');
const path = require('path');
const package = require('./package.json');

var w = 1024;
var h = 576;
if (dev) w += 555;
var win;
function createWindow() {
  win = new BrowserWindow({
    width: w,
    height: h,
    icon: path.join(__dirname, '/build/icons/256x256.png').replace(/\\/g, '\\\\')
  });
  win.setAspectRatio(w / h);
  if (dev) win.webContents.openDevTools();
  win.setBackgroundColor('#000000');
  win.removeMenu();

  win.loadFile('src/index.html');
}

app.whenReady().then(() => {
  createWindow();
  // send dev variable to JS in the window
  win.webContents.on('dom-ready', function() {
    win.webContents.executeJavaScript(`window.dev = ${dev}`);
    win.webContents.executeJavaScript(`electronBegin("${package.version}")`);
  });
  win.webContents.on("new-window", (_, url) => {
    _.preventDefault();
    const protocol = require("url").parse(url).protocol;
    if (protocol === "http:" || protocol === "https:") {
      shell.openExternal(url);
    }
  });
});
