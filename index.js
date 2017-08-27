'use strict';
const path = require('path');
const os = require('os');
const fs = require('fs');
const electron = require('electron');
const settings = require('electron-settings');
const screenshot = require('screenshot-node');
const isDev = require('electron-is-dev');

// New Upload object to handle upload and upload events
const Upload = require('./upload');
const autostart = require('./autostart');

const upload = new Upload();

const globalShortcut = electron.globalShortcut;
const ipc = electron.ipcMain;
const Menu = electron.Menu;
const Tray = electron.Tray;

const app = electron.app;
let appIcon = null;

// Needed to get transparent window on linux
if (process.platform === 'linux') {
	app.disableHardwareAcceleration();
}

// Adds debug features like hotkeys for triggering dev tools and reload
if (isDev) {
	require('electron-debug')();
}

// Prevent window being garbage collected
let mainWindow;
let mainRender = null;
let settingsWindow = null;

const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
	// Someone tried to run a second instance
	// Should maybe open the main window or flash the tray to
	// indicate that there allready is an app running.
	console.log(workingDirectory);
});

if (shouldQuit) {
	app.quit();
}
// Dereference main window/process
function onClosedMainWindow() {
	// Dereference the window
	mainWindow = null;
}

function onClosedMainRender() {
	// Dereference the main render
	mainRender = null;
}

function onClosedSettingsWindow() {
	settingsWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		width: 0,
		height: 0,
		show: false,
		icon: path.join(__dirname, '/assets/64x64.png'),
		skipTaskbar: true
	});

	win.on('closed', onClosedMainWindow);

	return win;
}

function createAboutWindow() {
	let win = new electron.BrowserWindow({
		width: electron.screen.getPrimaryDisplay().bounds.width * 0.2,
		height: electron.screen.getPrimaryDisplay().bounds.width * 0.15,
		show: false,
		icon: path.join(__dirname, '/assets/64x64.png')
	});

	const windowPath = path.join('file://', __dirname, 'windows/about.html');
	win.loadURL(windowPath);

	win.on('closed', () => {
		win = null;
	});

	win.on('ready-to-show', () => {
		win.show();
	});
}

function createMainRenderWindow() {
	if (mainRender !== null) {
		mainRender.focus();
		return;
	}
	const win = new electron.BrowserWindow({
		width: electron.screen.getPrimaryDisplay().bounds.width * 0.2,
		height: electron.screen.getPrimaryDisplay().bounds.width * 0.3,
		show: false,
		icon: path.join(__dirname, '/assets/64x64.png')
	});

	const windowPath = path.join('file://', __dirname, 'windows/main.html');
	win.loadURL(windowPath);

	win.upload = upload;

	win.on('closed', onClosedMainRender);

	win.on('ready-to-show', () => {
		win.show();
	});

	return win;
}

function createSettingsWindow() {
	if (settingsWindow !== null) {
		settingsWindow.focus();
		return;
	}
	const win = new electron.BrowserWindow({
		width: electron.screen.getPrimaryDisplay().bounds.width * 0.2,
		height: electron.screen.getPrimaryDisplay().bounds.width * 0.3,
		show: false,
		icon: path.join(__dirname, '/assets/64x64.png')
	});

	const windowPath = path.join('file://', __dirname, 'windows/settings.html');
	win.loadURL(windowPath);

	win.upload = upload;

	win.on('closed', onClosedSettingsWindow);

	win.on('ready-to-show', () => {
		win.show();
	});

	return win;
}

// Take screenshot
function takeScreenshot(size, bounds = {x: 0, y: 0, width: 0, height: 0}) {
	setTimeout(() => {
		const tempDir = os.tmpdir();
		const tmpath = path.join(tempDir, String(Date.now()));

		screenshot.saveScreenshot(bounds.x, bounds.y, bounds.width, bounds.height, tmpath, err => {
			if (err) {
				console.log(err);
			}
			// Saves the screenshot to a specified location
			function saveFile() {
				electron.dialog.showSaveDialog({title: 'Save File', defaultPath: os.homedir() + '/.png'}, filename => {
					// Check to see if it is undefine (User closed dialog window)
					if (filename !== undefined) {
						fs.createReadStream(tmpath).pipe(fs.createWriteStream(filename));
					}
				});
			}

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
							click: () => {
								electron.clipboard.writeImage(tmpath);
							}
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
								electron.shell.openExternal('https://github.com/Kuzat/hyperdesktopjs/issues/new');
							}
						},
						{
							label: 'About Hyperdesktopjs',
							click: createAboutWindow
						}
					]
				}
			]);

			// Creating the window
			let win = new electron.BrowserWindow({
				title: 'Preview window',
				show: false,
				width: size.width,
				height: size.height,
				icon: path.join(__dirname, '/assets/64x64.png')
			});

			win.tempName = tmpath;
			win.setMenu(appMenu);

			const windowPath = path.join('file://', __dirname, 'windows/screenshot-preview.html');
			win.loadURL(windowPath);

			ipc.once('ready-for-show', () => {
				win.show();
			});

			const uploadFunc = () => {
				upload.upload(tmpath);
			};

			ipc.once('ready-for-upload-' + tmpath, uploadFunc);

			win.on('closed', () => {
				ipc.removeListener('ready-for-upload', uploadFunc);
				win = null;
				fs.unlinkSync(tmpath);
			});

			return win;
		});
	}, 200);
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
		movable: false,
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
	// Seting default settings
	settings.set('default', {
		hotkeys: {
			screenshot: 'CommandOrControl+Shift+3',
			selectiveScreenshot: 'CommandOrControl+Shift+4'
		},
		upload: {
			type: 0,
			options: ['Imgur', 'FTP', 'none']
		},
		general: {
			saveToFolder: {
				active: false,
				folder: ''
			},
			copyToClipboard: false,
			openLink: true,
			autoLaunch: true
		},
		version: app.getVersion()
	});

	if (settings.get('user') === undefined) {
		settings.set('user', settings.get('default'));
	}

	if (settings.get('user.version') !== app.getVersion()) {
		settings.set('user', settings.get('default'));
	}

	mainWindow = createMainWindow();

	// Update autostart settings
	autostart.update();

	// A suitable size for the preview window
	let size = null;
	if (!shouldQuit) {
		size = {
			width: electron.screen.getPrimaryDisplay().bounds.width * 0.65,
			height: electron.screen.getPrimaryDisplay().bounds.height * 0.80
		};
	}

	// Tray icon Menu. Click functions needs to be implemented
	appIcon = new Tray(path.join(__dirname, '/assets/64x64.png'));
	const contextMenu = Menu.buildFromTemplate([
		{
			label: 'Open Window',
			click() {
				mainRender = createMainRenderWindow();
			}
		},
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
		{
			label: 'Settings',
			click() {
				settingsWindow = createSettingsWindow();
			}
		},
		{
			label: 'About',
			click: createAboutWindow
		},
		{label: 'Quit', role: 'quit'}
	]);

	// Application Menu
	const appMenu = Menu.buildFromTemplate([
		{
			label: 'File',
			submenu: [
				{
					label: 'Save',
					accelerator: 'CommandOrControl+S'
				},
				{
					label: 'Save As...'
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
					accelerator: 'CommandOrControl+C'
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
						electron.shell.openExternal('https://github.com/Kuzat/hyperdesktopjs/issues/new');
					}
				},
				{
					label: 'About Hyperdesktopjs',
					click: createAboutWindow
				}
			]
		}
	]);

	// Set the application menu
	Menu.setApplicationMenu(appMenu);

	// Set the context menu for the tray icon
	appIcon.setContextMenu(contextMenu);

	// Set the global hotkeys to the different screenshot methods
	const val = settings.get('user.hotkeys');
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
});
