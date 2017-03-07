const ipc = require('electron').ipcRenderer;
const remote = require('electron').remote;
const desktopCapture = require('../renderer/desktop-capture');

document.addEventListener('DOMContentLoaded', () => {
    // Send message to main that we are ready for commands
    ipc.send('ready-for-command', true);

    ipc.on('screenshot-type', (event, arg) => {
        //regular screenshot.
        desktopCapture.screenshot((image) => {
            const img = document.getElementById('preview-image');
            img.src = image.toDataURL();

            // Sends a message to main that it is ready to be shown.
            ipc.send('ready-for-show', true);
        });
    });


    // Hnadle button clicks
    // Cancel button closes the window.
    document.getElementById('cancel-btn').addEventListener('click', () => {
        remote.getCurrentWindow().close();
    });

    //Upload button upload to selected upload service
    document.getElementById('upload-btn').addEventListener('click', () => {
        // TODO: Implement uploading function.
        // TODO: Make a new setting for different upload features.
        console.log("Uploading...")
    });

});
