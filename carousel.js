	(function($){
	$.fn.extend({
		// Basic Plugin
		carousel: function(options) {
			
			var defaults = {
				animation_steps: null,		// elements_visible if null
				arrows_position: 50,		// in px
				arrows_height: 80, 			// in px
				arrows_width: 20, 			// in px
				dblclick: true,
				elements_margin_h: .25,		// in %
				elements_visible: 1,		
				height: 250, 				// in px
				list_margin_h: 4, 			// in %
				dummy_opt: "Dummy option"
			};
			var options = $.extend({}, defaults, options);			
			return this.each(function() {
				
				// Variables (to be continued...)
				var o = options;
				var obj = $(this);				
				var list;

				// Check object is ul, if not get the first ul from its children
				if(obj.is('ul'))
					list = obj;
				else if(obj.find('ul:first').length){
					list = obj.find('ul:first');
				}
				else{ 
					console.log('Carousel: Nothing to do');
					return;
				}

				// Variables (...continued)
				o.base_width = 100 / o.elements_visible;
				o.carousel_element_width = o.base_width - (2 * o.elements_margin_h);
				o.text_direction = list.css('direction'); 
				o.ltr = o.text_direction == 'ltr';
				o.rtl = o.text_direction != 'ltr';
				o.start = o.ltr ? 'left' : 'right';
				o.end = o.ltr ? 'right' : 'left';

				// Make options available within list
				list._o = o;
				list._length = $('> li', list).length

				// A random wrapper_id of carousel_{0 to 99} is given if not present in parameters
				if(typeof o.wrapper_id == 'undefined') 
					o.wrapper_id = 'carousel_' + ( Math.floor( 99 *Math.random()) + 1 );

				// animation_steps will equal elements_visible if not in options
				if(!o.animation_steps) 
					o.animation_steps = o.elements_visible;

				// wrap the ul in a div with a unique id
				list.wrap($('<div class="carousel" id="' +o.wrapper_id + '"/>'));

				// Track current position
				list.wrapper = $('#' + o.wrapper_id);
				list.wrapper
					.data('carousel', 'carousel')
					.data('cur_index', 0)
				;

				// Style list
				list
					.css('height', o.height)
					.css('margin', '0 ' + o.list_margin_h + '%')
					.css('width', 100 - 2 * o.list_margin_h + '%')
				;

				// Style list items
				$('> li', list)
					.css('height', o.height) 
					.css('margin-left', o.elements_margin_h + '%') 
					.css('margin-right', o.	elements_margin_h + '%') 
					.css('position', 'absolute') 
					.css('width', o.carousel_element_width + '%') 
					// Set horizontal positions
					.each( function () {
						$(this).css(
							o.start, 
							(o.carousel_element_width + o.elements_margin_h * 2) * $(this).index() + '%'
						)
					});

				// Add arrows
				list.wrapper
					.prepend('<div class="carousel_arrow carousel_arrow_next"></div>')
					.prepend('<div class="carousel_arrow carousel_arrow_prev"></div>')
				;

				// Style wrapper
				list.wrapper
					.css('direction', list.css('direction'))
				;

				// Style arrows
				start = 
				list.wrapper.find('> .carousel_arrow')
					.css('top', o.arrows_position * (o.height - o.arrows_height ) / 100 + 'px');

				;
				list.wrapper.find('> .carousel_arrow_prev')
					.css('border-width', 
						o.arrows_height / 2 + 'px '
						+ o.arrows_width + 'px '
						+ o.arrows_height / 2 + 'px '
						+ o.arrows_width + 'px'
					)
					.css('border-' + o.start + '-width', '0')
					.css('border-' + o.end + 'color', 'transparent')
				;
				list.wrapper.find('> .carousel_arrow_next')
					.css('border-width', 
						o.arrows_height / 2 + 'px '
						+ o.arrows_width + 'px '
						+ o.arrows_height / 2 + 'px '
						+ o.arrows_width + 'px'
					)
					.css('border-' + o.end + '-width', '0')
					.css('border-' + o.start + 'color', 'transparent')
					.css(o.end, '0')
				;

				// Setup arrow click
				$('> .carousel_arrow_next', list.wrapper)
					.click(function (){
						list.carousel_goto(list.wrapper.data('cur_index') + list._o.animation_steps);
					})
					.dblclick(function (){
						if(list._o.dblclick)
							list.carousel_goto(list._length - list._o.elements_visible - 0);
					})
				;
				$('> .carousel_arrow_prev', list.wrapper)
					.click(function (){
						list.carousel_goto(list.wrapper.data('cur_index') - list._o.animation_steps);
					})
					.dblclick(function (){
						if(list._o.dblclick)
							list.carousel_goto(0);
					})
				;


				list
					.click(function() {
						//
					});
			});

		}, /* carousel */
		carousel_goto : function (index){
			list = this;
			// If index is too big
			if(index > list._length - list._o.elements_visible){
				list.wrapper.data('cur_index', list._length - list._o.elements_visible);
				$('> li', list).each(function () {
					anim = (list._o.ltr)
						? {left: ($(this).index() - list._length + list._o.elements_visible) * list._o.base_width - 1 + '%'}
						: {right: ($(this).index() - list._length + list._o.elements_visible) * list._o.base_width - 1 + '%'}
					;
					$(this).stop().animate(anim, 'fast', 'linear', function (){
						anim = (list._o.ltr)
							? {left: '+=1%'}
							: {right: '+=1%'}
						;
						$(this).animate(anim);
					});
				});
			}
			// If index is too small
			else if(index < 0){
				list.wrapper.data('cur_index', 0);
				$('> li', list).each(function () {
					anim = (list._o.ltr)
						? {left: ($(this).index()) * list._o.base_width + 1 + '%'}
						: {right: ($(this).index()) * list._o.base_width + 1 + '%'}
					;
					$(this).stop().animate(anim, 'fast', 'linear', function (){
						anim = (list._o.ltr)
							? {left: '-=1%'}
							: {right: '-=1%'}
						;
						$(this).animate(anim);
					});
				});
			}
			// Item is within range
			else{
				list.wrapper.data('cur_index', index);
				$('> li', list).each(function () {
					anim = (list._o.ltr)
						? {left: ($(this).index() - index) * list._o.base_width + '%'}
						: {right: ($(this).index() - index) * list._o.base_width + '%'}
					;
					$(this).stop().animate(anim, 'slow');
				});
			}
			return this;
		}, /* carousel_goto */
	}); /* $.fn.extend */
})(jQuery);