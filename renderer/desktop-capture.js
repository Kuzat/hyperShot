const electron = require('electron');
const desktopCapturer = electron.desktopCapturer;
const electronScreen = electron.screen;
const shell = electron.shell;

const fs = require('fs');
const os = require('os');
const path = require('path');



module.exports.screenshot = function() {

    const thumbSize = determineScreenShotSize();

    let options = { types: ['screen'], thumbnailSize: thumbSize };

    desktopCapturer.getSources(options, function(error, sources) {
        if (error) return console.log(error);

        sources.forEach(function(source) {
            if (source.name == 'Entire screen' || source.name == 'Screen 1') {
                let blob = new Blob([source.thumbnail.toPng()], {'type': 'image/png'});
                let url = URL.createObjectURL(blob);
                document.getElementById('screenshot-image').src = url;
            }
        })

    })


}

function determineScreenShotSize () {
  const screenSize = electronScreen.getPrimaryDisplay().workAreaSize;
  const maxDimension = Math.max(screenSize.width, screenSize.height);
  return {
    width: Math.round(maxDimension * window.devicePixelRatio),
    height: Math.round(maxDimension * window.devicePixelRatio)
  }
}
