/*jslint browser: true*/
/*global $, jQuery*/

(function ($, window) {
    'use strict';

    $.carousel = {};

    // Default options
    $.carousel.defaults = {
        arrows_position: 50,        // in %
        arrows_height: 60,          // in px
        arrows_width: 25,           // in px
        cycle: false,
        dblclick: true,
        direction: 'rtl',           // 'ltr' or 'rtl', uses the element direction if null
        elements_margin_h: 0.5,     // in %
        elements_padding_h: 0,      // in %
        elements_padding_v: 5,      // in %
        elements_visible: 4,
        height: 250,                // in px or 'dynamic'
        interval: 0,                // in ms; 0 for no automatic action
        margin_h: 2,                // in %
        pause: 0,                   // in ms
        rules: {
            "minWidth=640&maxWidth=1023": {
                elements_visible: 2
            }
        },
        shuffle: false,             // shuffle on init
        speed: 300,                 // in ms or fast (=200) or slow (=600)
        steps: null,                // elements_visible if null
        dummy: "Dummy"              // Dummy
    };

    // Methods
    var methods = {
        // Constructor
        init: function (options) {
            return this.each(function () {

                // Variables (to be continued...)
                var autoplay, i, indexes = [], list, o = options, obj = $(this);

                // Check object is ul, if not get the first ul from its children
                if (obj.is('ul')) {
                    list = obj;
                } else if (obj.find('ul:first').length) {
                    list = obj.find('ul:first');
                } else {
                    window.console.log('jQuery.carousel: Nothing to do');
                    return;
                }

                o = $.extend({}, $.carousel.defaults, o);

                // Do nothing if carousel is previously marked
                if (list.data('carousel') !== undefined) {
                    window.console.log('jQuery.carousel: Nothing to do');
                    return;
                }

                autoplay = function () {
                    var list_closure = list;
                    list_closure.carousel('go', 'next');
                };

                // Make options available to list
                list.o = o;

                // Variables (...continued)
                o.base_width = 100 / o.elements_visible;
                o.carousel_element_width = o.base_width - (2 * o.elements_margin_h);
                o.text_direction = (o.direction === 'ltr' || o.direction === 'rtl') ? o.direction : list.css('direction');
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
                    .css('direction', list.o.direction);

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

                // Attach mousewheel event handler to list
                list.mousewheel(function (e, delta) {
                    var time = (new Date()).getTime();
                    if (list.o.mousewheelTime === undefined) {
                        list.o.mousewheelTime = 0;
                    }
                    if (time - list.o.mousewheelTime > 50) {
                        if (delta < 0) {
                            list.carousel('go', 'next');
                        } else if (delta > 0) {
                            list.carousel('go', 'previous');
                        }
                    }
                    list.o.mousewheelTime = (new Date()).getTime();
                    e.preventDefault();
                });

                // Attach click/dblclick event handlers to arrows
                $('> .carousel_arrow', list.wrapper)
                    .bind('click dblclick', function (e) {
                        var button = false;
                        if ($(e.target).hasClass('carousel_arrow_next')) {
                            button = 'next';
                        } else if ($(e.target).hasClass('carousel_arrow_previous')) {
                            button = 'previous';
                        }
                        // Clear timers
                        if (list.o.intervalID !== 'undefined') {
                            clearInterval(list.o.intervalID);
                        }
                        if (list.o.timeoutID !== 'undefined') {
                            clearTimeout(list.o.timeoutID);
                        }
                        // Then start autoplay
                        if (list.o.interval) {
                            if (list.o.pause) {
                                list.o.timeoutID = window.setTimeout(
                                    function () {
                                        list.o.intervalID = window.setInterval(autoplay, list.o.interval);
                                    },
                                    list.o.pause
                                );
                            } else {
                                list.o.intervalID = window.setInterval(autoplay, list.o.interval);
                            }
                        }
                        // Resave timers
                        /* No need, already saved */
                        // go(?)
                        if (e.type === 'click') {
                            list.carousel('go', button, e);
                        } else if (e.type === 'dblclick' && button === 'previous') {
                            list.carousel('go', 'first', e);
                        } else if (e.type === 'dblclick' && button === 'next') {
                            list.carousel('go', 'last', e);
                        }
                    });

                // Start autoplay
                if (list.o.interval) {
                    list.o.intervalID = window.setInterval(autoplay, o.interval);
                }

            });
        }, /* init */
        // Go to 'slide' by index, also accepts string 'next' and 'previous'
        go : function (target_index, e) {
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
            // 'first' to index
            if (target_index === 'first') {
                target_index = 0;
            }
            // 'last' to index
            if (target_index === 'last') {
                target_index = list.o.length - list.o.elements_visible;
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
        } /* go */
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

// jQuery Mousewheel
(function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?module.exports=a:a(jQuery)})(function(a){function g(b){var l,c=b||window.event,f=[].slice.call(arguments,1),g=0,h=0,i=0,j=0,k=0;return b=a.event.fix(c),b.type="mousewheel",c.wheelDelta&&(g=c.wheelDelta),c.detail&&(g=-1*c.detail),c.deltaY&&(i=-1*c.deltaY,g=i),c.deltaX&&(h=c.deltaX,g=-1*h),void 0!==c.wheelDeltaY&&(i=c.wheelDeltaY),void 0!==c.wheelDeltaX&&(h=-1*c.wheelDeltaX),j=Math.abs(g),(!d||d>j)&&(d=j),k=Math.max(Math.abs(i),Math.abs(h)),(!e||e>k)&&(e=k),l=g>0?"floor":"ceil",g=Math[l](g/d),h=Math[l](h/e),i=Math[l](i/e),f.unshift(b,g,h,i),(a.event.dispatch||a.event.handle).apply(this,f)}var d,e,b=["wheel","mousewheel","DOMMouseScroll","MozMousePixelScroll"],c="onwheel"in document||document.documentMode>=9?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"];if(a.event.fixHooks)for(var f=b.length;f;)a.event.fixHooks[b[--f]]=a.event.mouseHooks;a.event.special.mousewheel={setup:function(){if(this.addEventListener)for(var a=c.length;a;)this.addEventListener(c[--a],g,!1);else this.onmousewheel=g},teardown:function(){if(this.removeEventListener)for(var a=c.length;a;)this.removeEventListener(c[--a],g,!1);else this.onmousewheel=null}},a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})});