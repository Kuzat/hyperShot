const EventEmitter = require('events');
const electron = require('electron');
const settings = require('electron-settings');
const imgur = require('imgur');

class Upload extends EventEmitter {

	constructor() {
		super();
		this.history = [];
	}

	// Uploads an image to imgur
	imgurUpload(tempName) {
		imgur.setClientId('eaf02dd0ebc4299');
		imgur.uploadFile(tempName).then(json => {
			console.log(json.data.link);
			// Make this a setting
			electron.clipboard.writeText(json.data.link);
			// Make this a setting
			electron.shell.openExternal(json.data.link);
			// Add to history
			this.addUploadToHistory(json.data.link);
			// Emit event
			this.emit('uploaded', json.data.link);
		}).catch(err => {
			console.error(err.message);
		});
	}

	// Upload image with ftp
	ftpUpload(tempName) {
		console.log(tempName);
	}

	// Uploads preview image to chosen platform
	upload(tempName) {
		// Get the upload settings
		switch (settings.get('upload.type')) {
			case 0:
				this.imgurUpload(tempName);
				break;
			case 1:
				this.ftpUpload(tempName);
				break;
			default:
				console.log('None upload selected');
		}
	}

	addUploadToHistory(link) {
		if (this.history.length >= 10) {
			this.history.shift();
		}
		this.history.push(link);
	}
}
module.exports = Upload;
