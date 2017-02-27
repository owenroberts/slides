var dev = false;
var s;

function Slides() {
	var self = this;
	this.container = document.querySelector('#container');
	this.iSlides = false;
	this.start = true;
	this.slides =  document.getElementsByClassName('slide');
	this.totalSlides = this.slides.length;
	this.currentSlide = 0;
	this.isScrolling = false;
	this.noScroll = false;
	this.slideHeight = window.innerHeight;

	this.bkg;
	this.loadedBkg = false;

	this.drawings = [];
	this.loadedDrawings = [];
	this.colorMenu;
	this.colors = { pink:"FF0DD0", purple:"7C0CE8", blue: "0014FF", lightblue: "0C9BE8", green:"00FFC1"};
	this.mouseTime = 0;
	this.mouseInterval = 40; 

	/* draw loop setup */
	this.interval = 1000 / 15; // 10 frames per second
 	this.timer = Date.now();
	this.loopStarted = false;
	
	this.setup = function() {
		/* creates slides/outline buttons */
		if (this.container.className.indexOf("no") == -1) {
			var slidesBtn = document.createElement('button');
			slidesBtn.id = 'slidesBtn';
			slidesBtn.innerText = "Slides";
			slidesBtn.onclick = this.setSlides;
			container.appendChild(slidesBtn);

			var outlineBtn = document.createElement('button');
			outlineBtn.id = 'outlineBtn';
			outlineBtn.innerText = "Outline";
			outlineBtn.onclick = this.setOutline;
			container.appendChild(outlineBtn);
		}	
	};

	this.loadDrawings = function() {
		for (var i = 0; i < self.slides.length; i++){
			for (var h = 0; h < self.slides[i].children.length; h++){
				if (self.slides[i].children[h].dataset.src) {
					/* loading all of the drawings with self calling function */
					(function(i) {
						$.getJSON(self.slides[i].children[h].dataset.src, function(data) {
							self.loadDrawing(i, data);
						});
					})(i);
				}
			}
		}
	};

	// have to use self for any functions called by onclick or events
	/* sets container to slides, resizes .slide, hides mag buttons and updates scroll */
	this.setSlides = function() {
		if (!self.iSlides || self.start) {
			h = window.innerHeight;
			self.start = false;
			self.isSlides = true;
			self.container.className = 'slides';
			self.noScroll = false;
			for (var i = 0; i < self.slides.length; i++) {
				var h = self.slides[i].offsetHeight;
				if (h < self.slideHeight) {
					self.slides[i].style.height = self.slideHeight + "px";
					self.slides[i].children[0].style.marginTop = ((self.slideHeight - h) / 4) + "px";
				} else {
					self.slides[i].className = "long slide";
				}
			}
			self.updateDrawingWidth();
			self.scrollToSlide();
			var magButtons = document.getElementsByClassName('mag');
			for (var i = 0; i < magButtons.length; i++)
				magButtons[i].style.display = "none";
			if (!self.loadedBkg){
				var p5bkg = new p5(BKG);
				self.loadedBkg = true;
				self.bkg = document.querySelector('#defaultCanvas0')
			} else
				self.bkg.style.display = "block";
		}	
	};

	/* sets container to outline, generates mag buttons or shows them if already there */
	this.setOutline = function() {
		if (self.isSlides || self.start) {
			
			self.isSlides = self.start = false;
			self.container.className = 'outline';
			if (self.loadedBkg)
				self.bkg.style.display = "none";
			self.noScroll = true;
			for (var i = 0; i < self.slides.length; i++) {
				self.slides[i].style.height = "auto";
				self.slides[i].children[0].style.marginTop = "auto";
			};
			self.updateDrawingWidth();
			/* check for mag buttons */
			var magButtons = document.getElementsByClassName('mag');
			if (magButtons.length > 0) {
				for (var i = 0; i < magButtons.length; i++)
					magButtons[i].style.display = "block";
			} else {
				/* add magnifying glass icon to every image */
				var imgElements = document.getElementsByTagName('img');
				var imgs = [];
				for (var i = 0; i < imgElements.length; i++) {
					imgs.push(imgElements[i]);
				} 
				var jslocation = document.querySelector('#slidesScript').src.replace('slides3.js','');
				for (var i = 0; i < imgs.length; i++) {
					var mag = new Image();
					mag.className = "mag";
					mag.src = jslocation + "img/mag.png";
					mag.onclick = function() {
						var img = this.previousSibling;
						var imgWidth = img.naturalWidth;
						var imgHeight = img.naturalHeight;
						var ratio = imgWidth / imgHeight;
						var margin = 40;
						var left, top;
						if (imgHeight > window.innerHeight) {
							imgHeight = window.innerHeight - margin * 2;
							imgWidth = imgHeight * ratio;
						} else if (imgWidth > window.innerWidth) {
							imgWidth = window.innerWidth - margin * 2;
						}
						left = (window.innerWidth - imgWidth) / 2;
						top = (window.innerHeight - imgHeight) /2;

						var imgWrap = document.createElement('div');
						imgWrap.id = "image-popup";
						var newImg = new Image();
						newImg.src = img.src;
						newImg.className = "img";
						newImg.style.top = top + "px";
						newImg.style.left = left + "px";
						newImg.style.width = imgWidth + "px";
						imgWrap.appendChild(newImg);

						var closeImg = new Image();
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
	};

	/* finds current slide but counting through slides */
	this.setCurrentSlide = function() {
		this.currentSlide = 0;
		for (var i = 0; i < this.slides.length; i++) {
			// must be .75 down slide to go to next
			if (window.scrollY > this.slides[i].offsetTop + this.slideHeight * 0.75) {
				this.currentSlide ++;
			}
		}
	};

	/* animates scroll with setInterval, kinda choppy */
	this.scrollToSlide = function() {
		if (!self.noScroll && !self.isScrolling) {
			var startY = window.scrollY;
			var endY = self.slides[self.currentSlide].offsetTop;
			var dist = Math.abs(startY - endY);
			var increment = dist / 60;
			if (dist > 0) {
				self.isScrolling = true;
				function scrollAnimate() {
					startY += (startY < endY) ? increment : -increment;
					window.scrollTo(0, startY);
					if (Math.abs(startY - endY) < increment) {
						window.scrollTo(0, endY);
						self.isScrolling = false;
						clearInterval(anim);
					}
				}
				var anim = setInterval(scrollAnimate, 1);
			}
		}
	};

	this.nextSlide = function() {
		if (this.currentSlide < this.totalSlides - 1) {
			this.currentSlide ++;
			this.scrollToSlide();
		}
	};

	this.previousSlide = function() {
		if (this.currentSlide > 0) {
			this.currentSlide --;
			this.scrollToSlide();
		}
	};

	/* craete a new drawing on current canvas, show color menu and current canvas */
	this.toggleDrawing = function() {
		var slide = this.slides[this.currentSlide];
		if (this.drawings[this.currentSlide]) {
			var d = this.drawings[this.currentSlide];
			for (var i = 0; i < d.length; i++) {
				d[i].toggle();
			}
		}
		if (this.colorMenu) {
			if (this.colorMenu.style.display != "block")
				this.colorMenu.style.display = "block";
			else 
				this.colorMenu.style.display = "none";
		} else {
			this.colorMenu = document.createElement("div");
			this.colorMenu.id = "color-menu";
			this.colorMenu.style.display = "block";
			for (var color in this.colors) {
				var colorBtn = document.createElement('button');
				colorBtn.id = color;
				colorBtn.style.backgroundColor = "#"+this.colors[color];
				colorBtn.onclick = function() {
					self.createDrawing(self.currentSlide);
					self.drawings[self.currentSlide][self.drawings[self.currentSlide].length-1].c = self.colors[this.id];
				};
				this.colorMenu.appendChild(colorBtn);
			}
			this.container.appendChild(this.colorMenu);
		}
	};

	/* for switching between slides and outlines */
	this.updateDrawingWidth = function() {
		var drawingDivs = document.getElementsByClassName('drawing');
		for (var i = 0; i < drawingDivs.length; i++) {
			var z = drawingDivs[i].width / drawingDivs[i].parentNode.offsetWidth;
			drawingDivs[i].style.zoom = z;
		}
		var loadedDivs = document.getElementsByClassName('loaded');
		for (var i = 0; i < loadedDivs.length; i++) {
			console.log(loadedDivs[i].width / loadedDivs[i].parentNode.offsetWidth * 0.96 );
			
			var z = (loadedDivs[i].parentNode.offsetWidth * 0.96) / loadedDivs[i].width;
			console.log(z);
			loadedDivs[i].style.zoom = z;
		}
	};

	/* adds new drawing on slide -- consider doing one big canvas?? */
	this.createDrawing = function(slideNumber) {
		var canvas = document.querySelector("#c"+slideNumber);
		if (!canvas) {
			canvas = document.createElement('canvas');
			canvas.id = "c"+slideNumber;
			canvas.className = "drawing";
			canvas.width = this.slides[slideNumber].offsetWidth;
			canvas.height = this.slides[slideNumber].offsetHeight;
		}
		this.slides[slideNumber].appendChild(canvas);
		var d = new Drawing(canvas);
		if (!this.drawings[slideNumber]) 
			this.drawings[slideNumber] = [];
		this.drawings[slideNumber].push(d);
		this.startLoop();
	};

	/* loads drawings from div with data-src */
	this.loadDrawing = function(slideNumber, data) {
		var canvas = document.createElement('canvas');
		canvas.id = "#c"+slideNumber;
		canvas.className = "loaded";
		canvas.width = data.w
		canvas.height = data.h;
		this.slides[slideNumber].appendChild(canvas);
		for (var i = 0; i < data.d.length; i++) {
			var d = new Drawing(canvas);
			var z = this.slides[slideNumber].offsetWidth / data.w;
			canvas.style.zoom = z;
			d.lines = data.d[i].l;
			d.preload = true;
			d.active = true;
			d.canvas.style.display = "block";
			d.c = data.c;
			if (!this.loadedDrawings[slideNumber]) 
				this.loadedDrawings[slideNumber] = [];
			this.loadedDrawings[slideNumber].push(d);
		}
		this.startLoop();
	};

	/* draws all drawings */
	this.drawLoop = function() {
		if (Date.now() > self.timer + self.interval) {
			self.timer = Date.now();
			for (var i = 0; i < self.slides.length; i++) {
				if (self.drawings[i]) {
					self.drawings[i][0].clearCanvas();
					for (var h = 0; h < self.drawings[i].length; h++) {
				 		self.drawings[i][h].drawLines();
					}
				}
				if (self.loadedDrawings[i]) {
					self.loadedDrawings[i][0].clearCanvas();
					for (var h = 0; h < self.loadedDrawings[i].length; h++) {
				 		self.loadedDrawings[i][h].drawLines();
					}
				}
			}
		}
		window.requestAnimationFrame(self.drawLoop);
	};

	this.startLoop = function() {
		if (!this.loopStarted) {
			requestAnimationFrame(this.drawLoop);
			this.loopStarted = true;
		}
	};
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
	this.c = "000"

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
		var newVec = new Vector(event.offsetX, event.offsetY);
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

	this.drawLines = function() {
		for (var h = 0; h < this.lines.length; h++) {
			var line = this.lines[h];
			if (line.e) {
				var v = new Vector(line.e.x, line.e.y);
				v.subtract(line.s);
				v.divide(this.num);
				this.ctx.beginPath();
				this.ctx.moveTo( line.s.x + getRandom(-this.diff, this.diff), line.s.y + getRandom(-this.diff, this.diff) );
				for (var i = 0; i < this.num; i++) {
					var p = new Vector(line.s.x + v.x * i, line.s.y + v.y * i);
					this.ctx.lineTo( p.x + v.x + getRandom(-this.diff, this.diff), p.y + v.y + getRandom(-this.diff, this.diff) );
				}
				this.ctx.strokeStyle= "#"+this.c;
	      		this.ctx.stroke();
			}
		}
	};
}

/* events */
var getKey = function(ev) {
	var key = ev.which;
	switch (key) {
		case 39: 
		case 40: // up right
			if (!s.isScrolling) s.nextSlide();
		break;
		
		case 37:
		case 38: // down left
			if (!s.isScrolling) s.previousSlide();
		break;

		case 32: // space
			ev.preventDefault();
			if (s.isSlides) 
				s.toggleDrawing();
		break;

		case 79: //o
			s.setOutline();
		break;

		case 83: //s
			if (s.slides.length > 0) 
				s.setSlides();
		break;
	}
};

var resizeHandler = function() {
	var time = new Date();
	var delta = 200;
	var timeout = false;
	if (s.iSslides) {
		s.setOutline();
		if (timeout === false) {
			timeout = true;
			setTimeout(function(){
				timeout = resizeEnd(time, delta);
			}, delta);
		}
	}
};

var resizeEnd = function(time, delta) {
	if (new Date() - time < delta) {
		setTimeout(function(){
			resizeEnd(time, delta);
		}, delta);
	} else {
		s.setSlides();
		return false;
	}
};

var scrollHandler = function(ev) {
	if (s.isSlides) {
		s.setCurrentSlide();
		if (s.slides[s.currentSlide].className.indexOf("long") == -1){
			s.isScrolling = true;
			setTimeout(s.scrollToSlide, 2000);
			setTimeout(function() {
				s.isScrolling = false;
			}, 250);
		}
	}
};

/* events for drawing on canvas */
var mouseDown = function(ev) {
	if (s.drawings[s.currentSlide]) {
		var d = s.drawings[s.currentSlide][s.drawings[s.currentSlide].length-1];
		if (ev.which ==1 && d.active) {
			d.drawOn = true;
			d.addLine(ev.offsetX, ev.offsetY);
		}
	}
};

var mouseMove = function(ev) {
	if (Date.now() > s.mouseTime + s.mouseInterval) {
		s.mouseTime = Date.now();
		if (s.drawings[s.currentSlide]) {
			var d = s.drawings[s.currentSlide][s.drawings[s.currentSlide].length-1];
			if (d.drawOn) 
				d.addLine(ev.offsetX, ev.offsetY);
		}
	}
};

var mouseUp = function(ev) {
	if (s.drawings[s.currentSlide]) {
		var d = s.drawings[s.currentSlide][s.drawings[s.currentSlide].length-1];
		if (ev.which ==1 && d.active) {
			d.drawOn = false;
			if (d.moves%2==1) 
				d.lines.splice(-1,1);
			d.moves = 0;
		}
	}
};


/* launch slides */
window.onload = function() {
	s = new Slides();
	if (window.mobilecheck()) {
		document.getElementById("container").className = "outline";
	} else {
		/* set up slides */
		s.setup();
		if (dev) s.setSlides();
		else {
			s.setOutline();
			s.loadDrawings();
		}
		/* setup events */
		document.onkeydown = getKey;

		/* resize handler */
		window.resize = resizeHandler;

		/* scroll events */
		document.onwheel = scrollHandler;
		// document.onscroll = scrollHandler; // this gets called by scrollAnimate() so its triggered too much

		/* drawing events */
		document.onmousedown =  mouseDown;
		document.onmousemove =  mouseMove;
		document.onmouseup =  mouseUp;
	}
};