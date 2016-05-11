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

	slides.each(function() {
		var firstchild = $(this).children()[0];
		if (firstchild.dataset.src) {
			var filename = firstchild.dataset.src;
			$.getJSON(filename, function(data) {
				createDrawing(firstchild.parentNode, data);
			});
		}
	});

	var setSlides = function() {
		if (!isslides || start) {
			h = window.innerHeight;
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
					if ( !this.className.includes("nomargin") ) 
						$(firstchild).css({marginTop:(h-elemheight)/4});
				}	
			});
			updateDrawingWidth();
			setSlideNumber();
			scrollToSlide();

			$('.mag').remove();
		}
	};
	$(slidesBtn).on('click', setSlides);
	
	var setOutline = function() {
		if (isslides || start) {
			updateDrawingWidth();
			start = false;
			isslides = false;
			$(container).removeClass('slides');
			$(container).addClass('outline');
			$('#defaultCanvas0').hide();
			noscroll = true;
			slides.each(function() {
				$(this).css({height:"auto"});
				var firstchild = $(this).children()[0];
				$(firstchild).css({marginTop:"auto"});
			});
			updateDrawingWidth();
			var mag = $('<img>')
				.attr({src:"../slides/img/mag.png"})
				.addClass("mag")
				.css({cursor:"pointer", position:"relative", top:-38, left:2, display:"block"})
				.on('click', function() {
					var imgsib = $(this).prev();
					var imgw = imgsib[0].naturalWidth;
					var left = 40;
					if (imgw > window.innerWidth) imgw = window.innerWidth - 80;
					else left =  (window.innerWidth - imgw) / 2;

					var imgwrap = $('<div>')
						.attr({id:"image-popup"})
						.css({
							position:"fixed", top:0, left:0, bottom:0, right:0,
							background:"rgba(240, 248, 255,0.9)", zIndex:99
						});
					console.log(imgsib[0].src);
					var newimg = $("<img>")
						.css({position:"relative", top:"4em", width:imgw, left:left })
						.attr({src:imgsib[0].src});
					imgwrap.append(newimg);

					var close = $("<img>")
						.attr({src:"../slides/img/close.png"})
						.css({display:"block", cursor:"pointer", position:"relative", top:"4em", left:left})
						.on('click', function() {
							$('#image-popup').remove();
						});

					imgwrap.append(close);

					$('body').append(imgwrap);
				});
			$('img').after(mag);

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
		this.num  = 2;
		this.diff = 1;
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
			this.lines.push({
				s: newpoint
			});
			if (this.moves > 0)
				this.lines[this.lines.length - 2].e = newpoint; 
			this.moves++;
		}


		this.drawLines = function() {
			this.ctx.canvas.width = this.ctx.canvas.width;
			for (var h = 0; h < this.lines.length; h++) {
				var line = this.lines[h];
				if (line.e) {
					var v = new Vector(line.e, line.s);
					v.divide(this.num);
					this.ctx.lineWidth = 2;
					this.ctx.lineCap = 'round';
					this.ctx.beginPath();
					for (var i = 0; i < this.num; i++) {
						var p = new Point(line.s.x + v.x * i, line.s.y + v.y * i);
						this.ctx.moveTo( p.x + getRandom(-this.diff, this.diff), p.y + getRandom(-this.diff, this.diff) );
						this.ctx.lineTo( p.x + v.x + getRandom(-this.diff, this.diff), p.y + v.y + getRandom(-this.diff, this.diff) );
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

	var updateDrawingWidth = function() {
		$('.drawing').each( function() {
			var z = this.parentNode.offsetWidth / this.width;
			this.style.zoom = z;
			var zd = (this.parentNode.offsetHeight - (z * this.height))/2;
			console.log(this.height);
			if (zd > 0) {
				this.style.top = zd + "px";
			}
		});
	}
	

	var createDrawing = function(slide, linesData) {
		var sn = $(slide).index();
		if (linesData) {
			var c = $('<canvas>')
			.attr({
				id: "c"+sn,
				width:linesData.w,
				height:linesData.h
			})
			.addClass("drawing");
			slide.appendChild(c[0]);
			var d = new Drawing("#c"+sn);
			var z = slide.offsetWidth / linesData.w;
			c[0].style.zoom = z;
			var zd = slide.offsetHeight - z*linesData.h;
			if (zd > 0) {
				c[0].style.top = zd + "px";
			}
			d.lines = linesData.l;
			d.preload = true;
			d.active = true;
			d.c.style.display = "block";
		} else {
			var c = $('<canvas>')
			.attr({
				id: "c"+sn,
				width: slide.offsetWidth,
				height: slide.offsetHeight
			})
			.addClass("drawing");
			slide.appendChild(c[0]);
			var d = new Drawing("#c"+sn);
		}
		drawings[sn] = d;
		requestAnimationFrame(drawLoop);
	}

	function saveDrawing() {
		var temp = {
			l:drawings[slideNumber].lines,
			w:drawings[slideNumber].w,
			h:drawings[slideNumber].h
		}
		var jsonfile = JSON.stringify(temp);
		console.log(jsonfile);
		var filename = prompt("Name this file:");
		if (filename) {
			var blob = new Blob([jsonfile], {type:"application/x-download;charset=utf-8"});
			saveAs(blob, filename+".json");
		}
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

	var rtime;
	var timeout = false;
	var delta = 200;
	$(window).resize(function() {
	    rtime = new Date();
	    if (isslides) {
	    	setOutline();
	    	if (timeout === false) {
	        timeout = true;
	     	   setTimeout(resizeend, delta);
	    	}
	    }
	});

	function resizeend() {
	    if (new Date() - rtime < delta) {
	        setTimeout(resizeend, delta);
	    } else {
	        timeout = false;
	       	setSlides();
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
			for (var i = 0; i < slides.length; i++) {
				if (drawings[i]) drawings[i].drawLines();
			}
		}
	}

	

});