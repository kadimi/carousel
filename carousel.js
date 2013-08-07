/*jslint browser: true*/
/*global $, jQuery*/

(function ($, window) {
    'use strict';

    $.carousel = {};

    // Default options
    $.carousel.defaults = {
        arrows_position: 50,        // in px
        arrows_height: 80,          // in px
        arrows_width: 20,           // in px
        cycle: false,
        dblclick: true,
        elements_margin_h: 0.5,     // in %
        elements_padding_h: 0,      // in %
        elements_padding_v: 5,      // in %
        elements_visible: 4,
        height: 200,                // in px or 'dynamic'
        interval: 2500,            // in ms, 0 for no automatic action
        margin_h: 2,                // in %
        rules: {
            "min-width=640px&max-width=1024" : {
                elements_visible: 2
            }
        },
        shuffle: false,             // shuffle on init
        speed: 250,                 // in ms or fast (=200) or slow (=600)
        steps: null,                // elements_visible if null
        dummy: "Dummy"              // Dummy
    };

    // Methods
    var methods = {
        // Constructor
        init: function (options) {
            return this.each(function () {

                // Variables (to be continued...)
                var i, indexes = [], list, o = options, obj = $(this);

                // Check object is ul, if not get the first ul from its children
                if (obj.is('ul')) {
                    list = obj;
                } else if (obj.find('ul:first').length) {
                    list = obj.find('ul:first');
                } else {
                    window.console.log('jQuery.Carousel: Nothing to do');
                    return;
                }

                o = $.extend({}, $.carousel.defaults, o);

                // Do nothing if carousel is previously marked
                if (list.data('carousel') !== undefined) {
                    window.console.log('jQuery.Carousel: Nothing to do');
                    return;
                }


                // Make options available to list
                list.o = o;

                // Variables (...continued)
                o.base_width = 100 / o.elements_visible;
                o.carousel_element_width = o.base_width - (2 * o.elements_margin_h);
                o.text_direction = list.css('direction');
                o.ltr = o.text_direction === 'ltr';
                o.rtl = o.text_direction !== 'ltr';
                o.start = o.ltr ? 'left' : 'right';
                o.end = o.ltr ? 'right' : 'left';
                o.index = 0;
                o.length = $('>li', list).length;

                if (o.length < o.elements_visible) {
                    o.elements_visible = o.length;
                    o.base_width = 100 / o.elements_visible;
                    o.carousel_element_width = o.base_width - (2 * o.elements_margin_h);
                }

                // A random wrapper_id of carousel_{0 to 99} is given if not present in parameters
                if (o.wrapper_id === undefined) {
                    o.wrapper_id = 'carousel_' + (Math.floor(99 * Math.random()) + 1);
                }

                // steps will equal elements_visible if not in options
                if (!o.steps) {
                    o.steps = o.elements_visible;
                }

                // Store options
                list
                    .data('carousel', o);
                // wrap the ul in a div with a unique id
                list.wrap($('<div class="carousel" id="' + o.wrapper_id + '"/>'));
                list.wrapper = $('#' + o.wrapper_id);

                // Mark list items
                for (i = 0; i < list.o.length; i += 1) {
                    indexes.push(i);
                }
                if (list.o.shuffle) {
                    indexes.shuffle();
                }
                $('> li', list).each(function () {
                    $(this).attr('data-index', indexes[$(this).index()]);
                });

                // Style list
                list
                    .css('height', o.height)
                    .css('margin', '0 ' + o.margin_h + '%')
                    .css('width', 100 - 2 * o.margin_h + '%');

                // Style list items
                $('> li', list)
                    .css('height', o.height - 2 * o.elements_padding_v)
                    .css('margin-left', o.elements_margin_h + '%')
                    .css('margin-right', o.elements_margin_h + '%')
                    .css('padding', o.elements_padding_v + 'px ' + o.elements_padding_h + '%')
                    .css('position', 'absolute')
                    .css('width', o.carousel_element_width - 2 * o.elements_padding_h + '%')
                    // Set horizontal positions
                    .each(function () {
                        $(this).css(o.start, (o.carousel_element_width + o.elements_margin_h * 2) * $(this).attr('data-index') + '%');
                    });

                // Add arrows
                list.wrapper
                    .prepend('<div class="carousel_arrow carousel_arrow_next"></div>')
                    .prepend('<div class="carousel_arrow carousel_arrow_previous"></div>');

                // Style wrapper
                list.wrapper
                    .css('direction', list.css('direction'));

                // Style arrows
                list.wrapper.find('> .carousel_arrow')
                    .css('top', o.arrows_position * (o.height - o.arrows_height) / 100 + 'px');
                list.wrapper.find('> .carousel_arrow_previous')
                    .css('border-width',
                        o.arrows_height / 2 + 'px '
                        + o.arrows_width + 'px '
                        + o.arrows_height / 2 + 'px '
                        + o.arrows_width + 'px'
                        )
                    .css('border-' + o.start + '-width', '0')
                    .css('border-' + o.end + 'color', 'transparent');
                list.wrapper.find('> .carousel_arrow_next')
                    .css('border-width',
                        o.arrows_height / 2 + 'px '
                        + o.arrows_width + 'px '
                        + o.arrows_height / 2 + 'px '
                        + o.arrows_width + 'px'
                        )
                    .css('border-' + o.end + '-width', '0')
                    .css('border-' + o.start + 'color', 'transparent')
                    .css(o.end, '0');

                // Setup arrow click
                $('> .carousel_arrow_next', list.wrapper)
                    .click(function (e) {
                        list.carousel('goto', 'next', e);
                    })
                    .dblclick(function () {
                        if (list.o.dblclick) {
                            list.carousel('goto', list.o.length - list.o.elements_visible);
                        }
                    });
                $('> .carousel_arrow_previous', list.wrapper)
                    .click(function (e) {
                        list.carousel('goto', 'previous', e);
                        // list.carousel('goto', list.o.index - list.o.steps);
                    })
                    .dblclick(function () {
                        if (list.o.dblclick) {
                            list.carousel('goto', 0);
                        }
                    });

                // Click the next arrow 
                if (list.o.interval) {
                    window.setInterval(function () {
                        var list_closure = list;
                        list_closure.carousel('goto', 'next');
                    }, o.interval);
                }
            });
        }, /* init */
        // Go to 'slide' by index, also accepts string 'next' and 'previous'
        goto : function (target_index, e) {
            var anim, button = false, list = this;
            // Which arrow button was clicked (previous, next, false)
            if (e !== undefined) {
                if ($(e.target).hasClass('carousel_arrow_next')) {
                    button = 'next';
                } else if ($(e.target).hasClass('carousel_arrow_previous')) {
                    button = 'previous';
                }
            }
            // 'previous' to index
            if (target_index === 'previous') {
                target_index = list.o.index - list.o.steps;
                if (list.o.cycle && target_index < 0 && list.o.index === 0) {
                    target_index = list.o.length - list.o.elements_visible;
                }
            }
            // 'next' to index
            if (target_index === 'next') {
                target_index = list.o.index + list.o.steps;
                if (list.o.cycle
                        && target_index > list.o.length - list.o.elements_visible
                        && list.o.index > list.o.length - list.o.elements_visible - 1
                        ) {
                    target_index = 0;
                }
            }
            if (target_index < 0 || (target_index === list.o.index && button === 'previous')) {
                // index is too small
                list.data('carousel', $.extend(list.o, {index: 0}));
                $('> li', list).each(function () {
                    anim = (list.o.ltr)
                        ? {left: ($(this).data('index')) * list.o.base_width + 1 + '%'}
                        : {right: ($(this).data('index')) * list.o.base_width + 1 + '%'};
                    $(this).stop().animate(anim, list.o.speed / 4, 'linear', function () {
                        anim = (list.o.ltr)
                            ? {left: '-=1%'}
                            : {right: '-=1%'};
                        $(this).animate(anim, list.o.speed);
                    });
                });
            } else if (target_index > list.o.length - list.o.elements_visible || (target_index === list.o.index && button === 'next')) {
                // target_index is too big
                list.data('carousel', $.extend(list.o, {index: list.o.length - list.o.elements_visible}));
                $('> li', list).each(function () {
                    anim = (list.o.ltr)
                        ? {left: ($(this).data('index') - list.o.length + list.o.elements_visible) * list.o.base_width - 1 + '%'}
                        : {right: ($(this).data('index') - list.o.length + list.o.elements_visible) * list.o.base_width - 1 + '%'};
                    $(this).stop().animate(anim, list.o.speed / 4, 'linear', function () {
                        anim = (list.o.ltr)
                            ? {left: '+=1%'}
                            : {right: '+=1%'};
                        $(this).animate(anim, list.o.speed);
                    });
                });
            } else {
                // index is within range
                list.data('carousel', $.extend(list.o, {index: target_index}));
                $('> li', list).each(function () {
                    anim = (list.o.ltr)
                        ? {left: ($(this).data('index') - target_index) * list.o.base_width + '%'}
                        : {right: ($(this).data('index') - target_index) * list.o.base_width + '%'};
                    $(this).stop().animate(anim, list.o.speed);
                });
            }
            return this;
        } /* goto */
    }; /* methods */

    // Plugin
    $.fn.carousel = function (methodOrOptions) {
        if (methods[methodOrOptions]) {
            return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        if (typeof methodOrOptions === 'object' || !methodOrOptions) {
            return methods.init.apply(this, arguments);
        }
        $.error('Method ' +  methodOrOptions + ' does not exist on jQuery.carousel');
    };

}(jQuery, window));

// Array.shuffle
Array.prototype.shuffle = function () {
    'use strict';
    var tmp, current, top = this.length;
    while (top > 0) {
        top -= 1;
        current = Math.floor(Math.random() * (top + 1));
        tmp = this[current];
        this[current] = this[top];
        this[top] = tmp;
    }
};