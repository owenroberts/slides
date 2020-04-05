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
	},

	/* sets container to slides, resizes .slide, hides mag buttons and updates scroll */
	setSlides: function() {
		if (!S.isSlides) {
			S.isSlides = true;
			S.container.classList.add('slides');
			S.container.classList.remove('outline');

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
							child.tagName != "UL" &&
							!child.classList.contains('label')) {
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
			for (let i = 0; i < magButtons.length; i++) {
				magButtons[i].style.display = "none";
			}

			/* load bkg if not loaded */
			/* p5 cellular automata bkg, maybe make some new ones? */
			if (!S.bkg) 
				S.bkg = new p5(BKG);
			else 
				S.bkg.toggle();
			
			S.scrollToSlide(); /* scroll back to the current slide */
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

			if (S.bkg)
				S.bkg.toggle();
			for (let i = 0; i < S.slides.length; i++) {
				S.slides[i].style.height = "auto";
				S.slides[i].dataset.index = i;
				if (S.slides[i].children.length > 0) {
					if (S.slides[i].children[0].tagName != "H2")
						S.slides[i].children[0].style.marginTop = "auto";
					else
						S.slides[i].children[0].style.marginTop = "2em";
				}
			}

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
		if (S.currentSlide < S.totalSlides - 1) {
			S.currentSlide ++;
			S.scrollToSlide();
		}
	},

	previousSlide: function() {
		if (S.currentSlide > 0) {
			S.currentSlide --;
			S.scrollToSlide();
		}
	},

	/* key board events */
	getKey: function(ev) {
		if (ev.target.tagName == "BODY") {
			switch (Cool.keys[ev.which]) {
				case "down": 
				case "right":
					if (!S.isScrolling) S.nextSlide();
				break;
				
				case "up":
				case "left":
					if (!S.isScrolling) S.previousSlide();
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

				case "space":
					ev.preventDefault();
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
}

/* launch slides */
window.addEventListener('load', function() {
	if (Cool.mobilecheck()) {
		document.getElementById("container").className = "outline";
	} else {
		/* set up slides */
		S.setup();
		S.setOutline();
		if (S.dev) console.clear(); // clear net work logs for development 
		document.addEventListener("keydown", S.getKey); /* setup events */
		window.addEventListener("resize", S.resizeHandler); /* resize handler */
		document.addEventListener("wheel", S.scrollHandler); /* scroll events */
	}
});