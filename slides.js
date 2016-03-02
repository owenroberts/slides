$(document).ready( function() {

	var dev = true;

	var container = $('#container');

	var slidesBtn = $('<button>').attr('id', 'slidesBtn');
	var outlineBtn = $('<button>').attr('id', 'outlineBtn');

	var slides = $('.slide');
	var isslides = false;
	var start = true;
	var slideNumber = 0;
	var numSlides = slides.length;
	var scrolling = false;
	var noscroll = false;

	var h = window.innerHeight;

	slidesBtn.text('Slides');
	outlineBtn.text('Outline');

	$(container).append(slidesBtn);
	$(container).append(outlineBtn);



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

	var slideDraw = function() {
		var s = $(slides[slideNumber]);
		if ($('#c'+slideNumber).length) {
			console.log("shit already exists");
		} else {
			var c = $('<canvas>')
				.attr({
					id: "c"+slideNumber
				})
				.css({
					width: window.innerWidth,
					height: window.innerHeight,
					background: "rgba(255, 255, 255, 0.5)",
					zIndex:99
				});
			s.append(c);
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
				slideDraw();
			break;
		}
	});

	$(document).on("wheel", function() {
		var slideOkay = setSlideNumber();
		if (!scrolling && slideOkay) setTimeout(scrollToSlide, 2000);
		scrolling = true;
	});

});