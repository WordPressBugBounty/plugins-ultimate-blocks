<?php

require_once dirname( dirname( dirname( __DIR__ ) ) ) . '/includes/ultimate-blocks-styles-css-generator.php';

/**
 * Image Comparison block.
 *
 * Two images on top of each other, the before image is cut at the slider
 * position. front.js moves the slider with drag, hover, click or the keyboard.
 */
class Ultimate_Image_Comparison {

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'register_block' ) );
	}

	/**
	 * Register the block and its frontend script.
	 *
	 * @return void
	 */
	public function register_block() {
		wp_register_script(
			'ub-image-comparison-frontend-script',
			plugins_url( 'image-comparison/front.build.js', dirname( __FILE__ ) ),
			array(),
			Ultimate_Blocks_Constants::plugin_version(),
			true
		);

		register_block_type(
			dirname( dirname( dirname( __DIR__ ) ) ) . '/dist/blocks/image-comparison/block.json',
			array(
				'render_callback' => array( $this, 'render' ),
			)
		);
	}

	/**
	 * Css shorthand of a border radius object.
	 *
	 * @param mixed $radius radius with topLeft, topRight, bottomRight and bottomLeft.
	 *
	 * @return string border radius or empty string
	 */
	private function get_radius( $radius ) {
		$corners = array( 'topLeft', 'topRight', 'bottomRight', 'bottomLeft' );
		$values  = array();
		$has_one = false;

		foreach ( $corners as $corner ) {
			$value    = is_array( $radius ) && ! empty( $radius[ $corner ] ) ? $radius[ $corner ] : '0';
			$has_one  = $has_one || '0' !== $value;
			$values[] = $value;
		}

		return $has_one ? implode( ' ', $values ) : '';
	}

	/**
	 * Css declarations of a property list, empty values are left out.
	 *
	 * @param array $styles css values keyed by property.
	 *
	 * @return string css declarations
	 */
	private function to_css( $styles ) {
		$css = '';
		foreach ( $styles as $property => $value ) {
			if ( is_string( $value ) && '' !== trim( $value ) ) {
				$css .= $property . ':' . $value . ';';
			}
		}

		return safecss_filter_attr( $css );
	}

	/**
	 * Inline styles of every part of the block, the same ones get-styles.js makes.
	 *
	 * @param array $attributes block attributes.
	 * @param float $position   slider position in percent.
	 *
	 * @return array css of the wrapper, before layer, divider, handle and labels
	 */
	private function get_styles( $attributes, $position ) {
		$is_vertical = 'vertical' === $attributes['orientation'];
		$is_line     = isset( $attributes['className'] ) && preg_match( '/\bis-style-line\b/', $attributes['className'] );
		$margin      = Ultimate_Blocks\includes\get_spacing_css( (array) $attributes['margin'] );
		$border      = Ultimate_Blocks\includes\get_border_css( (array) $attributes['border'] );
		$appearance  = is_array( $attributes['labelFontAppearance'] ) ? $attributes['labelFontAppearance'] : array();
		$line_width  = (int) $attributes['lineWidth'] . 'px';
		// the line style keeps a thin hit area around the line for the pointer and keyboard.
		$hit_area = ( (int) $attributes['lineWidth'] + 12 ) . 'px';

		$wrapper = array( 'border-radius' => $this->get_radius( $attributes['borderRadius'] ) );
		foreach ( array( 'top', 'right', 'bottom', 'left' ) as $side ) {
			$wrapper[ 'margin-' . $side ] = isset( $margin[ $side ] ) ? $margin[ $side ] : '';
			$wrapper[ 'border-' . $side ] = empty( $border[ $side ]['width'] ) ? '' : Ultimate_Blocks\includes\get_single_side_border_value( $border, $side );
		}

		$handle = $is_line
			? array(
				'width'  => $is_vertical ? '48px' : $hit_area,
				'height' => $is_vertical ? $hit_area : '48px',
			)
			: array(
				'width'        => (int) $attributes['handleSize'] . 'px',
				'height'       => (int) $attributes['handleSize'] . 'px',
				'border-width' => $line_width,
				'border-color' => $attributes['lineColor'],
				'background'   => $attributes['handleColor'],
				'color'        => $attributes['handleIconColor'],
			);

		return array(
			'wrapper' => $this->to_css( $wrapper ),
			// only numbers made here, and older WordPress versions strip clip-path in safecss_filter_attr().
			'before'  => 'clip-path:' . ( $is_vertical ? 'inset(0 0 ' . ( 100 - $position ) . '% 0)' : 'inset(0 ' . ( 100 - $position ) . '% 0 0)' ) . ';',
			'divider' => $this->to_css(
				array(
					( $is_vertical ? 'top' : 'left' )      => $position . '%',
					( $is_vertical ? 'height' : 'width' ) => $line_width,
					'background'                          => $attributes['lineColor'],
				)
			),
			'handle'  => $this->to_css( $handle ),
			'label'   => $this->to_css(
				array(
					'color'       => $attributes['labelColor'],
					'background'  => $attributes['labelBackground'],
					'font-size'   => $attributes['labelFontSize'],
					'font-weight' => isset( $appearance['fontWeight'] ) ? $appearance['fontWeight'] : '',
					'font-style'  => isset( $appearance['fontStyle'] ) ? $appearance['fontStyle'] : '',
				)
			),
		);
	}

	/**
	 * Classes of the block wrapper, the same ones utils.js makes.
	 *
	 * @param array $attributes block attributes.
	 *
	 * @return string class names
	 */
	private function get_classes( $attributes ) {
		$position = in_array( $attributes['labelPosition'], array( 'start', 'center', 'end' ), true ) ? $attributes['labelPosition'] : 'center';
		$classes  = array(
			'ub-image-comparison',
			'is-' . ( 'vertical' === $attributes['orientation'] ? 'vertical' : 'horizontal' ),
			'has-labels-' . $position,
		);

		if ( $attributes['labelsOnHover'] ) {
			$classes[] = 'has-labels-on-hover';
		}
		if ( $attributes['overlayOnHover'] ) {
			$classes[] = 'has-overlay';
		}

		return implode( ' ', $classes );
	}

	/**
	 * Image tag of one side.
	 *
	 * @param array  $image image with id, url and alt.
	 * @param string $side  before or after.
	 *
	 * @return string img tag
	 */
	private function get_image( $image, $side ) {
		$alt = isset( $image['alt'] ) ? $image['alt'] : '';

		if ( ! empty( $image['id'] ) ) {
			$tag = wp_get_attachment_image(
				(int) $image['id'],
				'large',
				false,
				array(
					'class'     => 'ub-image-comparison__image is-' . $side,
					'alt'       => $alt,
					'draggable' => 'false',
				)
			);

			if ( $tag ) {
				return $tag;
			}
		}

		return sprintf(
			'<img class="ub-image-comparison__image is-%1$s" src="%2$s" alt="%3$s" draggable="false" loading="lazy" />',
			esc_attr( $side ),
			esc_url( $image['url'] ),
			esc_attr( $alt )
		);
	}

	/**
	 * Render the block.
	 *
	 * @param array $attributes block attributes.
	 *
	 * @return string block markup
	 */
	public function render( $attributes ) {
		$before = (array) $attributes['beforeImage'];
		$after  = (array) $attributes['afterImage'];

		if ( empty( $before['url'] ) || empty( $after['url'] ) ) {
			return '';
		}

		$position    = max( 0, min( 100, (int) round( (float) $attributes['startPosition'] ) ) );
		$orientation = 'vertical' === $attributes['orientation'] ? 'vertical' : 'horizontal';
		$move_on     = in_array( $attributes['moveOn'], array( 'drag', 'hover', 'click' ), true ) ? $attributes['moveOn'] : 'drag';

		$styles = $this->get_styles( $attributes, $position );

		$wrapper_attributes = get_block_wrapper_attributes(
			array(
				'class'     => $this->get_classes( $attributes ),
				'style'     => $styles['wrapper'],
				'data-move' => $move_on,
			)
		);

		$labels = '';
		if ( $attributes['showLabels'] ) {
			foreach ( array( 'before' => 'beforeLabel', 'after' => 'afterLabel' ) as $side => $key ) {
				if ( '' !== trim( $attributes[ $key ] ) ) {
					$labels .= sprintf(
						'<span class="ub-image-comparison__label is-%1$s" style="%2$s">%3$s</span>',
						$side,
						esc_attr( $styles['label'] ),
						esc_html( $attributes[ $key ] )
					);
				}
			}
		}

		$handle = sprintf(
			'<div class="ub-image-comparison__divider" style="%4$s"><div class="ub-image-comparison__handle" style="%5$s" role="slider" tabindex="0" aria-label="%1$s" aria-orientation="%2$s" aria-valuemin="0" aria-valuemax="100" aria-valuenow="%3$d" aria-valuetext="%3$d%%"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9.5 6.5 4 12l5.5 5.5 1.06-1.06L6.12 12l4.44-4.44L9.5 6.5Zm5 0-1.06 1.06L17.88 12l-4.44 4.44 1.06 1.06L20 12l-5.5-5.5Z" /></svg></div></div>',
			esc_attr__( 'Image comparison slider', 'ultimate-blocks' ),
			$orientation,
			$position,
			esc_attr( $styles['divider'] ),
			esc_attr( $styles['handle'] )
		);

		return sprintf(
			'<div %1$s><div class="ub-image-comparison__frame">%2$s<div class="ub-image-comparison__before" style="%6$s">%3$s</div>%4$s%5$s</div></div>',
			$wrapper_attributes,
			$this->get_image( $after, 'after' ),
			$this->get_image( $before, 'before' ),
			$labels,
			$handle,
			esc_attr( $styles['before'] )
		);
	}
}

new Ultimate_Image_Comparison();
