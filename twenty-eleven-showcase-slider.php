<?php
/** twenty-eleven-showcase-slider.php
 *
 * Plugin Name:	Twenty Eleven Showcase Slider
 * Plugin URI:	http://en.wp.obenland.it/twenty-eleven-showcase-slider/#utm_source=wordpress&utm_medium=plugin&utm_campaign=twenty-eleven-showcase-slider
 * Description:	Adds carousel functionality to the Twenty Eleven Showcase slider.
 * Version:		1.0.0
 * Author:		Konstantin Obenland
 * Author URI:	http://en.wp.obenland.it/#utm_source=wordpress&utm_medium=plugin&utm_campaign=twenty-eleven-showcase-slider
 * Text Domain: twenty-eleven-showcase-slider
 * Domain Path: /lang
 * License:		GNU General Public License, version 2
 * License URI:	http://www.gnu.org/licenses/gpl-2.0.html
 */


// Bail, if we're not on Twenty Eleven
if ( 'twentyeleven' != get_template() ) {
	return;
}


if ( ! class_exists( 'Obenland_Wp_Plugins_v300' ) ) {
	require_once( 'obenland-wp-plugins.php' );
}


class Obenland_Twenty_Eleven_Showcase_Slider extends Obenland_Wp_Plugins_v300 {
	
	
	///////////////////////////////////////////////////////////////////////////
	// PROPERTIES, PUBLIC
	///////////////////////////////////////////////////////////////////////////
	
	/**
	 *
	 * @since	1.0.0 - 02.07.2012
	 * @access	public
	 * @static
	 *
	 * @var	Obenland_Twenty_Eleven_Showcase_Slider
	 */
	public static $instance;
	
	
	///////////////////////////////////////////////////////////////////////////
	// METHODS, PUBLIC
	///////////////////////////////////////////////////////////////////////////
	
	/**
	 * Constructor
	 *
	 * @author	Konstantin Obenland
	 * @since	1.0.0 - 02.07.2012
	 * @access	public
	 *
	 * @return	Obenland_Twenty_Eleven_Showcase_Slider
	 */
	public function __construct() {
		
		parent::__construct( array(
			'textdomain'		=>	'twenty-eleven-showcase-slider',
			'plugin_path'		=>	__FILE__,
			'donate_link_id'	=>	'3DBDUTYMCVRG4'
		));

		self::$instance	=	$this;
		
		load_plugin_textdomain( 'twenty-eleven-showcase-slider' , false, 'twenty-eleven-showcase-slider/lang' );
		
		$this->hook( 'plugins_loaded' );
	}
	
	
	/**
	 * Hooks in all the hooks :)
	 *
	 * @author	Konstantin Obenland
	 * @since	1.0.0 - 02.07.2012
	 * @access	public
	 *
	 * @return	void
	 */
	public function plugins_loaded() {
		$this->hook( 'init' );
		$this->hook( 'wp_enqueue_scripts' );
	}
	
	
	/**
	 * Registers the script
	 *
	 * @author	Konstantin Obenland
	 * @since	1.0.0 - 02.07.2012
	 * @access	public
	 *
	 * @return	void
	 */
	public function init() {
		$plugin_data = get_file_data( __FILE__, array( 'version' => 'Version' ), 'plugin' );
		$suffix = ( defined('SCRIPT_DEBUG') AND SCRIPT_DEBUG ) ? '.dev' : '';

		wp_register_script(
			$this->textdomain,
			plugins_url( "/js/{$this->textdomain}{$suffix}.js", __FILE__ ),
			array( 'jquery' ),
			$plugin_data['version'],
			true
		);
	}
	
	
	/**
	 * Enqueues the script
	 *
	 * @author	Konstantin Obenland
	 * @since	1.0.0 - 02.07.2012
	 * @access	public
	 *
	 * @return	void
	 */
	public function wp_enqueue_scripts() {
		if ( is_page_template( 'showcase.php' ) ) {
			wp_dequeue_script( 'twentyeleven-showcase' );
			wp_enqueue_script( $this->textdomain );
		}
	}
}  // End of class Obenland_Twenty_Eleven_Showcase_Slider


new Obenland_Twenty_Eleven_Showcase_Slider;


/* End of file twenty-eleven-showcase-slider.php */
/* Location: ./wp-content/plugins/twenty-eleven-showcase-slider/twenty-eleven-showcase-slider.php */