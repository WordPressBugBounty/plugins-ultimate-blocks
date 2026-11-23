<?php

namespace Ultimate_Blocks\includes\pro_manager\blocks\stacked_cards;

use Ultimate_Blocks\includes\pro_manager\base\Pro_Block_Upsell;
use function esc_html__;
use function trailingslashit;

/**
 * Stacked Cards pro block upsell.
 */
class Stacked_Cards_Pro_Block extends Pro_Block_Upsell {

	/**
	 * Pro block name.
	 * This is the registered name of the block with proper plugin prefix.
	 * Not to be confused with block `label`
	 *
	 * @return string block name
	 */
	public function block_name() {
		return 'ub/stacked-cards';
	}

	/**
	 * Block label.
	 * This is the meaningful name of the block.
	 * Not to be confused with block `name`
	 *
	 * @return string;
	 */
	public function block_label() {
		return esc_html__( 'stacked cards' );
	}

	/**
	 * Block icon html.
	 * @return null | string;
	 */
	public function block_icon() {
		require( __DIR__ . '/icon.php' );

		return $stacked_cards_block_icon;
	}

	/**
	 * Short block description.
	 * @return string
	 */
	public function block_description() {
		return esc_html__( 'Cards that stack on top of each other as the reader scrolls.' );
	}

	/**
	 * Pro block screenshot image url location.
	 * @return string image url location
	 */
	public function block_upsell_screenshot() {
		return trailingslashit( ULTIMATE_BLOCKS_URL ) . 'includes/pro_manager/blocks/stacked_cards/assets/stacked-cards-ss.jpg';
	}
}
