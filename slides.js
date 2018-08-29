/* S = slides object literal, controls slides and resetting to outline, loading drawings and events */
var S = {
	setup: function() {
		this.dev = false;
		this.isSlides = false; /* current view is slides */
		this.start = true; /* to create slides at run */
		this.isScrolling = false; /* prevent scrolling actions while scrolling */
		this.slideHeight = window.innerHeight;

		/* get references to contianer and slides */
		this.container = document.getElementById('container');
		this.slides =  document.getElementsByClassName('slide'); // slide elements
		this.totalSlides = this.slides.length;
		this.currentSlide = localStorage.getItem(location.pathname) || 0; // mainly for testing, returns to slide after reload, good for when i need to reload in class
		
		this.drawings = []; /* drawings made on slides, maybe get rid of this */
		this.loadedDrawings = []; /* preload drawings */
		
		/* draw loop setup */
		this.fps = 7;
		this.interval = 1000 / this.fps;
		this.timer = performance.now();
		this.loopStarted = false; // this is bc draw loop triggered in too places, kinda pointless?  also pause drawings??? 

		/* drawing timer */
		this.mouseTime = 0;
		this.mouseInterval = 30;

		/* creates slides/outline buttons 
			in js so it does't have to be in html */
		if (this.container.className.indexOf("no") == -1) {
			const slidesBtn = document.createElement('button');
			slidesBtn.id = 'slidesBtn';
			slidesBtn.innerText = "Slides";
			slidesBtn.onclick = this.setSlides;
			container.appendChild(slidesBtn);

			const outlineBtn = document.createElement('button');
			outlineBtn.id = 'outlineBtn';
			outlineBtn.innerText = "Outline";
			outlineBtn.onclick = this.setOutline;
			container.appendChild(outlineBtn);
		}

		this.loadDrawings();
	},

	/* sets container to slides, resizes .slide, hides mag buttons and updates scroll */
	setSlides: function() {
		if (!S.isSlides) {
			S.isSlides = true;
			S.container.classList.add('slides');
			S.container.classList.remove('outline');
			S.updateDrawingWidth();


			/* go through slides and set margin top to center vertically (ish actually closer to top)
				css version: .slide
					display: flex; flex-direction: column; justify-content: center; */
			for (let i = 0; i < S.slides.length; i++) {
				const slide =  S.slides[i];
				slide.children[0].style.marginTop = "0";
				let h = slide.offsetHeight;
				if (h < S.slideHeight) {
					slide.style.height = S.slideHeight + "px";
					if (slide.children.length > 0) 
						slide.children[0].style.marginTop = ((S.slideHeight - h) / 4) + "px";
				} else {
					slide.className = "long slide";
					slide.children[0].style.marginTop = "null";
				}

				if (S.container.classList.contains('reveal') && i > 0) {
					for (let j = 1; j < slide.children.length; j++) {
						const child = slide.children[j];
						if (child.tagName != "H1" && 
							child.tagName != "H2" && 
							child.tagName != "BUTTON" &&
							child.tagName != "UL") {
							child.classList.add('reveal');
						} else if (child.tagName == "UL") {
							for (let k = 0; k < child.children.length; k++) {
								child.children[k].classList.add('reveal');
							}
						}
					}
				}
			}
			
			/* get rid of mag buttons on images */
			const magButtons = document.getElementsByClassName('mag');
			for (let i = 0; i < magButtons.length; i++)
				magButtons[i].style.display = "none";

			/* load bkg if not loaded */
			/* p5 cellular automata bkg, maybe make some new ones? */
			if (!S.bkg) 
				S.bkg = new p5(BKG);
			else 
				S.bkg.toggle();

			// fix for chrome crappiness
			document.body.style.backgroundColor = S.bkg.alive.toString();

			S.colors = { 
				white: "#ffffff",
				black: "#000000",
				alive: S.bkg.aliveOpp.toString(),
				born: S.bkg.bornOpp.toString(),
				died: S.bkg.diedOpp.toString(),
				nothing: S.bkg.nothingOpp.toString()
				/*pink:"FF0DD0", 
				purple:"7C0CE8", 
				blue: "0014FF", 
				lightblue: "0C9BE8", 
				green:"00FFC1"*/
			}; 
			/* color pallette for drawings
				based on bkg, this look ok?...  */

			/* scroll back to the current slide */
			S.scrollToSlide();
		}
	},

	revealItem: function() {
		const children = S.slides[S.currentSlide].children;
		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			if (child.tagName == "UL") {
				for (let j = 0; j < child.children.length; j++) {
					const ch = child.children[j];
					if (ch.classList.contains('reveal')) {
						ch.classList.add('show');
						ch.classList.remove('reveal');
						break;
					}
				}
			}
			if (child.classList.contains('reveal')) {
				child.classList.add('show');
				child.classList.remove('reveal');
				break;
			}
		}
	},

	focusCode: function() {
		if (S.isSlides) {
			const c = S.slides[S.currentSlide].children[0].firstElementChild;
			if (c.tagName == "TEXTAREA") {
				c.focus();
			}
		}
	},

	/* sets container to outline, generates mag buttons or shows them if already there */
	setOutline: function() {
		if (S.isSlides || S.start) {
			if (S.start) 
				S.start = false;
			S.isSlides = false;
			S.container.classList.add('outline');
			S.container.classList.remove('slides');
			/* hide current drawings */
			if (S.drawings[S.currentSlide])
				if (S.drawings[S.currentSlide][0].active)
					S.toggleDrawing();
			if (S.bkg)
				S.bkg.toggle();
			for (let i = 0; i < S.slides.length; i++) {
				S.slides[i].style.height = "auto";
				S.slides[i].dataset.number = i;
				if (S.slides[i].children.length > 0) {
					if (S.slides[i].children[0].tagName != "H2")
						S.slides[i].children[0].style.marginTop = "auto";
					else
						S.slides[i].children[0].style.marginTop = "2em";
				}

			};
			S.updateDrawingWidth();

			// fix for chrome crappiness
			document.body.style.backgroundColor = 'aliceblue';

			/* check for mag buttons */
			const magButtons = document.getElementsByClassName('mag');
			if (magButtons.length > 0) {
				for (var i = 0; i < magButtons.length; i++)
					magButtons[i].style.display = "block";
			} else {
				/* add magnifying glass icon to every image */
				const imgElements = document.getElementsByTagName('img');
				const imgs = [];
				for (let i = 0; i < imgElements.length; i++) {
					imgs.push(imgElements[i]);
				} 
				const jslocation = document.getElementById('slidesScript').src.replace('slides.js','');
				for (let i = 0; i < imgs.length; i++) {
					const mag = new Image();
					mag.className = "mag";
					mag.src = jslocation + "img/mag.png";
					mag.onclick = function() {
						const img = this.previousSibling;
						let imgWidth;
						let imgHeight;
						const ratio = img.naturalWidth / img.naturalHeight;
						const margin = 40;
						let left, top;
						/* sizing the image to make sure it fits, why is this shit so hard */
						if (img.naturalHeight > window.innerHeight) {
							imgHeight = window.innerHeight - margin * 2;
							imgWidth = imgHeight * ratio;
							if (imgWidth > window.innerWidth) {
								imgWidth = window.innerWidth - margin * 2;
								imgHeight = imgWidth / ratio;
							}
						} else if (img.naturalWidth > window.innerWidth) {

							imgWidth = window.innerWidth - margin * 2;
							imgHeight = imgWidth / ratio;
						} else {
							imgWidth = img.naturalWidth - margin * 2;
							imgHeight = img.naturalHeight - margin * 2;
						}
						left = (window.innerWidth - imgWidth) / 2;
						top = (window.innerHeight - imgHeight) /2;

						const imgWrap = document.createElement('div');
						imgWrap.id = "image-popup";
						const newImg = new Image();
						newImg.src = img.src;
						newImg.className = "img";
						newImg.style.top = top + "px";
						newImg.style.left = left + "px";
						newImg.style.width = imgWidth + "px";
						imgWrap.appendChild(newImg);

						const closeImg = new Image();
						closeImg.src = jslocation + "img/close.png";
						closeImg.className = "close";
						closeImg.style.top = top + "px";
						closeImg.style.left = left + "px";
						closeImg.onclick = function() {
							imgWrap.parentNode.removeChild(imgWrap);
						}
						imgWrap.appendChild(closeImg);
						document.body.appendChild(imgWrap);
					};

					imgs[i].parentNode.insertBefore(mag, imgs[i].nextSibling);
				}
			}
		}
	},

	/* for switching between slides and outlines */
		/* added drawings are hidden and don't need to be upated .... */
	updateDrawingWidth: function() {
		const loadedCanvases = document.getElementsByClassName('loaded');
		for (var i = 0; i < loadedCanvases.length; i++) {
			const canvas = loadedCanvases[i];
			const ctx = canvas.getContext('2d');
			// 0.96 for padding 2%
			const z =  (canvas.parentNode.offsetWidth * 0.96) / +canvas.dataset.width;
			canvas.width = canvas.parentNode.offsetWidth * 0.96;
			canvas.height = +canvas.dataset.height * z;
			ctx.scale(z,z);
			ctx.miterLimit = 1;
			ctx.lineWidth = 2;

		}
	},

	/* finds current slide by ounting through slides */
	setCurrentSlide: function() {
		S.currentSlide = 0;
		for (var i = 0; i < S.slides.length; i++) {
			// must be .75 down slide to go to next // this gets fucked up sometimes
			if (window.scrollY > S.slides[i].offsetTop + S.slideHeight * 0.75) {
				if (S.currentSlide < S.slides.length - 1)
					S.currentSlide ++;
			}
		}
	},

	/* animates scroll with setInterval, kinda choppy */
	scrollToSlide: function() {
		localStorage.setItem(location.pathname, S.currentSlide);
		if (S.isSlides && !S.isScrolling) {
			var startY = window.scrollY;
			var endY = S.slides[S.currentSlide].offsetTop;
			var dist = Math.abs(startY - endY);
			var increment = dist / 30;
			if (dist > 0) {
				S.isScrolling = true;
				function scrollAnimate() {
					startY += (startY < endY) ? increment : -increment;
					window.scrollTo(0, startY);
					if (Math.abs(startY - endY) < increment) {
						window.scrollTo(0, endY);
						S.isScrolling = false;
						clearInterval(anim);
					}
				}
				var anim = setInterval(scrollAnimate, 1000 / 60);
			}
		}
	},

	nextSlide: function() {
		if (S.drawings[S.currentSlide])
			if (S.drawings[S.currentSlide][0].active)
				S.toggleDrawing();
		if (S.currentSlide < S.totalSlides - 1) {
			S.currentSlide ++;
			S.scrollToSlide();
		}
	},

	previousSlide: function() {
		if (S.drawings[S.currentSlide])
			if (S.drawings[S.currentSlide][0].active)
				S.toggleDrawing();
		if (S.currentSlide > 0) {
			S.currentSlide --;
			S.scrollToSlide();
		}
	},

	/* advantage of literal, use S. instead of self */
	loadDrawings: function() {
		for (let i = 0; i < S.slides.length; i++){
			for (let h = 0; h < S.slides[i].children.length; h++){
				if (S.slides[i].children[h].dataset.src) {
					const div = S.slides[i].children[h];
					/* loading all of the drawings with Slides calling function */
					$.getJSON(div.dataset.src, function(data) {
						S.loadDrawing(i, data);
						div.parentNode.removeChild(div);
						S.updateDrawingWidth();
					}).fail(function(data, textStatus, error) {
						div.innerText += "Drawing data error: " + error;
					});
				}
			}
		}
	},

	/* create a new drawing on current canvas, show color menu and current canvas */
	toggleDrawing: function() {
		var slide = S.slides[S.currentSlide];
		if (S.drawings[S.currentSlide]) {
			var d = S.drawings[S.currentSlide];
			for (var i = 0; i < d.length; i++) {
				d[i].toggle();
			}
		} else {
			S.createDrawing(S.currentSlide);
		}
		if (S.colorMenu) {
			if (S.colorMenu.style.display != "block")
				S.colorMenu.style.display = "block";
			else 
				S.colorMenu.style.display = "none";
		} else {
			S.colorMenu = document.createElement("div");
			S.colorMenu.id = "color-menu";
			S.colorMenu.style.display = "block";
			for (var color in S.colors) {
				var colorBtn = document.createElement('button');
				colorBtn.id = color;
				colorBtn.style.backgroundColor = S.colors[color];
				colorBtn.onclick = function() {
					/* some issue here where first drawings keeps changing color ... */
					var d = S.createDrawing(S.currentSlide);
					d.c = S.colors[this.id];
				};
				S.colorMenu.appendChild(colorBtn);
			}
			S.container.appendChild(S.colorMenu);
		}
	}, 

	/* adds new drawing on slide  */
	createDrawing: function(slideNumber) {
		var canvas = document.querySelector("#c"+slideNumber);
		if (!canvas) {
			canvas = document.createElement('canvas');
			canvas.id = "c"+slideNumber;
			canvas.className = "drawing";
			canvas.width = S.slides[slideNumber].offsetWidth;
			canvas.height = S.slides[slideNumber].offsetHeight;
		}
		S.slides[slideNumber].appendChild(canvas);
		var d = new Drawing(canvas);
		if (!S.drawings[slideNumber]) 
			S.drawings[slideNumber] = [];
		S.drawings[slideNumber].push(d);
		S.startLoop();
		return d;
	},

	/* loads drawings from div with data-src */
	loadDrawing: function(slideNumber, data) {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.className = "loaded";
		canvas.setAttribute('data-width', data.w);
		canvas.setAttribute('data-height', data.h);
		canvas.width = data.w;
		canvas.height = data.h;
		S.slides[slideNumber].appendChild(canvas);
		const w = S.slides[slideNumber].offsetWidth * 0.96;
		var z = w / data.w;
		for (var i = 0; i < data.d.length; i++) {
			// this x is really silly: 
			if (data.d[i] != "x") {
				var d = new Drawing(canvas);
				d.lines = data.d[i].l;
				d.preload = true;
				d.active = true;
				d.canvas.style.display = "block";
				d.c = data.d[i].c;
				if (!S.loadedDrawings[slideNumber]) 
					S.loadedDrawings[slideNumber] = [];
				S.loadedDrawings[slideNumber].push(d);
			}
		}
		S.startLoop(); /* start drawing */
	},

	/* draws all drawings */
	drawLoop: function() {
		/* performance issues with many drawings */
		if (performance.now() > S.timer + S.interval && !S.isScrolling) {
			S.timer = performance.now();
			for (var i = 0; i < S.slides.length; i++) {
				if (S.drawings[i]) {
					S.drawings[i][0].clearCanvas();
					for (var h = 0; h < S.drawings[i].length; h++) {
				 		S.drawings[i][h].drawLines();
					}
				}
				if (S.loadedDrawings[i]) {
					S.loadedDrawings[i][0].clearCanvas();
					for (var h = 0; h < S.loadedDrawings[i].length; h++) {
						S.loadedDrawings[i][h].drawLines();
					}
				}
			}
		}
		window.requestAnimFrame(S.drawLoop);
	},

	startLoop: function() {
		if (!S.loopStarted) {
			requestAnimFrame(S.drawLoop);
			S.loopStarted = true;
		}
	},

	/* key board events */
	getKey: function(ev) {
		if (ev.target.classList[0] != "ace_text-input") {
			switch (Cool.keys[ev.which]) {
				case "down": 
				case "right":
					if (!S.isScrolling) S.nextSlide();
				break;
				
				case "up":
				case "left":
					if (!S.isScrolling) S.previousSlide();
				break;

				case "space":
					ev.preventDefault();
					if (S.isSlides) 
						S.toggleDrawing();
				break;

				case "o":
					S.setOutline();
				break;

				case "s":
					if (S.slides.length > 0) 
						S.setSlides();
				break;

				case "r":
					S.revealItem();
				break;

				case "c":
					ev.preventDefault();
					S.focusCode();
				break;

				case "m":
					const m = document.getElementById('menu');
					if (m.classList.contains('show-menu')) {
						m.classList.remove('show-menu');
					} else {
						m.classList.add('show-menu')
					}
				break;
			}
		}
	},

	resizeHandler: function() {
		var time = new Date();
		var delta = 200;
		var timeout = false;
		if (S.iSslides) {
			S.setOutline();
			if (timeout === false) {
				timeout = true;
				setTimeout(function(){
					timeout = S.resizeEnd(time, delta);
				}, delta);
			}
		}
	},

	resizeEnd: function(time, delta) {
		if (new Date() - time < delta) {
			setTimeout(function(){
				S.resizeEnd(time, delta);
			}, delta);
		} else {
			S.setSlides();
			return false;
		}
	},

	scrollHandler: function(ev) {
		if (S.isSlides) {
			S.setCurrentSlide();
			if (S.slides[S.currentSlide].className.indexOf("long") == -1){
				S.isScrolling = true;
				setTimeout(S.scrollToSlide, 2000);
				setTimeout(function() {
					S.isScrolling = false;
				}, 250);
			}
		}
	},

	/* events for drawing on canvas */
	mouseDown: function(ev) {
		if (S.drawings[S.currentSlide]) {
			var d = S.drawings[S.currentSlide][S.drawings[S.currentSlide].length-1];
			if (ev.which ==1 && d.active) {
				d.drawOn = true;
				d.addLine(ev.offsetX, ev.offsetY);
			}
		}
	},

	mouseMove: function(ev) {
		if (Date.now() > S.mouseTime + S.mouseInterval) {
			S.mouseTime = Date.now();
			if (S.drawings[S.currentSlide]) {
				var d = S.drawings[S.currentSlide][S.drawings[S.currentSlide].length-1];
				if (d.drawOn) 
					d.addLine(ev.offsetX, ev.offsetY);
			}
		}
	},

	mouseUp: function(ev) {
		if (S.drawings[S.currentSlide]) {
			var d = S.drawings[S.currentSlide][S.drawings[S.currentSlide].length-1];
			if (ev.which ==1 && d.active) {
				d.drawOn = false;
				if (d.moves%2==1) 
					d.lines.splice(-1,1);
				d.moves = 0;
			}
		}
	}
}

/* drawing constructor */
function Drawing(canvas) {
	this.lines = [];
	this.canvas = canvas;
	this.w = this.canvas.width;
	this.h = this.canvas.height;
	this.ctx = this.canvas.getContext('2d');
	this.ctx.lineWidth = 2;
	this.ctx.lineCap = 'round';
	this.ctx.miterLimit = 1;
	this.num  = 2;
	this.diff = 1;
	this.drawOn = false;
	this.moves = 0;
	this.active = true;
	this.preload = false;
	this.c = "000";

	this.toggle = function() {
		if (!this.preload) {
			if (this.active) {
				this.active = false;
				this.canvas.style.display = "none";
				this.drawOn = false;
			} else {
				this.active = true;
				this.canvas.style.display = "block";
			}
		}
	};

	this.addLine = function(mx, my) {
		var newVec = new Cool.Vector(event.offsetX, event.offsetY);
		this.lines.push({
			s: newVec
		});
		if (this.moves > 0)
			this.lines[this.lines.length - 2].e = newVec; 
		this.moves++;
	};

	this.clearCanvas = function() {
		this.ctx.clearRect(0, 0, this.w, this.h);
	};

	this.setScale = function(s) {
		this.ctx.scale(s, s);
	}

	this.drawLines = function() {
		this.ctx.beginPath();
		for (var h = 0; h < this.lines.length; h++) {
			var line = this.lines[h];
			if (line.e) {
				var v = new Cool.Vector(line.e.x, line.e.y);
				v.subtract(line.s);
				v.divide(this.num);
				
				this.ctx.moveTo( line.s.x + Cool.random(-this.diff, this.diff), line.s.y + Cool.random(-this.diff, this.diff) );
				for (var i = 0; i < this.num; i++) {
					var p = new Cool.Vector(line.s.x + v.x * i, line.s.y + v.y * i);
					this.ctx.lineTo( p.x + v.x + Cool.random(-this.diff, this.diff), p.y + v.y + Cool.random(-this.diff, this.diff) );
				}
				if (this.ctx.strokeStyle != this.c) {
					this.ctx.strokeStyle = this.c;
				}
	      		
			}
		}
		this.ctx.stroke();
	};
}
/* launch slides */
$(window).on('load', function() {
	
	if (window.mobilecheck()) {
		document.getElementById("container").className = "outline";
	} else {
		/* set up slides */
		S.setup();
		S.setOutline();
		if (S.dev) console.clear(); // clear net work logs for development 

		/* setup events */
		document.addEventListener("keydown", S.getKey);

		/* resize handler */
		window.addEventListener("resize", S.resizeHandler);

		/* scroll events */
		document.addEventListener("wheel", S.scrollHandler);

		/* drawing events */
		document.addEventListener("mousedown", S.mouseDown);
		document.addEventListener("mousemove", S.mouseMove);
		document.addEventListener("mouseup", S.mouseUp);
	}
});