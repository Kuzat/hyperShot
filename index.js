'use strict';
const electron = require('electron');
const settings = require('electron-settings');
const globalShortcut = electron.globalShortcut;
const ipc = electron.ipcMain;
const Menu = electron.Menu;

const path = require('path');

// Seting default settings
settings.defaults({
	hotkeys: {
		screenshot: 'CommandOrControl+Shift+3',
		selectiveScreenshot: 'CommandOrControl+Shift+4',
		windowScreenshot: 'CommandOrControl+Shift+5'
	},
	upload : {
		type: '0',
		options: ['imgur', 'ftp', 'dont']
	}
});

const app = electron.app;

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow;

function onClosed() {
	// dereference the window
	mainWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		width: 600,
		height: 400,
		icon: 'assets/64x64.png'
	});

	const windowPath = path.join('file://', __dirname, 'index.html');
	win.loadURL(windowPath);
	win.on('closed', onClosed);

	win.webContents.openDevTools();

	return win;
}

function takeScreenshot(type, bounds = null) {
	let win = new electron.BrowserWindow({
		title: 'Preview window',
		show: false,
		minWidth: 800,
		minHeigth: 600,
		icon: 'assets/64x64.png'
	});

	const windowPath = path.join('file://', __dirname, 'windows/screenshot-preview.html');
	win.loadURL(windowPath);
	win.on('closed', () => {
		win = null;
	});

	win.webContents.openDevTools();

	ipc.once('ready-for-command', (event, arg) => {
		event.sender.send('screenshot-type', type);
	});

	ipc.once('ready-for-show', (event, arg) => {
		win.show();
	});

	return win;
}

function getBounds(callback) {
	const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
	console.log(width + "  " + height);
	let win = new electron.BrowserWindow({
		title: 'snipper',
		fullscreen: true,
		transparent: true,
		frame: false,
		alwaysOnTop: true,
		skipTaskbar: true,
		resizeable: false,
		show: false
	});

	const windowPath = path.join('file://', __dirname, 'windows/snippet.html');
	win.loadURL(windowPath);
	win.on('closed', () => {
		win = null;
	});
	win.on('ready-to-show', () => {
		win.show();
	});

	win.webContents.openDevTools();

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
		globalShortcut.register(val.screenshot, () => {
			takeScreenshot('screenshot');
		 });
		// Screenshot of selected area
		globalShortcut.register(val.selectiveScreenshot, () => {
			getBounds((bounds) => {
				takeScreenshot('selective-screenshot', bounds);
			});
		});
		// Screenshot of active window
		globalShortcut.register(val.windowScreenshot, () => {
			takeScreenshot('window-screenshot');
		 });
	});

});
