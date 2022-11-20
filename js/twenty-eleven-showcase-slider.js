/**
 * This code is based on the work of Johan van der Wijk.
 *
 * @link      http://pastebin.com/s6JEthVi
 * @copyright Johan van der Wijk
 * @license	  unknown
 */
jQuery( function( $ ) {
	var $slides = $( '.feature-slider a' );
	var current = 1;

	$slides.click( function( event ) {
		$( '.featured-posts section.featured-post' ).css( {
			opacity: 0,
			visibility: 'hidden'
		} );
		$( this.hash ).css( {
			opacity: 1,
			visibility: 'visible'
		} );
		$slides.removeClass( 'active' );
		$( this ).addClass( 'active' );
		event.preventDefault();
	} );

	setInterval( function() {
		$slides.eq( current % $slides.length ).trigger( 'click', [true] );
		current++;
	}, 4000 );
} );
