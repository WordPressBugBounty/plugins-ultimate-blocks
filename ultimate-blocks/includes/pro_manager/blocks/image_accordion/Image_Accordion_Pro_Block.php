<?php

namespace Ultimate_Blocks\includes\pro_manager\blocks\image_accordion;

use Ultimate_Blocks\includes\pro_manager\base\Pro_Block_Upsell;
use function esc_html__;
use function trailingslashit;

/**
 * Image Accordion pro block upsell.
 */
class Image_Accordion_Pro_Block extends Pro_Block_Upsell {

	/**
	 * Pro block name.
	 * This is the registered name of the block with proper plugin prefix.
	 * Not to be confused with block `label`
	 *
	 * @return string block name
	 */
	public function block_name() {
		return 'ub/image-accordion';
	}

	/**
	 * Block label.
	 * This is the meaningful name of the block.
	 * Not to be confused with block `name`
	 *
	 * @return string;
	 */
	public function block_label() {
		return esc_html__( 'image accordion' );
	}

	/**
	 * Block icon html.
	 * @return null | string;
	 */
	public function block_icon() {
		require( __DIR__ . '/icon.php' );

		return $image_accordion_block_icon;
	}

	/**
	 * Short block description.
	 * @return string
	 */
	public function block_description() {
		return esc_html__( 'Image panels side by side, one opens wide on a click or hover.' );
	}

	/**
	 * Pro block screenshot image url location.
	 * @return string image url location
	 */
	public function block_upsell_screenshot() {
		return trailingslashit( ULTIMATE_BLOCKS_URL ) . 'includes/pro_manager/blocks/image_accordion/assets/image-accordion-ss.jpg';
	}
}
