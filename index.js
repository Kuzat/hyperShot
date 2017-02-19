'use strict';
const electron = require('electron');
const settings = require('electron-settings');
const globalShortcut = electron.globalShortcut;

// Seting default settings
settings.defaults({
	hotkeys: {
		screenshot: 'CommandOrControl+Shift+3',
		selectiveScreenshot: 'CommandOrControl+Shift+4',
		windowScreenshot: 'CommandOrControl+Shift+5'
	}
});

const app = electron.app;

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow;



function onClosed() {
	// dereference the window
	// for multiple windows store them in an array
	mainWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		width: 600,
		height: 400
	});

	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);

	win.webContents.openDevTools();

	return win;
}

app.on('will-quit', () => {
	globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {
	mainWindow = createMainWindow();

	settings.get('hotkeys').then(val => {
		// Full screenshot
		globalShortcut.register(hotkeys.screenshot, screenshot());
		// Screenshot of selected area
		globalShortcut.register(hotkeys.selectiveScreenshot, selectiveScreenshot());
		// Screenshot of active window
		globalShortcut.register(hotkeys.windowScreenshot, windowScreenshot());
	});

});
