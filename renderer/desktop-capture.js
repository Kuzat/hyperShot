const electron = require('electron');
const desktopCapturer = electron.desktopCapturer;
const electronScreen = electron.screen;
const shell = electron.shell;

const fs = require('fs');
const os = require('os');
const path = require('path');


// Takes a screenshot of the fullpage and return the screenshot as a NativeImage
module.exports.screenshot = function(callback) {
    const thumbSize = determineScreenShotSize();

    let options = { types: ['screen'], thumbnailSize: thumbSize };

    desktopCapturer.getSources(options, function(error, sources) {
        if (error) return console.log(error);

        sources.forEach(function(source) {
            if (source.name === 'Entire screen' || source.name === 'Screen 1') {
                callback(source.thumbnail);
            }
        });
    });
};

function determineScreenShotSize () {
  const screenSize = electronScreen.getPrimaryDisplay().workAreaSize;
  const maxDimension = Math.max(screenSize.width, screenSize.height);
  return {
    width: Math.round(maxDimension * window.devicePixelRatio),
    height: Math.round(maxDimension * window.devicePixelRatio)
  }
}
