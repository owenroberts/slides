var setupSlides = function() {

	var dev = true;

	var container = $('#container');

	if (!container.hasClass("noslides")) {
		var slidesBtn = $('<button>').attr('id', 'slidesBtn').text('Slides');
		var outlineBtn = $('<button>').attr('id', 'outlineBtn').text('Outline');
		$(container).append(slidesBtn);
		$(container).append(outlineBtn);
	}

	var jslocation = $('script[src*="slides.js"]').attr('src');
	jslocation = jslocation.replace('slides.js','');

	var slides = $('.slide');
	var isslides = false;
	var start = true;
	var slideNumber = 0;
	var numSlides = slides.length;
	var scrolling = false;
	var noscroll = false;

	var h = window.innerHeight;

	var drawings = [];
	var loadedDrawings = [];

	var mousetime = 40;
	var mousetimer = 0;


	$('div[data-src*="json"]').each(function() {
		var parent = this.parentNode;
		var filename = this.dataset.src;
		$.getJSON(filename, function(data) {
			loadDrawing(parent, data);
		});
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
				.attr({src:jslocation + "img/mag.png"})
				.addClass("mag")
				.css({cursor:"pointer", position:"relative", top:-30, left:2, display:"block", width:'24px'})
				.on('click', function() {
					var imgsib = $(this).prev();
					var imgw = imgsib[0].naturalWidth;
					var imgh = imgsib[0].naturalHeight;
					var ratio = imgw/imgh;
					var margin = 40;
					var left, top;
					
					if (imgh > window.innerHeight) {
						imgh = window.innerHeight - margin*2;
						imgw = imgh * ratio;
					} else if (imgw > window.innerWidth) {
						imgw = window.innerWidth - margin*2;
					}
					left =  (window.innerWidth - imgw) / 2;
					top = (window.innerHeight - imgh) / 2;

					var imgwrap = $('<div>')
						.attr({id:"image-popup"})
						.css({
							position:"fixed", top:0, left:0, bottom:0, right:0,
							background:"rgba(207, 218, 255,0.975)", zIndex:99
						});
					var newimg = $("<img>")
						.css({position:"relative", top:top, width:imgw, left:left })
						.attr({src:imgsib[0].src});
					imgwrap.append(newimg);

					var close = $("<img>")
						.attr({src:jslocation + "/img/close.png"})
						.css({display:"block", cursor:"pointer", position:"relative", top:top, left:left})
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
	

	var setSlideNumber = function(num) {
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
		}

		this.addLine = function(mx, my) {

			var newVec = new Vector(event.offsetX, event.offsetY);
			this.lines.push({
				s: newVec
			});
			if (this.moves > 0)
				this.lines[this.lines.length - 2].e = newVec; 
			this.moves++;
		}

		this.clearCanvas = function() {
			this.ctx.clearRect(0, 0, this.w, this.h);
		}

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
		}
	}


	var drawingToggle = function() {
		var s = $(slides[slideNumber])[0];
		if (drawings[slideNumber]) {
			for (var i = 0; i < drawings[slideNumber].length; i++) {
				drawings[slideNumber][i].toggle();
			}
		}	
		createDrawing(s);
		if ($('#color-menu').length)
			$('#color-menu').toggle();
		else createColorMenu();
	}
	var colors = { pink:"FF0DD0", purple:"7C0CE8", blue: "0014FF", lightblue: "0C9BE8", green:"00FFC1"};
	var createColorMenu = function() {
		var colorMenu = $('<div>')
			.attr('id', 'color-menu')
			.css({
				position:"fixed",
				zIndex: "99",
				top:"0",
				right:"0"
			});
		
		for (var color in colors) {
			var colorButton = $('<button>')
				.attr('id', color)
				.css({
					width:"60px", 
					height:"60px", 
					border:"10px solid lightgray", 
					background:"#"+colors[color]
				});
			colorButton.click(function() {
				createDrawing(slides[slideNumber]);
				drawings[slideNumber][drawings[slideNumber].length-1].c = colors[this.id];
			});
			$(colorMenu).append(colorButton);
		}
		$(container).append(colorMenu);
	}

	var updateDrawingWidth = function() {
		$('.drawing').each( function() {
			var z = this.parentNode.offsetWidth / this.width;
			this.style.zoom = z;
		});
		$('.loaded').each( function() {
			console.log(this);
			var z = this.parentNode.offsetWidth / this.width;
			this.style.zoom = z;
		});
	}

	var createDrawing = function(slide) {
		var sn = $(slide).index();
		var canvas;
		if ($('#c'+sn).length) {
			canvas = $('#c'+sn);
		} else {
			canvas = $('<canvas>')
				.attr({
					id: "c"+sn,
					width: slide.offsetWidth,
					height: slide.offsetHeight
				})
				.addClass("drawing");
		}
		slide.appendChild(canvas[0]);
		var d = new Drawing(canvas[0]);
		if (!drawings[sn]) drawings[sn] = [];
		drawings[sn].push(d);
		startLoop();
	}
	

	var loadDrawing = function(slide, linesData) {
		var sn = $(slide).index();
		var canvas = $('<canvas>')
			.attr({
				id: "can"+sn,
				width: linesData.w,
				height: linesData.h
			})
			.addClass("loaded");
			slide.appendChild(canvas[0]);
		// loops through drawings in frame
		for (var i = 0; i < linesData.d.length; i++) {
			if (linesData.d[i] != "x"){
				var d = new Drawing(canvas[0]);
				var z = slide.offsetWidth / linesData.w;
				canvas[0].style.zoom = z;
				// this is temp fix
				d.lines = linesData.d[i].l;
				d.preload = true;
				d.active = true;
				d.canvas.style.display = "block";
				d.c = linesData.c;
				if (!loadedDrawings[sn]) loadedDrawings[sn] = [];
				loadedDrawings[sn].push(d);
			}
		}
		startLoop();	
	}


	// for drawings loaded into notes
	var fps = 10;
	var interval = 1000/fps;
	var timer = Date.now();
	var drawLoop = function() {
		if (Date.now() > timer + interval) {
			timer = Date.now();
			for (var i = 0; i < slides.length; i++) {
				if (drawings[i]) {
					drawings[i][0].clearCanvas();
					for (var h = 0; h < drawings[i].length; h++) {
				 		drawings[i][h].drawLines();
					}
				}
				if (loadedDrawings[i]) {
					loadedDrawings[i][0].clearCanvas();
					for (var h = 0; h < loadedDrawings[i].length; h++) {
				 		loadedDrawings[i][h].drawLines();
					}
				}
			}
		}
		requestAnimationFrame(drawLoop);
	}
	var loopStarted = false;
	var startLoop = function() {
		if (!loopStarted) {
			requestAnimationFrame(drawLoop);
			loopStarted = true;
		}
	}

	function saveDrawing() {
		var temp = {
			l:drawings[slideNumber].lines,
			w:drawings[slideNumber].w,
			h:drawings[slideNumber].h,
			c:drawings[slideNumber].c
		}
		var jsonfile = JSON.stringify(temp);
		var filename = prompt("Name this file:");
		if (filename) {
			var blob = new Blob([jsonfile], {type:"application/x-download;charset=utf-8"});
			saveAs(blob, filename+".json");
		}
	}

	if (slides.length > 0) setSlideNumber();
	
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
			case 40: // up right
				nextSlide();
			break;
			
			case 37:
			case 38: // down left
				previousSlide();
			break;

			case 32: // space
				ev.preventDefault();
				if (isslides) drawingToggle();
			break;

			case 79: //o
				setOutline();
			break;

			case 83: //s
				if (slides.length > 0) setSlides();
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


	// this doesn't work fuckkkkk
	// $(document).on("scroll", function() {
	// 	if (isslides) {
	// 		var slideOkay = setSlideNumber();
	// 		if (!scrolling && slideOkay) setTimeout(scrollToSlide, 2000);
	// 		scrolling = true;
	// 	}
	// });

	$(document).on("wheel", function() {
		if (isslides) {
			var slideOkay = setSlideNumber();
			if (!scrolling && slideOkay) setTimeout(scrollToSlide, 2000);
			scrolling = true;
		}
	});

	$(document).on('mousemove', function(event) {
		if (Date.now() > mousetime + mousetimer) {
			mousetimer = Date.now();
			if (drawings[slideNumber]) {
				if (drawings[slideNumber][drawings[slideNumber].length-1].drawOn) 
					drawings[slideNumber][drawings[slideNumber].length-1].addLine(event.offsetX, event.offsetY);
			}
		}
	});

	$(document).on('mousedown', function(event) {
		if (drawings[slideNumber]) {
			if (event.which == 1 && drawings[slideNumber][drawings[slideNumber].length-1].active) {
				drawings[slideNumber][drawings[slideNumber].length-1].drawOn = true;
				drawings[slideNumber][drawings[slideNumber].length-1].addLine(event.offsetX, event.offsetY);
			}
		}
	});

	$(document).on('mouseup', function(event) {
		if (drawings[slideNumber]) {
			if (event.which == 1 && drawings[slideNumber][drawings[slideNumber].length-1].active) {
				drawings[slideNumber][drawings[slideNumber].length-1].drawOn = false;
				if (drawings[slideNumber][drawings[slideNumber].length-1].moves%2==1) drawings[slideNumber][drawings[slideNumber].length-1].lines.splice(-1,1);
				drawings[slideNumber][drawings[slideNumber].length-1].moves = 0;
			}
		}
	});


};

$(document).ready( function() {
	if (window.mobilecheck()) {
		document.getElementById("container").className = "outline";
		var checkExist = setInterval(function() {
			if ($('#defaultCanvas0').length) {
				$('#defaultCanvas0').remove();
				clearInterval(checkExist);
			}
		}, 50);
	} else {
		setupSlides();
	}
});