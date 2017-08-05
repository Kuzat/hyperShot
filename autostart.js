const AutoLaunch = require('auto-launch');
const settings = require('electron-settings');

const hyperShotAutoLauncher = new AutoLaunch({
	name: 'hyperShot'
});

exports.update = () => {
	if (settings.get('user.general.autoLaunch')) {
		hyperShotAutoLauncher.enable();
	} else {
		hyperShotAutoLauncher.disable();
	}
};
