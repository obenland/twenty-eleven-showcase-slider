/**
 * This code is based on the work of Johan van der Wijk
 * 
 * @link		http://pastebin.com/s6JEthVi
 * @copyright	Johan van der Wijk
 * @license		unknown
 */
jQuery( function( $ ) {
	
	$( '.feature-slider a' ).click( function( e ) {
		$( '.featured-posts section.featured-post' ).css( {
			opacity: 0,
			visibility: 'hidden'
		} );
		$( this.hash ).css( {
			opacity: 1,
			visibility: 'visible'
		} );
		$( '.feature-slider a' ).removeClass( 'active' );
		$( this ).addClass( 'active' );
		e.preventDefault();
	} );
	
	var current = 1;
	setInterval( function() {	
		$( '.feature-slider a' ).eq( current % $( '.feature-slider a' ).length ).trigger( 'click', [true] );
		current++;
	}, 4000 );
} );