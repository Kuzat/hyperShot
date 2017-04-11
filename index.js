'use strict';
const path = require('path');
const electron = require('electron');
const settings = require('electron-settings');
const screenshot = require('screenshot-node');

const globalShortcut = electron.globalShortcut;
const ipc = electron.ipcMain;
const Menu = electron.Menu;
const Tray = electron.Tray;

// Seting default settings
settings.defaults({
	hotkeys: {
		screenshot: 'CommandOrControl+Shift+3',
		selectiveScreenshot: 'CommandOrControl+Shift+4',
		windowScreenshot: 'CommandOrControl+Shift+5'
	},
	upload: {
		type: '0',
		options: ['imgur', 'ftp', 'dont']
	}
});

const app = electron.app;
let appIcon = null;

// Adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// Prevent window being garbage collected
let mainWindow;

function onClosed() {
	// Dereference the window
	mainWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		width: 0,
		height: 0,
		show: false,
		icon: './assets/64x64.png'
	});

	const windowPath = path.join('file://', __dirname, 'index.html');
	win.loadURL(windowPath);
	win.on('closed', onClosed);

	win.webContents.openDevTools();

	return win;
}

// Take screenshot
function takeScreenshot(size, bounds = {x: 0, y: 0, width: 0, height: 0}) {
	screenshot.saveScreenshot(bounds.x, bounds.y, bounds.width, bounds.height, './assets/temp.png', err => {
		if (err) {
			console.log(err);
		}

		let win = new electron.BrowserWindow({
			title: 'Preview window',
			show: false,
			width: size.width,
			height: size.height,
			icon: './assets/64x64.png'
		});

		const windowPath = path.join('file://', __dirname, 'windows/screenshot-preview.html');
		win.loadURL(windowPath);
		win.on('closed', () => {
			win = null;
		});

		win.webContents.openDevTools();

		ipc.once('ready-for-show', () => {
			win.show();
		});

		return win;
	});
}

function getBounds(callback) {
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
	ipc.once('ready-for-bounds', (event, arg) => {
		callback(arg);
	});

	win.webContents.openDevTools();
}

// ######### HANDLE APP EVENTS ###########
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

	// A suitable size for the preview window
	const size = {
		width: electron.screen.getPrimaryDisplay().bounds.width * 0.65,
		height: electron.screen.getPrimaryDisplay().bounds.height * 0.70
	};

	// TODO: Implement this properly.
	// Testing tray
	appIcon = new Tray('./assets/64x64.png');
	const contextMenu = Menu.buildFromTemplate([
		{label: 'Item1', type: 'radio'},
		{label: 'Item2', type: 'radio'}
	]);

	contextMenu.items[1].checked = false;

	appIcon.setContextMenu(contextMenu);

	settings.get('hotkeys').then(val => {
		// Full screenshot
		globalShortcut.register(val.screenshot, () => {
			takeScreenshot(size);
		});
		// Screenshot of selected area
		globalShortcut.register(val.selectiveScreenshot, () => {
			getBounds(bounds => {
				takeScreenshot(size, bounds);
			});
		});
		// Screenshot of active window
		globalShortcut.register(val.windowScreenshot, () => {
			takeScreenshot(size);
		});
	});
});
