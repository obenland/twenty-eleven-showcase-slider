<?php
/**
 * Plugin Name: Twenty Eleven Showcase Slider
 * Plugin URI:  http://en.wp.obenland.it/twenty-eleven-showcase-slider/#utm_source=wordpress&utm_medium=plugin&utm_campaign=twenty-eleven-showcase-slider
 * Description: Adds carousel functionality to the Twenty Eleven Showcase slider.
 * Version:     2
 * Author:      Konstantin Obenland
 * Author URI:  http://en.wp.obenland.it/#utm_source=wordpress&utm_medium=plugin&utm_campaign=twenty-eleven-showcase-slider
 * Text Domain: twenty-eleven-showcase-slider
 * License:     GNU General Public License, version 2
 * License URI: http://www.gnu.org/licenses/gpl-2.0.html
 *
 * @package Twenty Eleven Showcase Slider
 */

// Bail, if we're not on Twenty Eleven.
if ( 'twentyeleven' !== get_template() ) {
	return;
}

/**
 * Registers the script.
 */
function twentyeleven_showcase_slider_init() {
	$plugin_data = get_file_data( __FILE__, array( 'version' => 'Version' ), false );
	$suffix      = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';

	wp_register_script(
		'twenty-eleven-showcase-slider',
		plugins_url( "/js/twenty-eleven-showcase-slider{$suffix}.js", __FILE__ ),
		array( 'jquery' ),
		$plugin_data['version'],
		true
	);
}
add_action( 'init', 'twentyeleven_showcase_slider_init' );

/**
 * Enqueues the script.
 */
function twentyeleven_showcase_slider_enqueue_scripts() {
	if ( is_page_template( 'showcase.php' ) ) {
		wp_dequeue_script( 'twentyeleven-showcase' );
		wp_enqueue_script( 'twenty-eleven-showcase-slider' );
	}
}
add_action( 'wp_enqueue_scripts', 'twentyeleven_showcase_slider_enqueue_scripts' );
