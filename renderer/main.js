const remote = require('electron').remote;
const shell = require('electron').shell;

const dialog = remote.dialog;
const upload = remote.getCurrentWindow().upload;

function updateList(link) {
	console.log(upload.history);
	const linkItem = document.createElement('li');
	const linkList = document.getElementById('link-list');
	linkItem.className = 'link-item';
	linkItem.innerHTML = link;
	linkList.insertBefore(linkItem, linkList.firstChild);
	linkItem.addEventListener('click', () => {
		shell.openExternal(link);
	});
}

document.addEventListener('DOMContentLoaded', () => {
	// Listen for uploaded event
	upload.on('uploaded', link => {
		updateList(link);
	});

	// Add all history to list
	upload.history.forEach(link => {
		updateList(link);
	});

	document.ondragover = event => {
		event.preventDefault();
	};

	document.ondrop = event => {
		event.preventDefault();
		const files = [...event.dataTransfer.files];
		files.forEach(file => {
			upload.upload(file.path);
		});
	};

	document.getElementById('browse-btn').addEventListener('click', () => {
		dialog.showOpenDialog({
			title: 'Choose file(s)',
			filters: [
				{name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg']},
				{name: 'All Files', extensions: ['*']}
			],
			properties: ['openFile', 'multiSelections']
		}, filePaths => {
			filePaths.forEach(file => {
				upload.upload(file);
			});
		});
	});
});
