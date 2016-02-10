$(document).ready( function() {

	var container = $('#container');

	var slidesBtn = $('<button>').attr('id', 'slidesBtn');
	var outlineBtn = $('<button>').attr('id', 'outlineBtn');

	var slides = $('.slide');
	var slideNumber = 0;
	var numSlides = slides.length;
	var scrolling = false;
	var noscroll = false;

	slidesBtn.text('Slides');
	outlineBtn.text('Outline');

	$(container).append(slidesBtn);
	$(container).append(outlineBtn);

	var setSlides = function() {
		$(container).addClass('slides');
		$(container).removeClass('outline');
		noscroll = false;
	};
	$(slidesBtn).on('click', setSlides);
	
	var setOutline = function() {
		$(container).removeClass('slides');
		$(container).addClass('outline');
		noscroll = true;
	};
	$(outlineBtn).on('click', setOutline);
	setOutline();

	var setSlideNumber = function() {
		slideNumber = 0;
		for ( var i = 0; i < slides.length; i++) {
			if ( $(document).scrollTop() > $(slides[i]).offset().top ) {
				slideNumber++;
			}
		}
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
	
	setSlideNumber();
	
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
		}
	});

	$(document).on("wheel", function() {
		//console.log("scrolling");
		setSlideNumber();
		if (!scrolling) setTimeout(scrollToSlide, 2000);
		scrolling = true;
	});

});