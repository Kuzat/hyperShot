const ipc = require('electron').ipcRenderer;
const remote = require('electron').remote;
const screen = require('electron').screen;


document.addEventListener('DOMContentLoaded', () => {
    console.log("here");
    let startPos = {x: 0, y: 0};
    let mouseDown = false;
    let x1, y1, x2, y2;
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext("2d");

    //Setup the canvas to fit the screen.
    canvas.width = screen.getPrimaryDisplay().bounds.width;
    canvas.height = screen.getPrimaryDisplay().bounds.height;

    // Fill the canvas.
    context.fillStyle = "rgba(0, 0, 0, 0.5)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    document.onmousedown = function(event) {
        mouseDown = true;
        startPos.x = event.screenX;
        startPos.y = event.screenY;
    }

    document.onmousemove = function(event) {
        console.log(event);



        //check if we have had a mouse down event.
        if(mouseDown) {
            // Fill old rectangle
            context.fillRect(x1, y1, x2 - x1, y2 - y1);

            // Calcualte the width and height
            x1 = Math.min(startPos.x, event.screenX);
            y1 = Math.min(startPos.y, event.screenY);
            x2 = Math.max(startPos.x, event.screenX);
            y2 = Math.max(startPos.y, event.screenY);

            // remove background that is selected
            context.clearRect(x1, y1, x2- x1, y2 - y1);
        }
    }

    document.onmouseup = function(event) {
        console.log(event);

        // mouse no longer down
        mouseDown = false;

    }
});

document.onkeydown = function(evt) {
    console.log("but what about here?");
    evt = evt || window.event;
    let isEscape = false;
    if ('key' in evt) {
        isEscape = (evt.key === 'Escape' || evt.key === 'Esc');
    } else {
        isEscape = (evt.keyCode == 27);
    }
    if (isEscape) remote.getCurrentWindow().close();
}
