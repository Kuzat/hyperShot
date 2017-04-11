const ipc = require('electron').ipcRenderer;
const remote = require('electron').remote;

document.addEventListener('DOMContentLoaded', () => {
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
	});
});
