/*
	p5 graphics template
	v0.5 - mmp
*/




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
const colorSelect = document.getElementById('color');

let canvas;
function loadPreview() {
	let runnable = edit.getValue();
	runnable += document.getElementById('setup').innerText;
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
	}

	const newp5 = new _p5(s, ex.parentNode);
	saveButton.addEventListener('click', function() {
		newp5.save(document.getElementById('filename').value);
	});
	colorSelect.addEventListener('input', function() {
		setColor(this.value);
	});
	const canvasInterval = setInterval(() => {
		if (newp5.canvas) {
			canvas = newp5.canvas;
			clearInterval(canvasInterval);
		}
	}, 100);

}