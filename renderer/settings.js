const remote = require('electron').remote;
const settings = require('electron-settings');
const autostart = require('../autostart');

const dialog = remote.dialog;

let saveToFolderActive;
let saveToFolderFolder;
let copyToClipboard;
let openLink;
let uploadTypes;
let fullscreenHotkey;
let selectiveHotkey;
let autoLaunchSetting;

function setupSettings() {
	// Save to folder
	// Also need path to folder
	saveToFolderActive.checked = settings.get('user.general.saveToFolder.active');
	saveToFolderFolder.value = settings.get('user.general.saveToFolder.folder');

	// Copy to clipboard
	copyToClipboard.checked = settings.get('user.general.copyToClipboard');

	// Open link
	openLink.checked = settings.get('user.general.openLink');

	// Auto-launch
	autoLaunchSetting.checked = settings.get('user.general.autoLaunch');

	// Upload type
	uploadTypes.selectedIndex = settings.get('user.upload.type');

	// Fullscreen keybinding
	fullscreenHotkey.value = settings.get('user.hotkeys.screenshot');

	// Selective keybinding
	selectiveHotkey.value = settings.get('user.hotkeys.selectiveScreenshot');
}

document.addEventListener('DOMContentLoaded', () => {
	// Save settings input for easier use
	saveToFolderActive = document.getElementsByName('saveToFolder')[0];
	saveToFolderFolder = document.getElementsByName('folderPath')[0];
	copyToClipboard = document.getElementsByName('copyToClipboard')[0];
	openLink = document.getElementsByName('openLink')[0];
	uploadTypes = document.getElementsByName('upload-types')[0];
	fullscreenHotkey = document.getElementsByName('fullscreen')[0];
	selectiveHotkey = document.getElementsByName('selective')[0];
	autoLaunchSetting = document.getElementsByName('autoLaunch')[0];

	setupSettings();

	saveToFolderActive.addEventListener('change', event => {
		console.log(event.target.checked);
		settings.set('user.general.saveToFolder.active', event.target.checked);
	});

	saveToFolderFolder.onchange = event => {
		console.log(event.target.value);
		settings.set('user.general.saveToFolder.folder', event.target.value);
	};

	copyToClipboard.addEventListener('change', event => {
		console.log(event.target.checked);
		settings.set('user.general.copyToClipboard', event.target.checked);
	});

	openLink.addEventListener('change', event => {
		console.log(event.target.checked);
		settings.set('user.general.openLink', event.target.checked);
	});

	autoLaunchSetting.addEventListener('change', event => {
		console.log(event.target.checked);
		settings.set('user.general.autoLaunch', event.target.checked);
		autostart.update();
	});

	uploadTypes.addEventListener('change', event => {
		console.log(event.target.selectedIndex);
		settings.set('user.upload.type', event.target.selectedIndex);
	});

	fullscreenHotkey.onchange = event => {
		settings.set('user.hotkeys.screenshot', event.target.value);
	};

	selectiveHotkey.onchange = event => {
		settings.set('user.hotkeys.selectiveScreenshot', event.target.value);
	};

	// Reset settings to default
	document.getElementById('reset-btn').addEventListener('click', () => {
		// Reset settings
		settings.set('user', settings.get('default'));
		setupSettings();
	});

	// Set
	document.getElementById('browse-btn').addEventListener('click', () => {
		dialog.showOpenDialog({
			title: 'Choose directory',
			properties: ['openDirectory']
		}, filePaths => {
			settings.set('user.general.saveToFolder.folder', filePaths[0]);
			setupSettings();
		});
	});
});
