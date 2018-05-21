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
		ex.style.height = edit.getSession().getDocument().getLength() *
				edit.renderer.lineHeight + 'px';
		edit.resize();
		edit.setFontSize(14);

		/* 
			preview running the sketch 
			based on
			http://p5play.molleindustria.org/examples/index.html#
		*/

		/* add preview button */
		let canvas;
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

			previewBtn.onclick = function() {

				const runnable = edit.getValue();
				const _p5 = p5;
				if (canvas) {
					canvas.remove();
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
							console.log('no setup');
							p.setup = function() {
								p.createCanvas(640, 460);
							}
						}
					}
				}
				const newp5 = new _p5(s, ex.parentNode);
				canvas = newp5.canvas;
				canvas.classList.add('aces-canvas');
			};

			closeBtn.onclick = function() {
				canvas.remove();
			}

		}
	}

});
