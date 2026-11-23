<?php

require_once dirname( dirname( dirname( __DIR__ ) ) ) . '/includes/ultimate-blocks-styles-css-generator.php';

/**
 * Author Bio block.
 *
 * Shows the author of the current post (or one typed in by hand) with an
 * avatar, name, role, bio, social links and a link to all their posts. The
 * role and the social links of real authors come from fields this block adds
 * to the user profile.
 */
class Ultimate_Author_Bio {

	/**
	 * Prefix of the user meta keys this block adds to the profile.
	 */
	const META_PREFIX = 'ub_author_';

	/**
	 * Heading tags the block may use.
	 */
	const HEADING_TAGS = array( 'h2', 'h3', 'h4', 'h5', 'h6', 'p' );

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'register_block' ) );
		add_action( 'init', array( $this, 'register_user_meta' ) );
		add_filter( 'user_contactmethods', array( $this, 'add_profile_fields' ) );
	}

	/**
	 * Social networks the block knows, shared with the editor.
	 *
	 * @return array list of networks with key, label, viewBox and path
	 */
	public static function networks() {
		static $networks = null;

		if ( null === $networks ) {
			$networks = json_decode( file_get_contents( __DIR__ . '/networks.json' ), true );
		}

		return $networks;
	}

	/**
	 * Profile fields of the block: the job title and one url per network.
	 *
	 * The website uses the core website field, so it is left out here.
	 *
	 * @return array field labels keyed by the part after the meta prefix
	 */
	public static function profile_fields() {
		$fields = array( 'job_title' => __( 'Job title', 'ultimate-blocks' ) );

		foreach ( self::networks() as $network ) {
			if ( 'website' === $network['key'] ) {
				continue;
			}

			$fields[ $network['key'] ] = 'email' === $network['key']
				? __( 'Public email', 'ultimate-blocks' )
				/* translators: %s: social network name */
				: sprintf( __( '%s profile URL', 'ultimate-blocks' ), $network['label'] );
		}

		return $fields;
	}

	/**
	 * Add the fields to the Contact Info section of the user profile.
	 *
	 * @param array $methods contact methods.
	 *
	 * @return array contact methods
	 */
	public function add_profile_fields( $methods ) {
		foreach ( self::profile_fields() as $key => $label ) {
			$methods[ self::META_PREFIX . $key ] = $label;
		}

		return $methods;
	}

	/**
	 * Expose the fields in the REST API, so the editor can preview them.
	 *
	 * @return void
	 */
	public function register_user_meta() {
		foreach ( array_keys( self::profile_fields() ) as $key ) {
			register_meta(
				'user',
				self::META_PREFIX . $key,
				array(
					'type'              => 'string',
					'single'            => true,
					'show_in_rest'      => true,
					'sanitize_callback' => 'email' === $key ? 'sanitize_email' : ( 'job_title' === $key ? 'sanitize_text_field' : 'esc_url_raw' ),
					'auth_callback'     => function ( $allowed, $meta_key, $user_id ) {
						return current_user_can( 'edit_user', $user_id );
					},
				)
			);
		}
	}

	/**
	 * Register the block.
	 *
	 * @return void
	 */
	public function register_block() {
		register_block_type(
			dirname( dirname( dirname( __DIR__ ) ) ) . '/dist/blocks/author-bio/block.json',
			array(
				'render_callback' => array( $this, 'render' ),
			)
		);
	}

	/**
	 * Data of the author to show, from the post author or the block.
	 *
	 * @param array    $attributes block attributes.
	 * @param WP_Block $block      block instance.
	 *
	 * @return array|null author data or null when there is no author
	 */
	private function get_author( $attributes, $block ) {
		if ( 'custom' === $attributes['source'] ) {
			$socials = array();
			foreach ( (array) $attributes['customSocials'] as $key => $url ) {
				if ( is_string( $url ) && '' !== trim( $url ) ) {
					$socials[ $key ] = $url;
				}
			}

			return array(
				'name'    => wp_strip_all_tags( $attributes['customName'] ),
				'role'    => wp_strip_all_tags( $attributes['customRole'] ),
				'bio'     => $attributes['customBio'],
				'avatar'  => $attributes['customAvatarUrl'],
				'archive' => $attributes['customUrl'],
				'website' => $attributes['customUrl'],
				'count'   => null,
				'socials' => $socials,
				'posts'   => array(),
			);
		}

		$post_id = isset( $block->context['postId'] ) ? $block->context['postId'] : get_the_ID();
		$user_id = (int) get_post_field( 'post_author', $post_id );
		$user    = $user_id ? get_userdata( $user_id ) : false;

		if ( ! $user ) {
			return null;
		}

		$socials = array();
		foreach ( self::networks() as $network ) {
			$value = 'website' === $network['key']
				? $user->user_url
				: get_user_meta( $user_id, self::META_PREFIX . $network['key'], true );

			if ( is_string( $value ) && '' !== trim( $value ) ) {
				$socials[ $network['key'] ] = $value;
			}
		}

		return array(
			'name'    => $user->display_name,
			'role'    => get_user_meta( $user_id, self::META_PREFIX . 'job_title', true ),
			'bio'     => wpautop( $user->description ),
			// a transparent image when there is no gravatar, so the initials behind it show.
			'avatar'  => get_avatar_url(
				$user_id,
				array(
					'size'    => $attributes['avatarSize'] * 2,
					'default' => $attributes['avatarInitials'] ? 'blank' : '',
				)
			),
			'archive' => get_author_posts_url( $user_id ),
			'website' => $user->user_url,
			'count'   => count_user_posts( $user_id, 'post', true ),
			'socials' => $socials,
			'posts'   => $attributes['showLatestPosts'] ? $this->get_latest_posts( $user_id, $post_id, $attributes['latestPostsCount'] ) : array(),
		);
	}

	/**
	 * Latest published posts of the author, without the post being read.
	 *
	 * @param int $user_id author id.
	 * @param int $post_id current post id.
	 * @param int $count   number of posts.
	 *
	 * @return WP_Post[] posts
	 */
	private function get_latest_posts( $user_id, $post_id, $count ) {
		return get_posts(
			array(
				'author'              => $user_id,
				'post_type'           => 'post',
				'post_status'         => 'publish',
				'numberposts'         => max( 1, min( 10, (int) $count ) ),
				'post__not_in'        => $post_id ? array( (int) $post_id ) : array(),
				'ignore_sticky_posts' => true,
				'no_found_rows'       => true,
				'suppress_filters'    => false,
			)
		);
	}

	/**
	 * Initials of a name, at most two letters.
	 *
	 * @param string $name name.
	 *
	 * @return string initials
	 */
	private function get_initials( $name ) {
		$words    = preg_split( '/\s+/u', trim( $name ), -1, PREG_SPLIT_NO_EMPTY );
		$initials = '';

		foreach ( array_slice( $words, 0, 2 ) as $word ) {
			$initials .= mb_strtoupper( mb_substr( $word, 0, 1 ) );
		}

		return $initials;
	}

	/**
	 * Url of a social link, emails become mailto links.
	 *
	 * @param string $key   network key.
	 * @param string $value saved value.
	 *
	 * @return string url
	 */
	private function get_social_url( $key, $value ) {
		if ( 'email' === $key ) {
			$email = sanitize_email( str_replace( 'mailto:', '', $value ) );
			return $email ? 'mailto:' . $email : '';
		}

		return esc_url_raw( $value );
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
	 * Inline styles of the block wrapper, the same ones get-styles.js makes.
	 *
	 * Colors, sizes and the button go in as css variables, the stylesheet only
	 * uses a variable when it is set.
	 *
	 * @param array $attributes block attributes.
	 *
	 * @return string css declarations
	 */
	private function get_styles( $attributes ) {
		$sides          = array( 'top', 'right', 'bottom', 'left' );
		$padding        = Ultimate_Blocks\includes\get_spacing_css( (array) $attributes['padding'] );
		$margin         = Ultimate_Blocks\includes\get_spacing_css( (array) $attributes['margin'] );
		$button_padding = Ultimate_Blocks\includes\get_spacing_css( (array) $attributes['buttonPadding'] );
		$border         = Ultimate_Blocks\includes\get_border_css( (array) $attributes['border'] );
		$appearance     = function ( $key, $part ) use ( $attributes ) {
			return is_array( $attributes[ $key ] ) && isset( $attributes[ $key ][ $part ] ) ? $attributes[ $key ][ $part ] : '';
		};

		$styles = array(
			'--ub-author-avatar-size'             => $attributes['avatarSize'] . 'px',
			'--ub-author-social-size'             => $attributes['socialSize'] . 'px',
			'--ub-author-gap'                     => isset( $attributes['gap']['all'] ) ? Ultimate_Blocks\includes\spacing_preset_css_var( $attributes['gap']['all'] ) : '',
			'--ub-author-heading-color'           => $attributes['headingColor'],
			'--ub-author-heading-size'            => $attributes['headingFontSize'],
			'--ub-author-heading-weight'          => $appearance( 'headingFontAppearance', 'fontWeight' ),
			'--ub-author-heading-style'           => $appearance( 'headingFontAppearance', 'fontStyle' ),
			'--ub-author-name-color'              => $attributes['nameColor'],
			'--ub-author-name-size'               => $attributes['nameFontSize'],
			'--ub-author-name-weight'             => $appearance( 'nameFontAppearance', 'fontWeight' ),
			'--ub-author-name-style'              => $appearance( 'nameFontAppearance', 'fontStyle' ),
			'--ub-author-role-color'              => $attributes['roleColor'],
			'--ub-author-role-size'               => $attributes['roleFontSize'],
			'--ub-author-bio-color'               => $attributes['bioColor'],
			'--ub-author-bio-size'                => $attributes['bioFontSize'],
			'--ub-author-posts-color'             => $attributes['latestPostsColor'],
			'--ub-author-posts-size'              => $attributes['latestPostsFontSize'],
			'--ub-author-social-color'            => $attributes['socialColor'],
			'--ub-author-social-hover-color'      => $attributes['socialHoverColor'],
			'--ub-author-button-color'            => $attributes['buttonTextColor'],
			'--ub-author-button-background'       => Ultimate_Blocks\includes\get_background_color_var( $attributes, 'buttonBackgroundColor', 'buttonBackgroundGradient' ),
			'--ub-author-button-hover-color'      => $attributes['buttonHoverTextColor'],
			'--ub-author-button-hover-background' => Ultimate_Blocks\includes\get_background_color_var( $attributes, 'buttonHoverBackgroundColor', 'buttonHoverBackgroundGradient' ),
			'--ub-author-button-size'             => $attributes['buttonFontSize'],
			'--ub-author-button-weight'           => $appearance( 'buttonFontAppearance', 'fontWeight' ),
			'--ub-author-button-style'            => $appearance( 'buttonFontAppearance', 'fontStyle' ),
			'--ub-author-button-radius'           => $this->get_radius( $attributes['buttonBorderRadius'] ),
			'background'                          => Ultimate_Blocks\includes\get_background_color_var( $attributes, 'backgroundColor', 'backgroundGradient' ),
			'border-radius'                       => $this->get_radius( $attributes['borderRadius'] ),
		);

		foreach ( $sides as $side ) {
			$styles[ '--ub-author-button-padding-' . $side ] = isset( $button_padding[ $side ] ) ? $button_padding[ $side ] : '';
			$styles[ 'padding-' . $side ]                    = isset( $padding[ $side ] ) ? $padding[ $side ] : '';
			$styles[ 'margin-' . $side ]                     = isset( $margin[ $side ] ) ? $margin[ $side ] : '';
			$styles[ 'border-' . $side ]                     = empty( $border[ $side ]['width'] ) ? '' : Ultimate_Blocks\includes\get_single_side_border_value( $border, $side );
		}

		$css = '';
		foreach ( $styles as $property => $value ) {
			if ( is_string( $value ) && '' !== trim( $value ) ) {
				$css .= $property . ':' . $value . ';';
			}
		}

		return $css;
	}

	/**
	 * Render the block.
	 *
	 * @param array    $attributes block attributes.
	 * @param string   $content    block content.
	 * @param WP_Block $block      block instance.
	 *
	 * @return string block markup
	 */
	public function render( $attributes, $content, $block ) {
		$author = $this->get_author( $attributes, $block );

		if ( ! $author || '' === $author['name'] ) {
			return '';
		}

		$is_custom = 'custom' === $attributes['source'];
		$link_rel  = array();
		if ( $attributes['linkNewTab'] ) {
			$link_rel[] = 'noopener';
		}
		if ( $attributes['linkNoFollow'] ) {
			$link_rel[] = 'nofollow';
		}
		$link_attrs = ( $attributes['linkNewTab'] ? ' target="_blank"' : '' )
			. ( $link_rel ? ' rel="' . esc_attr( implode( ' ', $link_rel ) ) . '"' : '' );

		$wrapper_attributes = get_block_wrapper_attributes(
			array(
				'class'     => 'ub-author-bio',
				'style'     => safecss_filter_attr( $this->get_styles( $attributes ) ),
				'itemscope' => '',
				'itemtype'  => 'https://schema.org/Person',
			)
		);

		$markup = '';

		if ( $attributes['showHeading'] && '' !== trim( $attributes['headingText'] ) ) {
			$tag     = in_array( $attributes['headingLevel'], self::HEADING_TAGS, true ) ? $attributes['headingLevel'] : 'h3';
			$markup .= sprintf(
				'<%1$s class="ub-author-bio__heading">%2$s</%1$s>',
				$tag,
				esc_html( wp_strip_all_tags( $attributes['headingText'] ) )
			);
		}

		$markup .= '<div class="ub-author-bio__inner">';

		$initials = $attributes['avatarInitials'] ? $this->get_initials( $author['name'] ) : '';
		if ( $attributes['showAvatar'] && ( '' !== $initials || '' !== $author['avatar'] ) ) {
			$markup .= sprintf(
				'<div class="ub-author-bio__avatar is-%s">',
				esc_attr( in_array( $attributes['avatarShape'], array( 'circle', 'rounded', 'square' ), true ) ? $attributes['avatarShape'] : 'circle' )
			);
			if ( '' !== $initials ) {
				$markup .= '<span class="ub-author-bio__initials" aria-hidden="true">' . esc_html( $initials ) . '</span>';
			}
			if ( '' !== $author['avatar'] ) {
				$markup .= sprintf(
					'<img src="%1$s" alt="%2$s" width="%3$d" height="%3$d" loading="lazy" itemprop="image" />',
					esc_url( $author['avatar'] ),
					esc_attr( $author['name'] ),
					$attributes['avatarSize']
				);
			}
			$markup .= '</div>';
		}

		$markup .= '<div class="ub-author-bio__content">';

		$name_url = '';
		if ( 'archive' === $attributes['nameLink'] ) {
			$name_url = $author['archive'];
		} elseif ( 'website' === $attributes['nameLink'] ) {
			$name_url = $author['website'];
		}
		$name = '<span itemprop="name">' . esc_html( $author['name'] ) . '</span>';
		if ( '' !== $name_url ) {
			$name = sprintf( '<a href="%1$s" itemprop="url"%2$s>%3$s</a>', esc_url( $name_url ), $link_attrs, $name );
		}
		$markup .= '<p class="ub-author-bio__name">' . $name . '</p>';

		$meta = array();
		if ( $attributes['showRole'] && '' !== trim( (string) $author['role'] ) ) {
			$meta[] = '<span class="ub-author-bio__role" itemprop="jobTitle">' . esc_html( $author['role'] ) . '</span>';
		}
		if ( ! $is_custom && $attributes['showPostCount'] && null !== $author['count'] ) {
			$count  = (int) $author['count'];
			$meta[] = '<span class="ub-author-bio__count">' . esc_html(
				/* translators: %s: number of published posts */
				sprintf( _n( '%s article', '%s articles', $count, 'ultimate-blocks' ), number_format_i18n( $count ) )
			) . '</span>';
		}
		if ( $meta ) {
			$markup .= '<p class="ub-author-bio__meta">' . implode( '<span class="ub-author-bio__separator" aria-hidden="true">·</span>', $meta ) . '</p>';
		}

		if ( $attributes['showBio'] && '' !== trim( wp_strip_all_tags( $author['bio'] ) ) ) {
			$markup .= '<div class="ub-author-bio__bio" itemprop="description">' . wp_kses_post( $author['bio'] ) . '</div>';
		}

		if ( $attributes['showSocials'] && $author['socials'] ) {
			$links = '';
			foreach ( self::networks() as $network ) {
				if ( empty( $author['socials'][ $network['key'] ] ) ) {
					continue;
				}

				$url = $this->get_social_url( $network['key'], $author['socials'][ $network['key'] ] );
				if ( '' === $url ) {
					continue;
				}

				$links .= sprintf(
					'<li><a href="%1$s" class="ub-author-bio__social is-%2$s"%3$s%4$s aria-label="%5$s"><svg viewBox="%6$s" aria-hidden="true" focusable="false"><path d="%7$s" /></svg></a></li>',
					esc_url( $url, array( 'http', 'https', 'mailto' ) ),
					esc_attr( $network['key'] ),
					'email' === $network['key'] ? '' : ' itemprop="sameAs"',
					'email' === $network['key'] ? '' : $link_attrs,
					esc_attr( $network['label'] ),
					esc_attr( $network['viewBox'] ),
					esc_attr( $network['path'] )
				);
			}

			if ( '' !== $links ) {
				$markup .= '<ul class="ub-author-bio__socials">' . $links . '</ul>';
			}
		}

		if ( $author['posts'] ) {
			$markup .= '<div class="ub-author-bio__latest">';
			if ( '' !== trim( $attributes['latestPostsTitle'] ) ) {
				$markup .= '<p class="ub-author-bio__latest-title">' . esc_html( wp_strip_all_tags( $attributes['latestPostsTitle'] ) ) . '</p>';
			}
			$markup .= '<ul class="ub-author-bio__latest-list">';
			foreach ( $author['posts'] as $latest_post ) {
				$markup .= sprintf(
					'<li><a href="%1$s">%2$s</a>%3$s</li>',
					esc_url( get_permalink( $latest_post ) ),
					esc_html( get_the_title( $latest_post ) ),
					$attributes['showLatestPostsDate']
						? sprintf(
							'<time class="ub-author-bio__latest-date" datetime="%1$s">%2$s</time>',
							esc_attr( get_the_date( 'c', $latest_post ) ),
							esc_html( get_the_date( '', $latest_post ) )
						)
						: ''
				);
			}
			$markup .= '</ul></div>';
		}

		if ( $attributes['showPostsLink'] && '' !== $author['archive'] && '' !== trim( $attributes['postsLinkText'] ) ) {
			$markup .= sprintf(
				'<a class="ub-author-bio__posts-link wp-element-button" href="%1$s"%2$s>%3$s</a>',
				esc_url( $author['archive'] ),
				$is_custom ? $link_attrs : '',
				esc_html( wp_strip_all_tags( $attributes['postsLinkText'] ) )
			);
		}

		$markup .= '</div></div>';

		return sprintf( '<div %1$s>%2$s</div>', $wrapper_attributes, $markup );
	}
}

new Ultimate_Author_Bio();
