/*
	p5 graphics template
	v0.5 - mmp
*/

var p, pa, g, ga;
function setupGraphics() {
	textSize(16);
	textAlign(LEFT, BOTTOM);
	textFont('menlo');
	g = color(255, 215, 0);
	p = color(100, 100, 220);
	ga = color(255, 215, 0, 127);
	pa = color(100, 100, 220, 127);
}

function dottedLine(x1, y1, x2, y2, len) {
	var d = dist(x1, y1, x2, y2);
	var v = new p5.Vector(x2, y2);
	v.sub(new p5.Vector(x1, y1));
	v.div(d/len);
	
	var s = new p5.Vector(x1, y1);
	for (let i = 0; i < d/len; i++) {
		if (i % 2 == 0)
			line(s.x, s.y, s.x + v.x, s.y + v.y);
		s.add(v);
	}
}

function displayMousePosition() {
	noStroke(); fill(0);
	text('x: ' + mouseX, u/2, u);
	text('y: ' + mouseY, u/2, u * 2);
}

function grid(unit) {
	background(200);
	stroke(220);
	strokeWeight(1);
	let x = unit,
		y = unit;
	const columnNum = width / unit;
	const rowNum = height / unit;
	for (let col = 1; col <= columnNum; col++) {
		for (let row = 1; row <= columnNum; row++) {
			line(x, 0, x, height);
			x += unit;
		}
		line(0, y, width, y);
		x = unit;
		y += unit;
	}
	stroke('black'); // reset stroke
}


let p5functions = [ 'preload', 'setup','draw','keyPressed','keyReleased','keyTyped','mouseMoved','mouseDragged','mousePressed','mouseReleased','mouseClicked','touchStarted','touchMoved','touchEnded', 'save'];

const ex = document.getElementById('edit');
const edit = ace.edit(ex);
edit.setTheme('ace/theme/xcode');
edit.getSession().setMode('ace/mode/javascript');
edit.setOption('maxLines', 1000);
edit.session.setTabSize(4);
edit.session.setUseWrapMode(true);
ex.style.height = edit.getSession().getDocument().getLength() * edit.renderer.lineHeight + 'px';
edit.resize();
edit.setFontSize(14);

const saveButton = document.getElementById('save');

const updateButton = document.getElementById('update');
updateButton.addEventListener("click", loadPreview);

let canvas;
function loadPreview() {
	const runnable = edit.getValue();
	const _p5 = p5;
	if (canvas) canvas.remove();

	const s = function(p) {
		with (p) {
			eval(runnable);
		}

		var fxns = p5functions;
		fxns.forEach(function(f) {
			if (runnable.indexOf("function " + f + "()") !== -1) {
				with (p) {
					p[f] = eval(f);
				}
			}
		});

		saveButton.addEventListener('click', save);
	}

	const newp5 = new _p5(s, ex.parentNode);
	const canvasInterval = setInterval(() => {
		if (newp5.canvas) {
			canvas = newp5.canvas;
			clearInterval(canvasInterval);
		}
	}, 100);

}