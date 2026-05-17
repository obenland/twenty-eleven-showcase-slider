/**
 * Twenty Eleven Showcase Slider.
 *
 * Based on the work of Johan van der Wijk.
 *
 * @link      http://pastebin.com/s6JEthVi
 * @copyright Johan van der Wijk
 * @license   unknown
 */
( function () {
	'use strict';

	/**
	 * Milliseconds between auto-advance ticks.
	 */
	var INTERVAL = 4000;

	/**
	 * Toggle a featured-post section's visibility.
	 *
	 * @param {Element|null} el      The section to show or hide. No-op when null.
	 * @param {boolean}      visible True to show, false to hide.
	 */
	function setVisible( el, visible ) {
		if ( ! el ) {
			return;
		}
		el.style.opacity = visible ? '1' : '0';
		el.style.visibility = visible ? 'visible' : 'hidden';
	}

	/**
	 * Wire up the carousel: bind click handlers, start the auto-advance
	 * timer, and register the listeners that pause it when the slider is
	 * offscreen or the tab is hidden.
	 */
	function init() {
		var slides = document.querySelectorAll( '.feature-slider a' );

		if ( slides.length < 2 ) {
			return;
		}

		var slider = slides[ 0 ].closest( '.feature-slider' );
		var reduceMotion =
			'matchMedia' in window &&
			window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

		var posts = [];
		for ( var i = 0; i < slides.length; i++ ) {
			posts.push( document.querySelector( slides[ i ].hash ) );
		}

		var current = 0;
		for ( var j = 0; j < slides.length; j++ ) {
			if ( slides[ j ].classList.contains( 'active' ) ) {
				current = j;
				break;
			}
		}

		var timer = 0;
		var onScreen = true;

		/**
		 * Advance the carousel to a specific slide.
		 *
		 * @param {number} index Target slide index. Wraps modulo slides.length.
		 */
		function showSlide( index ) {
			index = index % slides.length;
			if ( index === current ) {
				return;
			}

			setVisible( posts[ current ], false );
			setVisible( posts[ index ], true );

			slides[ current ].classList.remove( 'active' );
			slides[ index ].classList.add( 'active' );

			current = index;
		}

		/**
		 * Cancel the pending auto-advance tick, if any.
		 */
		function stop() {
			if ( timer ) {
				clearInterval( timer );
				timer = 0;
			}
		}

		/**
		 * (Re)start the auto-advance timer. No-op when the carousel should
		 * stay paused (reduced motion, tab hidden, slider offscreen).
		 */
		function start() {
			stop();
			if ( reduceMotion || document.hidden || ! onScreen ) {
				return;
			}
			timer = setInterval( function () {
				showSlide( current + 1 );
			}, INTERVAL );
		}

		slides.forEach( function ( slide, index ) {
			slide.addEventListener( 'click', function ( event ) {
				event.preventDefault();
				showSlide( index );
				start();
			} );
		} );

		document.addEventListener( 'visibilitychange', function () {
			if ( document.hidden ) {
				stop();
			} else {
				start();
			}
		} );

		if ( 'IntersectionObserver' in window ) {
			var observer = new IntersectionObserver( function ( entries ) {
				var visible = entries[ 0 ].isIntersecting;
				if ( visible === onScreen ) {
					return;
				}
				onScreen = visible;
				if ( onScreen ) {
					start();
				} else {
					stop();
				}
			} );
			observer.observe( slider );
		}

		start();
	}

	init();
} )();
