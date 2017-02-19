// main entry point for renderer files.
const desktopCapture = require('./renderer/desktop-capture');

document.addEventListener('DOMContentLoaded', function() {

    const screenshot = document.getElementById('screenshot');

    screenshot.addEventListener('click', function(event) {

        desktopCapture.screenshot();

    })

})
