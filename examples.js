/* 
	preview running the sketch 
	based on
	http://p5play.molleindustria.org/examples/index.html#
*/
let p5functions = [ 'preload', 'setup','draw','keyPressed','keyReleased','keyTyped','mouseMoved','mouseDragged','mousePressed','mouseReleased','mouseClicked','touchStarted','touchMoved','touchEnded'];

window.addEventListener('load', function() {

	const examples = document.getElementsByClassName("ex");
	for (let i = 0; i < examples.length; i++) {
		const ex = examples[i];
		let lang = ex.dataset.lang;
		if (!lang)
			lang = "javascript";
		const edit = ace.edit(ex);
		edit.setTheme('ace/theme/xcode');
		edit.getSession().setMode('ace/mode/' + lang);
		edit.setOption('maxLines', 1000);
		edit.session.setTabSize(4);
		edit.session.setUseWrapMode(true);
		ex.style.height = edit.getSession().getDocument().getLength() *
				edit.renderer.lineHeight + 'px';
		edit.resize();
		edit.setFontSize(14);

		ex.addEventListener('keydown', function(ev) {
			if (Cool.keys[ev.which] == 'escape') {
				edit.blur();
			}
		});

		if (ex.dataset.preview != undefined) {

			const closeBtn = document.createElement('button');
			ex.parentNode.insertBefore(closeBtn, ex.nextSibling);
			closeBtn.classList.add('ace-close');
			closeBtn.textContent = "Close Preview";

			const previewBtn = document.createElement('button');
			ex.parentNode.insertBefore(previewBtn, ex.nextSibling);
			previewBtn.classList.add('ace-preview');
			previewBtn.textContent = "Preview Code";

			let canvas;
			function loadPreview() {
				const runnable = edit.getValue();
				const _p5 = p5;
				if (canvas) {
					canvas.remove();
					// future maybe reset the newp5 functions here
				}
				const s = function(p) {
					if (runnable.indexOf('setup()') === -1 && runnable.indexOf('draw()') === -1) {
						p.setup = function() {
							p.createCanvas(640, 360);
							with (p) {
								eval(runnable);
							}
						}
					} else {
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

						if (typeof p.setup === 'undefined') {
							// console.log('%c no setup', 'color:white;background:lightblue;');
							p.setup = function() {
								p.createCanvas(640, 360);
							}
						}
					}
				}
				if (runnable.indexOf('setup()') === -1 && runnable.indexOf('draw()') === -1) {
					eval(runnable);
				} else {
					const newp5 = new _p5(s, ex.parentNode);
					/* preload delay fix */
					const canvasInterval = setInterval(() => {
						if (newp5.canvas) {
							canvas = newp5.canvas;
							console.log(canvas, newp5);
							clearInterval(canvasInterval);
						}
					}, 100);

					function closePreview() {
						if (canvas) {
							canvas.remove();
							canvas = undefined;
						}
					}
					closeBtn.addEventListener("click", closePreview);
				}
			}
			previewBtn.addEventListener("click", loadPreview);

			ex.addEventListener("keydown", (ev) => {
				if (Cool.keys[ev.which] == "enter" && ev.metaKey) {
					if (canvas && canvas.parentNode)
						canvas.remove();
					else
						loadPreview();
				}
			});
		} else {
			edit.setOptions({
				readOnly: true,
				highlightActiveLine: false,
    			highlightGutterLine: false
			});
			edit.renderer.$cursorLayer.element.style.opacity=0
		}
	}
});