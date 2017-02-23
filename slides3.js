var dev = true;
function Slides() {
	var self = this;
	this.container = document.querySelector('#container');
	this.iSlides = false;
	this.start = true;
	this.slides =  document.getElementsByClassName('slides');
	this.totalSlides = this.slides.length;
	this.currentSlide = 0;
	this.scrolling = false;
	this.noScroll = false;
	this.slideHeight = window.innerHeight;

	this.drawings = [];
	this.loadedDrawings = [];

	this.bkg = document.querySelector('#defaultCanvas0');
	
	this.setup = function() {
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
		var jslocation = document.querySelector('script').src.replace('slides2.js','');
	};

	this.loadDrawings = function() {
		$('div[data-src*="json"]').each(function() {
			var parent = this.parentNode;
			var filename = this.dataset.src;
			$.getJSON(filename, function(data) {
				loadDrawing(parent, data);
			});
		});
	};

	// this gets called by onclick so it's anonymous
	this.setSlides = function() {
		if (!self.iSlides || self.start) {
			h = window.innerHeight;
			self.start = false;
			self.isSlides = true;
			console.log(self);
			self.container.className = 'slides';
			self.bkg.style.display = "block";
			self.noScroll = false;
			self.slides.each(function() {
				console.log(this);
				var elemheight = $(this).height();
				var firstchild = $(this).children()[0];
				if (elemheight > h) { $(this).addClass("long"); }
				else {
					$(this).css({height:h});
					if ( !this.className.includes("nomargin") ) 
						$(firstchild).css({marginTop:(h-elemheight)/4});
				}	
			});
			updateDrawingWidth();
			scrollToSlide();
			$('.mag').remove();
		}
	};
}

/* events */

/* launch slides */
$(document).ready( function() {
	var s = new Slides();
	if (window.mobilecheck()) {
		document.getElementById("container").className = "outline";
		var checkExist = setInterval(function() {
			if ($('#defaultCanvas0').length) {
				$('#defaultCanvas0').remove();
				clearInterval(checkExist);
			}
		}, 50);
	} else {
		s.setup();
	}
});