import {
	generateStyles,
	getBackgroundColorVar,
	getBorderCSS,
	getSingleSideBorderValue,
	getSpacingCss,
	getSpacingPresetCssVar,
} from "../utils/styling-helpers";

const SIDES = ["top", "right", "bottom", "left"];

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

const getRadius = (radius = {}) =>
	["topLeft", "topRight", "bottomRight", "bottomLeft"].some((corner) => radius[corner])
		? ["topLeft", "topRight", "bottomRight", "bottomLeft"]
				.map((corner) => radius[corner] || "0")
				.join(" ")
		: "";

/**
 * Inline styles of the block wrapper, the same ones block.php writes.
 *
 * Colors, sizes and the button go in as css variables, the stylesheet only
 * uses a variable when it is set.
 *
 * @param {Object} attributes block attributes
 *
 * @return {Object} style object
 */
export default function getStyles(attributes) {
	const padding = getSpacingCss(attributes.padding);
	const margin = getSpacingCss(attributes.margin);
	const buttonPadding = getSpacingCss(attributes.buttonPadding);
	const border = attributes.border ? getBorderCSS(attributes.border) : {};

	return generateStyles({
		"--ub-author-avatar-size": `${attributes.avatarSize}px`,
		"--ub-author-social-size": `${attributes.socialSize}px`,
		"--ub-author-gap": getSpacingPresetCssVar(attributes.gap?.all),
		"--ub-author-heading-color": attributes.headingColor,
		"--ub-author-heading-size": attributes.headingFontSize,
		"--ub-author-heading-weight": attributes.headingFontAppearance?.fontWeight,
		"--ub-author-heading-style": attributes.headingFontAppearance?.fontStyle,
		"--ub-author-name-color": attributes.nameColor,
		"--ub-author-name-size": attributes.nameFontSize,
		"--ub-author-name-weight": attributes.nameFontAppearance?.fontWeight,
		"--ub-author-name-style": attributes.nameFontAppearance?.fontStyle,
		"--ub-author-role-color": attributes.roleColor,
		"--ub-author-role-size": attributes.roleFontSize,
		"--ub-author-bio-color": attributes.bioColor,
		"--ub-author-bio-size": attributes.bioFontSize,
		"--ub-author-posts-color": attributes.latestPostsColor,
		"--ub-author-posts-size": attributes.latestPostsFontSize,
		"--ub-author-social-color": attributes.socialColor,
		"--ub-author-social-hover-color": attributes.socialHoverColor,
		"--ub-author-button-color": attributes.buttonTextColor,
		"--ub-author-button-background": getBackgroundColorVar(
			attributes,
			"buttonBackgroundColor",
			"buttonBackgroundGradient"
		),
		"--ub-author-button-hover-color": attributes.buttonHoverTextColor,
		"--ub-author-button-hover-background": getBackgroundColorVar(
			attributes,
			"buttonHoverBackgroundColor",
			"buttonHoverBackgroundGradient"
		),
		"--ub-author-button-size": attributes.buttonFontSize,
		"--ub-author-button-weight": attributes.buttonFontAppearance?.fontWeight,
		"--ub-author-button-style": attributes.buttonFontAppearance?.fontStyle,
		"--ub-author-button-radius": getRadius(attributes.buttonBorderRadius),
		...Object.fromEntries(
			SIDES.map((side) => [`--ub-author-button-padding-${side}`, buttonPadding[side]])
		),
		background: getBackgroundColorVar(
			attributes,
			"backgroundColor",
			"backgroundGradient"
		),
		...Object.fromEntries(
			SIDES.map((side) => [`padding${capitalize(side)}`, padding[side]])
		),
		...Object.fromEntries(
			SIDES.map((side) => [`margin${capitalize(side)}`, margin[side]])
		),
		...Object.fromEntries(
			SIDES.filter((side) => border[side]?.width).map((side) => [
				`border${capitalize(side)}`,
				getSingleSideBorderValue(border, side),
			])
		),
		borderRadius: getRadius(attributes.borderRadius),
	});
}
