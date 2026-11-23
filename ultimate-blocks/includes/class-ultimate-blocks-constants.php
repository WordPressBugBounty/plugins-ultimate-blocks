<?php

/**
 * The file defines global constants for the plugin
 *
 * @link       http://imtiazrayhan.com/
 * @since      1.0.2
 *
 * @package    Ultimate_Blocks_Constants
 * @subpackage Ultimate_Blocks/includes
 */

/**
 * The core plugin class.
 *
 * This is used for defining constants which are used throughout plugin.
 *
 * @since      1.0.2
 * @package    Ultimate_Blocks_Constants
 * @subpackage Ultimate_Blocks_Constants/includes
 * @author     Imtiaz Rayhan <imtiazrayhan@gmail.com>
 */
class Ultimate_Blocks_Constants {

	const PLUGIN_VERSION = '3.7.0';

	const PLUGIN_NAME = 'ultimate-blocks';

	/**
	 * Get Plugin version
	 *
	 * @return string
	 */
	public static function plugin_version() {
		return self::PLUGIN_VERSION;
	}

	/**
	 * Get Plugin name
	 *
	 * @return string
	 */
	public static function plugin_name() {
		return self::PLUGIN_NAME;
	}

	/**
	 * Get Plugin Path
	 *
	 * Built from this file's location, not the plugin name, so the plugin still
	 * loads when its folder is not called ultimate-blocks (for example a zip
	 * without a top level folder, which WordPress installs under the uploaded
	 * file's name).
	 *
	 * @return string
	 */
	public static function plugin_path() {
		return plugin_dir_path( __DIR__ );
	}

	/**
	 * Get Plugin URL
	 *
	 * @return string
	 */
	public static function plugin_url() {
		return plugin_dir_url( dirname( __FILE__ ) );
	}

	/**
	 * Get Plugin TEXT DOMAIN
	 *
	 * @return string
	 */
	public static function text_domain() {
		return 'ultimate-blocks';
	}
}
