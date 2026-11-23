import {
	generateStyles,
	getBorderCSS,
	getSingleSideBorderValue,
	getSpacingCss,
} from "../utils/styling-helpers";

const SIDES = ["top", "right", "bottom", "left"];
const CORNERS = ["topLeft", "topRight", "bottomRight", "bottomLeft"];

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

const getRadius = (radius = {}) =>
	CORNERS.some((corner) => radius[corner])
		? CORNERS.map((corner) => radius[corner] || "0").join(" ")
		: "";

/**
 * Clip path that cuts the before image at the slider position.
 *
 * @param {number}  position   slider position in percent
 * @param {boolean} isVertical whether the divider moves up and down
 *
 * @return {string} clip path
 */
export const getClipPath = (position, isVertical) =>
	isVertical ? `inset(0 0 ${100 - position}% 0)` : `inset(0 ${100 - position}% 0 0)`;

/**
 * Inline styles of every part of the block, the same ones block.php writes.
 *
 * @param {Object} attributes block attributes
 * @param {number} position   slider position in percent
 *
 * @return {Object} style objects of the wrapper, before layer, divider, handle and labels
 */
export default function getStyles(attributes, position = attributes.startPosition) {
	const isVertical = attributes.orientation === "vertical";
	const isLine = /\bis-style-line\b/.test(attributes.className ?? "");
	const margin = getSpacingCss(attributes.margin);
	const border = attributes.border ? getBorderCSS(attributes.border) : {};
	const lineWidth = `${attributes.lineWidth}px`;
	//the line style keeps a thin hit area around the line for the pointer and keyboard
	const lineHitArea = `${attributes.lineWidth + 12}px`;

	return {
		wrapper: generateStyles({
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
		}),
		before: { clipPath: getClipPath(position, isVertical) },
		divider: generateStyles({
			[isVertical ? "top" : "left"]: `${position}%`,
			[isVertical ? "height" : "width"]: lineWidth,
			background: attributes.lineColor,
		}),
		handle: generateStyles(
			isLine
				? {
						width: isVertical ? "48px" : lineHitArea,
						height: isVertical ? lineHitArea : "48px",
					}
				: {
						width: `${attributes.handleSize}px`,
						height: `${attributes.handleSize}px`,
						borderWidth: lineWidth,
						borderColor: attributes.lineColor,
						background: attributes.handleColor,
						color: attributes.handleIconColor,
					}
		),
		label: generateStyles({
			color: attributes.labelColor,
			background: attributes.labelBackground,
			fontSize: attributes.labelFontSize,
			fontWeight: attributes.labelFontAppearance?.fontWeight,
			fontStyle: attributes.labelFontAppearance?.fontStyle,
		}),
	};
}
