const ipc = require('electron').ipcRenderer;
const remote = require('electron').remote;
const screen = require('electron').screen;

document.addEventListener('DOMContentLoaded', () => {
	const startPos = {x: 0, y: 0};
	const canvas = document.getElementById('canvas');
	const context = canvas.getContext('2d');

	let mouseDown = false;
	let x1;
	let y1;
	let x2;
	let y2;

	// Setup the canvas to fit the screen.
	canvas.width = screen.getPrimaryDisplay().bounds.width;
	canvas.height = screen.getPrimaryDisplay().bounds.height;

	// Fill the canvas.
	context.fillStyle = 'rgba(0, 0, 0, 0.5)';
	context.fillRect(0, 0, canvas.width, canvas.height);

	document.onmousedown = event => {
		mouseDown = true;
		startPos.x = event.clientX;
		startPos.y = event.clientY;
	};

	document.onmousemove = event => {
		// Check if we have had a mouse down event.
		if (mouseDown) {
			console.log(event);

			// Fill old rectangle
			context.fillRect(x1, y1, x2 - x1, y2 - y1);

			// Calcualte the width and height
			x1 = Math.min(startPos.x, event.clientX);
			y1 = Math.min(startPos.y, event.clientY);
			x2 = Math.max(startPos.x, event.clientX);
			y2 = Math.max(startPos.y, event.clientY);

			// Remove background that is selected
			context.clearRect(x1, y1, x2 - x1, y2 - y1);
		}
	};

	document.onmouseup = event => {
		console.log(event);
		console.log('Mouse up');
		// Mouse no longer down
		mouseDown = false;
		ipc.send('ready-for-bounds', {x: x1, y: y1, width: x2 - x1, height: y2 - y1});
		remote.getCurrentWindow().close();
	};
});

document.onkeydown = event => {
	event = event || window.event;
	let isEscape = false;
	if ('key' in event) {
		isEscape = (event.key === 'Escape' || event.key === 'Esc');
	} else {
		isEscape = (event.keyCode === 27);
	}
	if (isEscape) {
		remote.getCurrentWindow().close();
	}
};
