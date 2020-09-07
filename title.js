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
const fullscreen = document.getElementById('fullscreen');




fullscreen.onclick = function() {
	bg.startFullscreen();
};

update.onclick = function() {
	bg.updateText(title.value, sub.value);
};

capture.onclick = function() {
	bg.startCapture();
};


document.addEventListener("keydown", ev => {
	switch (Cool.keys[ev.which]) {
		case "o":
			input.style.display = 'block';
		break;

		case "s":
			
		break;
	}
});