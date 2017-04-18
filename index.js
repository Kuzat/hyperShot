'use strict';
const path = require('path');
const os = require('os');
const fs = require('fs');
const imgur = require('imgur');
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
		type: 0,
		options: ['Imgur', 'FTP', 'none']
	}
});

const app = electron.app;
let appIcon = null;

// Adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// Prevent window being garbage collected
let mainWindow;

const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
	// Someone tried to run a second instance
	// Should maybe open the main window or flash the tray to
	// indicate that there allready is an app running.
});

if (shouldQuit) {
	app.quit();
}

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

	win.on('closed', onClosed);

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

		ipc.once('ready-for-upload', () => {
			uploadImage();
		})

		return win;
	});
}

// Get screenshot bounds
function getBounds(callback) {
	let win = new electron.BrowserWindow({
		title: 'snipper',
		fullscreen: true,
		width: electron.screen.getPrimaryDisplay().bounds.width,
		height: electron.screen.getPrimaryDisplay().bounds.height,
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

// Uploads preview image to chosen platform
function uploadImage() {
	// Get the upload settings
	settings.get('upload').then(val => {
		if(val.type == 0) imgurUpload();
	});
}

// Uploads an image to imgur
function imgurUpload() {
	imgur.setClientId('eaf02dd0ebc4299');
	imgur.uploadFile('./assets/temp.png').then(json => {
		console.log(json.data.link);
		// Make this a setting
		electron.clipboard.writeText(json.data.link);
		// Make this a setting
		electron.shell.openExternal(json.data.link);

	}).catch(err => {
		console.error(err.message);
	});
}

// Saves the screenshot to a specified location
function saveFile() {
	electron.dialog.showSaveDialog({title: 'Save File', defaultPath: os.homedir()+'/.png'}, filename => {
		// Check to see if it is undefine (User closed dialog window)
		if(filename != undefined) {
		fs.createReadStream('./assets/temp.png').pipe(fs.createWriteStream(filename));
		}
	});
}


// Copies preview image to clipboard.
function copyImage() {
	electron.clipboard.writeImage('./assets/temp.png');
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
	let size = null;
	if (!shouldQuit) {
		size = {
			width: electron.screen.getPrimaryDisplay().bounds.width * 0.65,
			height: electron.screen.getPrimaryDisplay().bounds.height * 0.70
		};
	}

	// Tray icon Menu. Click functions needs to be implemented
	appIcon = new Tray('./assets/64x64.png');
	const contextMenu = Menu.buildFromTemplate([
		{label: 'Open Window'},
		{
			label: 'Take Selective Screenshot',
			click() {
				getBounds(bounds => {
					takeScreenshot(size, bounds);
				});
			}
		},
		{
			label: 'Take Screenshot',
			click() {
				takeScreenshot(size);
			}
		},
		{type: 'separator'},
		{label: 'Settings'},
		{label: 'About'},
		{label: 'Quit', role: 'quit'}
	]);

	// Application Menu
	const appMenu = Menu.buildFromTemplate([
		{
			label: 'File',
			submenu: [
				{
					label: 'Save',
					accelerator: 'CommandOrControl+S',
					click: saveFile
				},
				{
					label: 'Save As...',
					click: saveFile
				},
				{
					label: 'Close Window',
					role: 'close'
				}
			]
		},
		{
			label: 'Edit',
			submenu: [
				{
					label: 'Copy',
					accelerator: 'CommandOrControl+C',
					click: copyImage
				}
			]
		},
		{
			label: 'Help',
			submenu: [
				{
					label: 'Version ' + app.getVersion(),
					enabled: false
				},
				{
					label: 'Report an Issue...',
					click() {
						electron.shell.openExternal("https://github.com/Kuzat/hyperdesktopjs/issues/new")
					}
				},
				{
					label: 'About Hyperdesktopjs',
					click() {
						electron.shell.openExternal("https://github.com/Kuzat/hyperdesktopjs");
					}
				}
			]
		}
	])

	// Set the application menu
	Menu.setApplicationMenu(appMenu);


	// Set the context menu for the tray icon
	appIcon.setContextMenu(contextMenu);

	// Set the global hotkeys to the different screenshot methods
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
		// TODO: Screenshot of active window
/*		globalShortcut.register(val.windowScreenshot, () => {
			takeScreenshot(size);
		});
*/
	});
});
