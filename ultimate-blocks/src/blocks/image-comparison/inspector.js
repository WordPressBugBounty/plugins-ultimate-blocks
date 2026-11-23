import { __ } from "@wordpress/i18n";
import {
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from "@wordpress/block-editor";
import {
	BaseControl,
	Button,
	PanelBody,
	RangeControl,
	TextControl,
	ToggleControl,
} from "@wordpress/components";
import {
	BorderControl,
	ColorSettings,
	CustomFontSizePicker,
	CustomToggleGroupControl,
	FontAppearanceControl,
	SpacingControlWithToolsPanel,
} from "../components";
import { toMedia } from "./utils";

/**
 * One image of the comparison with its preview, replace, remove and alt text.
 *
 * @param {Object}   props               component properties
 * @param {string}   props.label         image name
 * @param {Object}   props.image         image with id, url and alt
 * @param {Function} props.onChange      called with the new image
 */
const ImageSetting = ({ label, image, onChange }) => (
	<BaseControl __nextHasNoMarginBottom label={label} className="ub-image-comparison-image-setting">
		<MediaUploadCheck>
			<MediaUpload
				allowedTypes={["image"]}
				value={image?.id}
				onSelect={(media) => onChange(toMedia(media))}
				render={({ open }) => (
					<div className="ub-image-comparison-image-setting__row">
						{image?.url ? (
							<button
								type="button"
								className="ub-image-comparison-image-setting__preview"
								onClick={open}
								aria-label={__("Replace image", "ultimate-blocks")}
							>
								<img src={image.url} alt="" />
							</button>
						) : null}
						<div className="ub-image-comparison-image-setting__actions">
							<Button variant="secondary" onClick={open}>
								{image?.url
									? __("Replace", "ultimate-blocks")
									: __("Choose image", "ultimate-blocks")}
							</Button>
							{image?.url && (
								<Button variant="tertiary" isDestructive onClick={() => onChange({})}>
									{__("Remove", "ultimate-blocks")}
								</Button>
							)}
						</div>
					</div>
				)}
			/>
		</MediaUploadCheck>
		{image?.url && (
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={__("Alt text", "ultimate-blocks")}
				value={image.alt ?? ""}
				onChange={(alt) => onChange({ ...image, alt })}
			/>
		)}
	</BaseControl>
);

export default function Inspector({ attributes, setAttributes }) {
	const {
		beforeImage,
		afterImage,
		orientation,
		startPosition,
		handleSize,
		lineWidth,
		showLabels,
		beforeLabel,
		afterLabel,
		labelsOnHover,
		overlayOnHover,
	} = attributes;

	const isVertical = orientation === "vertical";

	return (
		<>
			<InspectorControls group="settings">
				<PanelBody title={__("Images", "ultimate-blocks")}>
					<div className="ub-image-comparison-controls">
						<ImageSetting
							label={__("Before image", "ultimate-blocks")}
							image={beforeImage}
							onChange={(image) => setAttributes({ beforeImage: image })}
						/>
						<ImageSetting
							label={__("After image", "ultimate-blocks")}
							image={afterImage}
							onChange={(image) => setAttributes({ afterImage: image })}
						/>
					</div>
				</PanelBody>
				<PanelBody title={__("Slider", "ultimate-blocks")} initialOpen={false}>
					<div className="ub-image-comparison-controls">
						<CustomToggleGroupControl
							label={__("Direction", "ultimate-blocks")}
							attributeKey="orientation"
							isBlock
							options={[
								{ value: "horizontal", label: __("Horizontal", "ultimate-blocks") },
								{ value: "vertical", label: __("Vertical", "ultimate-blocks") },
							]}
						/>
						<RangeControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={__("Starting position (%)", "ultimate-blocks")}
							help={__("You can also drag the handle on the image.", "ultimate-blocks")}
							value={startPosition}
							min={0}
							max={100}
							onChange={(value) => setAttributes({ startPosition: value ?? 50 })}
						/>
						<CustomToggleGroupControl
							label={__("Move the slider on", "ultimate-blocks")}
							attributeKey="moveOn"
							isBlock
							options={[
								{ value: "drag", label: __("Drag", "ultimate-blocks") },
								{ value: "hover", label: __("Hover", "ultimate-blocks") },
								{ value: "click", label: __("Click", "ultimate-blocks") },
							]}
						/>
						<ToggleControl
							__nextHasNoMarginBottom
							label={__("Darken on hover", "ultimate-blocks")}
							checked={overlayOnHover}
							onChange={(value) => setAttributes({ overlayOnHover: value })}
						/>
					</div>
				</PanelBody>
				<PanelBody title={__("Handle", "ultimate-blocks")} initialOpen={false}>
					<div className="ub-image-comparison-controls">
						<RangeControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={__("Handle size", "ultimate-blocks")}
							help={__("Not used by the Line style.", "ultimate-blocks")}
							value={handleSize}
							min={24}
							max={96}
							onChange={(value) => setAttributes({ handleSize: value ?? 44 })}
						/>
						<RangeControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={__("Line width", "ultimate-blocks")}
							value={lineWidth}
							min={1}
							max={12}
							onChange={(value) => setAttributes({ lineWidth: value ?? 3 })}
						/>
					</div>
				</PanelBody>
				<PanelBody title={__("Labels", "ultimate-blocks")} initialOpen={false}>
					<div className="ub-image-comparison-controls">
						<ToggleControl
							__nextHasNoMarginBottom
							label={__("Show labels", "ultimate-blocks")}
							checked={showLabels}
							onChange={(value) => setAttributes({ showLabels: value })}
						/>
						{showLabels && (
							<>
								<TextControl
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									label={__("Before label", "ultimate-blocks")}
									value={beforeLabel}
									onChange={(value) => setAttributes({ beforeLabel: value })}
								/>
								<TextControl
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									label={__("After label", "ultimate-blocks")}
									value={afterLabel}
									onChange={(value) => setAttributes({ afterLabel: value })}
								/>
								<CustomToggleGroupControl
									label={__("Label position", "ultimate-blocks")}
									attributeKey="labelPosition"
									isBlock
									options={
										isVertical
											? [
													{ value: "start", label: __("Left", "ultimate-blocks") },
													{ value: "center", label: __("Center", "ultimate-blocks") },
													{ value: "end", label: __("Right", "ultimate-blocks") },
												]
											: [
													{ value: "start", label: __("Top", "ultimate-blocks") },
													{ value: "center", label: __("Middle", "ultimate-blocks") },
													{ value: "end", label: __("Bottom", "ultimate-blocks") },
												]
									}
								/>
								<ToggleControl
									__nextHasNoMarginBottom
									label={__("Show labels only on hover", "ultimate-blocks")}
									checked={labelsOnHover}
									onChange={(value) => setAttributes({ labelsOnHover: value })}
								/>
							</>
						)}
					</div>
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="color">
				<ColorSettings attrKey="handleColor" label={__("Handle", "ultimate-blocks")} />
				<ColorSettings
					attrKey="handleIconColor"
					label={__("Handle arrows", "ultimate-blocks")}
				/>
				<ColorSettings attrKey="lineColor" label={__("Line", "ultimate-blocks")} />
				{showLabels && (
					<>
						<ColorSettings attrKey="labelColor" label={__("Label text", "ultimate-blocks")} />
						<ColorSettings
							attrKey="labelBackground"
							label={__("Label background", "ultimate-blocks")}
						/>
					</>
				)}
			</InspectorControls>
			{showLabels && (
				<InspectorControls group="typography">
					<CustomFontSizePicker
						attrKey="labelFontSize"
						label={__("Label Font Size", "ultimate-blocks")}
					/>
					<FontAppearanceControl
						showDefault={false}
						attrKey="labelFontAppearance"
						label={__("Label Appearance", "ultimate-blocks")}
					/>
				</InspectorControls>
			)}
			<InspectorControls group="border">
				<BorderControl
					showDefaultBorderRadius
					attrBorderKey="border"
					attrBorderRadiusKey="borderRadius"
					borderLabel={__("Border", "ultimate-blocks")}
					borderRadiusLabel={__("Border Radius", "ultimate-blocks")}
				/>
			</InspectorControls>
			<InspectorControls group="dimensions">
				<SpacingControlWithToolsPanel
					showByDefault
					minimumCustomValue={-Infinity}
					attrKey="margin"
					label={__("Margin", "ultimate-blocks")}
				/>
			</InspectorControls>
		</>
	);
}
