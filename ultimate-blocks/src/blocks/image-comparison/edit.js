import { __, sprintf } from "@wordpress/i18n";
import { useRef, useState } from "@wordpress/element";
import { MediaPlaceholder, useBlockProps } from "@wordpress/block-editor";
import Inspector from "./inspector";
import getStyles from "./get-styles";
import { HandleIcon, getClasses, toMedia } from "./utils";

const clamp = (value) => Math.min(100, Math.max(0, value));

/**
 * Slider position in percent for a pointer event over the comparison.
 *
 * @param {Element}      element    comparison element
 * @param {PointerEvent} event      pointer event
 * @param {boolean}      isVertical whether the divider moves up and down
 *
 * @return {number} position
 */
const getPointerPosition = (element, event, isVertical) => {
	const rect = element.getBoundingClientRect();
	const offset = isVertical ? event.clientY - rect.top : event.clientX - rect.left;
	const size = isVertical ? rect.height : rect.width;

	return clamp(Math.round((offset / size) * 100));
};

export default function Edit(props) {
	const { attributes, setAttributes } = props;
	const {
		beforeImage,
		afterImage,
		orientation,
		startPosition,
		showLabels,
		beforeLabel,
		afterLabel,
	} = attributes;

	const isVertical = orientation === "vertical";
	const frameRef = useRef();
	//the position follows the pointer while dragging and is saved on release
	const [dragPosition, setDragPosition] = useState(null);
	const position = dragPosition ?? startPosition;

	const hasImages = beforeImage?.url && afterImage?.url;

	const styles = getStyles(attributes, position);

	const blockProps = useBlockProps(
		hasImages
			? { className: getClasses(attributes), style: styles.wrapper }
			: { className: "ub-image-comparison-placeholders" }
	);

	if (!hasImages) {
		return (
			<>
				<Inspector {...props} />
				<div {...blockProps}>
					{[
						["beforeImage", __("Before image", "ultimate-blocks")],
						["afterImage", __("After image", "ultimate-blocks")],
					].map(([key, label]) =>
						attributes[key]?.url ? (
							<figure key={key} className="ub-image-comparison-placeholders__preview">
								<img src={attributes[key].url} alt="" />
								<figcaption>{label}</figcaption>
							</figure>
						) : (
							<MediaPlaceholder
								key={key}
								icon="format-image"
								labels={{ title: label }}
								accept="image/*"
								allowedTypes={["image"]}
								onSelect={(media) => setAttributes({ [key]: toMedia(media) })}
							/>
						)
					)}
				</div>
			</>
		);
	}

	//only the handle drags in the editor, a click on the image just selects the block
	const startDrag = (event) => {
		if (event.button !== 0 || !event.target.closest(".ub-image-comparison__handle")) {
			return;
		}
		event.currentTarget.setPointerCapture(event.pointerId);
		setDragPosition(getPointerPosition(frameRef.current, event, isVertical));
	};

	const moveDrag = (event) => {
		if (dragPosition !== null) {
			setDragPosition(getPointerPosition(frameRef.current, event, isVertical));
		}
	};

	const endDrag = () => {
		if (dragPosition !== null) {
			setAttributes({ startPosition: dragPosition });
			setDragPosition(null);
		}
	};

	const onKeyDown = (event) => {
		const step = event.shiftKey ? 10 : 1;
		const keys = {
			ArrowLeft: -step,
			ArrowDown: isVertical ? step : -step,
			ArrowRight: step,
			ArrowUp: isVertical ? -step : step,
		};

		if (event.key in keys) {
			event.preventDefault();
			setAttributes({ startPosition: clamp(startPosition + keys[event.key]) });
		}
	};

	return (
		<>
			<Inspector {...props} />
			<div {...blockProps}>
				<div
					ref={frameRef}
					className="ub-image-comparison__frame"
					onPointerDown={startDrag}
					onPointerMove={moveDrag}
					onPointerUp={endDrag}
					onPointerCancel={endDrag}
				>
					<img
						className="ub-image-comparison__image is-after"
						src={afterImage.url}
						alt={afterImage.alt ?? ""}
						draggable={false}
					/>
					<div className="ub-image-comparison__before" style={styles.before}>
						<img
							className="ub-image-comparison__image is-before"
							src={beforeImage.url}
							alt={beforeImage.alt ?? ""}
							draggable={false}
						/>
					</div>
					{showLabels && (
						<>
							{beforeLabel && (
								<span className="ub-image-comparison__label is-before" style={styles.label}>
									{beforeLabel}
								</span>
							)}
							{afterLabel && (
								<span className="ub-image-comparison__label is-after" style={styles.label}>
									{afterLabel}
								</span>
							)}
						</>
					)}
					<div className="ub-image-comparison__divider" style={styles.divider}>
						<div
							className="ub-image-comparison__handle"
							style={styles.handle}
							role="slider"
							tabIndex={0}
							aria-label={__("Starting position of the slider", "ultimate-blocks")}
							aria-orientation={orientation}
							aria-valuemin={0}
							aria-valuemax={100}
							aria-valuenow={position}
							aria-valuetext={sprintf(
								/* translators: %d: slider position in percent */
								__("%d%%", "ultimate-blocks"),
								position
							)}
							onKeyDown={onKeyDown}
						>
							<HandleIcon />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
