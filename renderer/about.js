const remote = require('electron').remote;
const shell = require('electron').shell;

document.addEventListener('DOMContentLoaded', () => {
	const versionNumber = remote.app.getVersion();
	const versionLink = document.getElementById('version-number');
	versionLink.text = versionNumber;
	versionLink.addEventListener('click', () => {
		shell.openExternal('https://github.com/Kuzat/hyperShot/releases/tag/v'+versionNumber);
	});
});
