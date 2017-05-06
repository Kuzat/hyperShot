const electron = require('electron');
const settings = require('electron-settings');
const imgur = require('imgur');

// Uploads an image to imgur
function imgurUpload(tempName) {
	imgur.setClientId('eaf02dd0ebc4299');
	imgur.uploadFile('./assets/temp/' + tempName).then(json => {
		console.log(json.data.link);
		// Make this a setting
		electron.clipboard.writeText(json.data.link);
		// Make this a setting
		electron.shell.openExternal(json.data.link);
	}).catch(err => {
		console.error(err.message);
	});
}

// Upload image with ftp
function ftpUpload(tempName) {
	console.log(tempName);
}

// Uploads preview image to chosen platform
module.exports = tempName => {
	// Get the upload settings
	switch (settings.get('upload.type')) {
		case 0:
			imgurUpload(tempName);
			break;
		case 1:
			ftpUpload(tempName);
			break;
		default:
			console.log('None upload selected');
	}
};
