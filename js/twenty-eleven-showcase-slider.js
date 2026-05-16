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

	var INTERVAL = 4000;

	function init() {
		var slides = document.querySelectorAll( '.feature-slider a' );

		if ( slides.length < 2 ) {
			return;
		}

		var slider = slides[ 0 ].closest( '.feature-slider' );
		var reduceMotion =
			'matchMedia' in window &&
			window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

		/*
		 * Map each slide anchor to the featured-post section it controls.
		 * Done once at init so we never re-query the DOM during the auto-
		 * advance loop.
		 */
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

		function showSlide( index ) {
			index =
				( ( index % slides.length ) + slides.length ) % slides.length;
			if ( index === current ) {
				return;
			}

			if ( posts[ current ] ) {
				posts[ current ].style.opacity = '0';
				posts[ current ].style.visibility = 'hidden';
			}
			if ( posts[ index ] ) {
				posts[ index ].style.opacity = '1';
				posts[ index ].style.visibility = 'visible';
			}

			slides[ current ].classList.remove( 'active' );
			slides[ index ].classList.add( 'active' );

			current = index;
		}

		function stop() {
			if ( timer ) {
				clearInterval( timer );
				timer = 0;
			}
		}

		function start() {
			stop();
			if ( reduceMotion || document.hidden || ! onScreen ) {
				return;
			}
			timer = setInterval( function () {
				showSlide( current + 1 );
			}, INTERVAL );
		}

		for ( var k = 0; k < slides.length; k++ ) {
			slides[ k ].addEventListener( 'click', function ( event ) {
				event.preventDefault();
				showSlide( Array.prototype.indexOf.call( slides, this ) );
				/*
				 * Restart the auto-advance timer so the user gets the
				 * full INTERVAL window with the slide they just picked.
				 */
				start();
			} );
		}

		document.addEventListener( 'visibilitychange', function () {
			if ( document.hidden ) {
				stop();
			} else {
				start();
			}
		} );

		if ( slider && 'IntersectionObserver' in window ) {
			var observer = new IntersectionObserver( function ( entries ) {
				onScreen = entries[ 0 ].isIntersecting;
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

	if ( 'loading' === document.readyState ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
