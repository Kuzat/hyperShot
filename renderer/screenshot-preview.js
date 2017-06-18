const ipc = require('electron').ipcRenderer;
const remote = require('electron').remote;
const clipboard = require('electron').clipboard;

const tempName = remote.getCurrentWindow().tempName;

document.addEventListener('DOMContentLoaded', () => {
	let ctrlDown = false;

	document.getElementById('preview-image').src = tempName;

	ipc.send('ready-for-show', true);

	// Handle button clicks
	// Cancel button closes the window.
	document.getElementById('cancel-btn').addEventListener('click', () => {
		remote.getCurrentWindow().close();
	});

	// Upload button upload to selected upload service
	document.getElementById('upload-btn').addEventListener('click', () => {
		ipc.send('ready-for-upload-' + tempName, remote.getCurrentWindow());
		remote.getCurrentWindow().close();
	});

	// Keybinding to copy image
	window.addEventListener('keydown', event => {
		if (event.keyCode === 17 || event.keyCode === 91) {
			ctrlDown = true;
		}

		if (ctrlDown && event.keyCode === 67) {
			clipboard.writeImage(tempName);
		}
	});

	window.addEventListener('keyup', event => {
		if (event.keyCode === 17 || event.keyCode === 91) {
			ctrlDown = false;
		}
	});
});
