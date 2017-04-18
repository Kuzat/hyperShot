const ipc = require('electron').ipcRenderer;
const remote = require('electron').remote;
const clipboard = require('electron').clipboard;

document.addEventListener('DOMContentLoaded', () => {
	let ctrlDown = false;
	ipc.send('ready-for-show', true);

	// Handle button clicks
	// Cancel button closes the window.
	document.getElementById('cancel-btn').addEventListener('click', () => {
		remote.getCurrentWindow().close();
	});

	// Upload button upload to selected upload service
	document.getElementById('upload-btn').addEventListener('click', () => {
		// TODO: Implement uploading function.
		// TODO: Make a new setting for different upload features.
		console.log('Uploading...');
		ipc.send('ready-for-upload');
		remote.getCurrentWindow().hide();
		
	});

	// Keybinding to copy image
	window.addEventListener('keydown', (event) => {
		if (event.keyCode === 17 || event.keyCode === 91) {
			ctrlDown = true;
		}

		if (ctrlDown && event.keyCode === 67) {
			clipboard.writeImage('./assets/temp.png');
		}

	})

	window.addEventListener('keyup', (event) => {
		if (event.keyCode === 17 || event.keyCode === 91) {
			ctrlDown = false;
		}
	})
});
