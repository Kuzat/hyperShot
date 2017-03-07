const ipc = require('electron').ipcRenderer;
const remote = require('electron').remote;
const screen = require('electron').screen;


document.addEventListener('DOMContentLoaded', () => {
    console.log("here");
    let startPos = {x: 0, y: 0};
    let mouseDown = false;
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
        // Calcualte the width and height
        let x1 = Math.min(startPos.x, event.screenX);
        let y1 = Math.min(startPos.y, event.screenY);
        let x2 = Math.max(startPos.x, event.screenX);
        let y2 = Math.max(startPos.y, event.screenY);


        //check if we have had a mouse down event.
        if(mouseDown) {
            // remove background that is selected
            context.clearRect(x1, y1, x2, y2);
            // Clear and fill the rest to update it. 4 rects; Above, bellow, and both sides.
            //clear
            context.clearRect(0, 0, canvas.width, startPos.y);
            context.clearRect(0, event.screenY, canvas.width, canvas.height-event.screenY);
            context.clearRect(0, startPos.y, startPos.x, event.screenY-startPos.y);
            context.clearRect(event.screenX, startPos.y, canvas.width-event.screenX, event.screenY-startPos.y);
            //fill
            //context.fillStyle = "rgba(0, 0, 0, 0.5)";
            context.fillRect(0, 0, canvas.width, startPos.y);
            context.fillRect(0, event.screenY, canvas.width, canvas.height-event.screenY);
            context.fillRect(0, startPos.y, startPos.x, event.screenY-startPos.y);
            context.fillRect(event.screenX, startPos.y, canvas.width-event.screenX, event.screenY-startPos.y);
        }
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
