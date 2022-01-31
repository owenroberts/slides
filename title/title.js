const bg = new p5(BG);

const updateInterval = setInterval(() => {
	bg.gen();
}, 1000/60 * 100);

const input = document.getElementById('input');
const slide = document.getElementById('slide');
const title = document.getElementById('title');
const sub = document.getElementById('sub');
const update = document.getElementById('update');
const capture = document.getElementById('capture');
const captureImage = document.getElementById('image');
const fullscreen = document.getElementById('fullscreen');
const reset = document.getElementById('reset');

fullscreen.onclick = function() {
	bg.startFullscreen();
};

update.onclick = function() {
	bg.updateText(title.value, sub.value);
};

capture.onclick = function() {
	console.log('start');
	bg.startCapture();
};

captureImage.onclick = function() {
	bg.captureImage();
};

reset.onclick = function() {
	bg.setup();
};
