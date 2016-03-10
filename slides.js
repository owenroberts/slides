$(document).ready( function() {

	var dev = false;

	var container = $('#container');

	var slidesBtn = $('<button>').attr('id', 'slidesBtn').text('Slides');
	var outlineBtn = $('<button>').attr('id', 'outlineBtn').text('Outline');
	$(container).append(slidesBtn);
	$(container).append(outlineBtn);

	var slides = $('.slide');
	var isslides = false;
	var start = true;
	var slideNumber = 0;
	var numSlides = slides.length;
	var scrolling = false;
	var noscroll = false;

	var h = window.innerHeight;

	var drawings = [];

	var mousetime = 40;
	var mousetimer = 0;

	var setSlides = function() {
		if (!isslides || start) {
			start = false;
			isslides = true;
			$(container).addClass('slides');
			$(container).removeClass('outline');
			$('#defaultCanvas0').show();
			noscroll = false;
			slides.each(function() {
				var elemheight = $(this).height();
				if (elemheight > h) { $(this).addClass("long"); }
				else {
					$(this).css({height:h});
					var firstchild = $(this).children()[0];
					if (firstchild.dataset.src) {
						var filename = firstchild.dataset.src;
						$.getJSON(filename, function(data) {
							createDrawing(firstchild.parentNode, data);
						});
					}
					$(firstchild).css({marginTop:(h-elemheight)/4});

				}	
			});
			setSlideNumber();
			scrollToSlide();
		}
	};
	$(slidesBtn).on('click', setSlides);
	
	var setOutline = function() {
		if (isslides || start) {
			start = false;
			isslides = false;
			$(container).removeClass('slides');
			$(container).addClass('outline');
			$('#defaultCanvas0').hide();
			$('canvas').hide();
			noscroll = true;
			slides.each(function() {
				$(this).css({height:"auto"});
				var firstchild = $(this).children()[0];
				$(firstchild).css({marginTop:"auto"});
			});
		}
	};
	$(outlineBtn).on('click', setOutline);
	

	var setSlideNumber = function() {
		var longslide = $(slides[slideNumber]).attr('class');
		if (longslide.indexOf("long") == -1) {
			slideNumber = 0;
			for ( var i = 0; i < slides.length; i++) {
				if ( $(document).scrollTop() > $(slides[i]).offset().top + h/4) {
					slideNumber++;
				}
			}
			return true;
		} else return false;
	};

	var scrollToSlide = function() {
		if (!noscroll) {
			$('body, html').animate({
				scrollTop: $(slides[slideNumber]).offset().top
			}, 500, function() {
				scrolling = false;
			});
		}
	}
	
	var nextSlide = function() {
		if (slideNumber < numSlides - 1) {
			slideNumber++;
			scrollToSlide();
		}
	};

	var previousSlide = function() {
		if (slideNumber > 0) {
			slideNumber--;
			scrollToSlide();
		}
	};

	/* helpers */
	function getRandom(min, max) {
		   return Math.random() * (max - min) + min;
	}

	function Point(x, y) {
		this.x = x;
		this.y = y;
	}

	function Vector(a, b) {
		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.divide = function(n) {
			this.x /= n;
			this.y /= n;
		};
	}

	function Drawing(canvasId) {
		this.lines = [];
		this.c = document.querySelector(canvasId);
		this.w = this.c.width;
		this.h = this.c.height;
		this.ctx = this.c.getContext('2d');
		this.numRange  = 2;
		this.diffRange = 1;
		this.drawOn = false;
		this.moves = 0;
		this.active = true;
		this.preload = false;

		this.toggle = function() {
			if (!this.preload) {
				if (this.active) {
					this.active = false;
					this.c.style.display = "none";
					this.drawOn = false;
				} else {
					this.active = true;
					this.c.style.display = "block";
				}
			}
		}

		this.addLine = function(mx, my) {
			var newpoint = new Point(event.offsetX, event.offsetY);
			if (this.moves > 0) {
				this.lines.push({
					start: newpoint,
					num: this.numRange,
					diff: getRandom(this.diffRange/2,this.diffRange)
				});
				this.lines[this.lines.length - 2].end = newpoint;
			} else {
				this.lines.push({
					start: newpoint,
					num: this.numRange,
					diff: getRandom(this.diffRange/2,this.diffRange)
				});
			}
			this.moves++;
		}


		this.drawLines = function() {
			this.ctx.canvas.width = this.ctx.canvas.width;
			for (var h = 0; h < this.lines.length; h++) {
				var line = this.lines[h];
				if (line.end) {
					var v = new Vector(line.end, line.start);
					v.divide(line.num);
					this.ctx.lineWidth = 2;
					this.ctx.lineCap = 'round';
					this.ctx.beginPath();
					for (var i = 0; i < line.num; i++) {
						var p = new Point(line.start.x + v.x * i, line.start.y + v.y * i);
						this.ctx.moveTo( p.x + getRandom(-line.diff, line.diff), p.y + getRandom(-line.diff, line.diff) );
						this.ctx.lineTo( p.x + v.x + getRandom(-line.diff, line.diff), p.y + v.y + getRandom(-line.diff, line.diff) );
					}
					this.ctx.strokeStyle = "#000";
		      		this.ctx.stroke();
				}
			}
		}
	}


	var drawingToggle = function() {
		var s = $(slides[slideNumber])[0];
		if (drawings[slideNumber]) {
			drawings[slideNumber].toggle();
		} else {
			createDrawing(s);
		}
	}

	var createDrawing = function(slide, linesData) {
		var sn = $(slide).index();
		var c = $('<canvas>')
			.attr({
				id: "c"+sn,
				width: slide.offsetWidth,
				height: slide.offsetHeight
			})
			.addClass("drawing");
		slide.appendChild(c[0]);
		var d = new Drawing("#c"+sn);
		if (linesData) {
			d.lines = linesData.lines;
			d.preload = true;
			d.active = true;
			d.c.style.display = "block";
		}
		drawings[sn] = d;
		requestAnimationFrame(drawLoop);
	}


	setSlideNumber();
	
	if (dev) setSlides();
	else {
		setOutline();
		var checkExist = setInterval(function() {
		   if ($('#defaultCanvas0').length) {
		      $('#defaultCanvas0').hide();
		      clearInterval(checkExist);
		   }
		}, 50);
	}


	/* events */
	$(document).on('keydown', function(ev) {
		//console.log(ev.which);
		var key = ev.which;
		switch (key) {
			case 39: 
			case 40:
				nextSlide();
			break;
			
			case 37:
			case 38:
				previousSlide();
			break;

			case 32:
				ev.preventDefault();
				if (isslides) drawingToggle();
			break;

			case 79:
				setOutline();
			break;

			case 83:
				setSlides();
			break;

			case 70: // f
				saveDrawing();
			break;

		}
	});

	function saveDrawing() {
		var jsonfile = JSON.stringify(drawings[slideNumber]);
		var filename = prompt("Name this file:");
		if (filename) {
			var blob = new Blob([jsonfile], {type:"application/x-download;charset=utf-8"});
			saveAs(blob, filename+".json");
		}
	}

	$(document).on("wheel", function() {
		var slideOkay = setSlideNumber();
		if (!scrolling && slideOkay) setTimeout(scrollToSlide, 2000);
		scrolling = true;
	});

	$(document).on('mousemove', function(event) {
		if (Date.now() > mousetime + mousetimer) {
			mousetimer = Date.now();
			if (drawings[slideNumber]) {
				if (drawings[slideNumber].drawOn) 
					drawings[slideNumber].addLine(event.offsetX, event.offsetY);
			}
		}
	});

	$(document).on('mousedown', function(event) {
		if (drawings[slideNumber]) {
			if (event.which == 1 && drawings[slideNumber].active) {
				drawings[slideNumber].drawOn = true;
				drawings[slideNumber].addLine(event.offsetX, event.offsetY);
			}
		}			
	});

	$(document).on('mouseup', function(event) {
		if (drawings[slideNumber]) {
			if (event.which == 1 && drawings[slideNumber].active) {
				drawings[slideNumber].drawOn = false;
				if (drawings[slideNumber].moves%2==1) drawings[slideNumber].lines.splice(-1,1);
				drawings[slideNumber].moves = 0;
			}
		}
	});

	var fps = 10;
	var interval = 1000/fps;
	var timer = Date.now();

	var drawLoop = function() {
		requestAnimationFrame(drawLoop);
		if (Date.now() > timer + interval) {
			timer = Date.now();
			if (drawings[slideNumber]) {
				drawings[slideNumber].drawLines();
			}
		}
	}

	

});