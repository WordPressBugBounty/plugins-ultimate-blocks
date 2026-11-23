/**
 * Classes of the block wrapper, the same ones block.php writes.
 *
 * @param {Object} attributes block attributes
 *
 * @return {string} class names
 */
export const getClasses = (attributes) =>
	[
		"ub-image-comparison",
		`is-${attributes.orientation === "vertical" ? "vertical" : "horizontal"}`,
		`has-labels-${attributes.labelPosition}`,
		attributes.labelsOnHover && "has-labels-on-hover",
		attributes.overlayOnHover && "has-overlay",
	]
		.filter(Boolean)
		.join(" ");

/**
 * The parts of a media library item the block keeps.
 *
 * @param {Object} media selected media
 *
 * @return {Object} id, url and alt text
 */
export const toMedia = (media) => ({
	id: media.id,
	url: media.sizes?.large?.url ?? media.url,
	alt: media.alt ?? "",
});

/**
 * Two arrows of the handle, the stylesheet turns them for the vertical slider.
 */
export const HandleIcon = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
		<path d="M9.5 6.5 4 12l5.5 5.5 1.06-1.06L6.12 12l4.44-4.44L9.5 6.5Zm5 0-1.06 1.06L17.88 12l-4.44 4.44 1.06 1.06L20 12l-5.5-5.5Z" />
	</svg>
);
