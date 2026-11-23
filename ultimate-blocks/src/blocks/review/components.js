import { isEmpty } from "lodash";
import {
	RichText,
	MediaUpload,
	URLInput,
	InnerBlocks,
} from "@wordpress/block-editor";
import { Button, Dashicon } from "@wordpress/components";
import { Icon, plusCircle, trash } from "@wordpress/icons";
import { __ } from "@wordpress/i18n";

import { removeIcon } from "./icon";
import { useEffect, useRef, useState } from "react";
import { generateStyles, getSpacingCss } from "../utils/styling-helpers";

export function OldStars(props) {
	const {
		value,
		activeStarColor,
		limit,
		id,
		className,
		inactiveStarColor,
		style,
	} = props;
	return (
		<div
			className={className}
			style={Object.assign(
				{
					display: "flex",
					flexDirection: "flex-row",
				},
				style,
			)}
		>
			{[...Array(limit).keys()].map((i) => (
				<svg key={i} height="20" width="20" viewBox="0 0 150 150">
					<defs>
						<mask id={`ub_review_star_filter-${id}-${i}`}>
							<rect
								height="150"
								width={
									(value - i > 0 ? (value - i < 1 ? value - i : 1) : 0) * 150
								}
								y="0"
								x="0"
								fill="#fff"
							/>
						</mask>
					</defs>

					<path
						fill={inactiveStarColor}
						strokeWidth="1.5"
						d="m0.75,56.89914l56.02207,0l17.31126,-56.14914l17.31126,56.14914l56.02206,0l-45.32273,34.70168l17.31215,56.14914l-45.32274,-34.70262l-45.32274,34.70262l17.31215,-56.14914l-45.32274,-34.70168z"
						stroke="#000"
					/>
					<path
						className="star"
						id={`star${i}`}
						mask={`url(#ub_review_star_filter-${id}-${i})`}
						fill={activeStarColor}
						strokeWidth="1.5"
						d="m0.75,56.89914l56.02207,0l17.31126,-56.14914l17.31126,56.14914l56.02206,0l-45.32273,34.70168l17.31215,56.14914l-45.32274,-34.70262l-45.32274,34.70262l17.31215,-56.14914l-45.32274,-34.70168z"
						stroke="#000"
					/>
				</svg>
			))}
		</div>
	);
}

export function Stars(props) {
	const {
		limit,
		id,
		className,
		inactiveStarColor,
		value,
		activeStarColor,
		selectedStarColor,
		setValue,
		onHover,
		onClick,
		style,
		starOutlineColor,
	} = props;

	const [displayValue, setDisplayValue] = useState(value);
	const [displayColor, setDisplayColor] = useState(activeStarColor);

	const mouseHover = (i) => {
		setDisplayValue(i + (value - i === 1 ? 0.5 : 1));
		setDisplayColor(selectedStarColor);
	};

	const mouseLeave = () => {
		setDisplayValue(value);
		setDisplayColor(activeStarColor);
	};

	const mouseClick = (i) => {
		setValue(value === i + 1 ? i + 0.5 : i + 1);
		setDisplayValue(value === i + 1 ? i + 0.5 : i + 1);
	};

	useEffect(() => {
		setDisplayColor(activeStarColor);
		if (onHover || displayValue !== value) {
			setDisplayValue(value);
		}
	}, [value, activeStarColor]);

	return (
		<div
			className={className}
			style={Object.assign(
				{
					display: "flex",
					flexDirection: "flex-row",
				},
				style,
			)}
		>
			{[...Array(limit).keys()].map((i) => {
				return (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						key={i}
						height="20"
						width="20"
						viewBox="0 0 150 150"
						style={{ pointerEvents: "all" }}
						onMouseOver={() => onHover || mouseHover(i)}
						onMouseOut={() => mouseLeave()}
						onClick={() => onClick || mouseClick(i)}
					>
						<defs>
							<mask id={`ub_review_star_filter-${id}-${i}`}>
								<rect
									height="150"
									width={
										(displayValue - i > 0
											? displayValue - i < 1
												? displayValue - i
												: 1
											: 0) * 150
									}
									y="0"
									x="0"
									fill="#fff"
								/>
							</mask>
						</defs>

						<path
							fill={inactiveStarColor}
							strokeWidth="2.5"
							d="m0.75,56.89914l56.02207,0l17.31126,-56.14914l17.31126,56.14914l56.02206,0l-45.32273,34.70168l17.31215,56.14914l-45.32274,-34.70262l-45.32274,34.70262l17.31215,-56.14914l-45.32274,-34.70168z"
							stroke={starOutlineColor}
						/>
						<path
							className="star"
							id={`star${i}`}
							mask={`url(#ub_review_star_filter-${id}-${i})`}
							fill={displayColor}
							strokeWidth="2.5"
							d="m0.75,56.89914l56.02207,0l17.31126,-56.14914l17.31126,56.14914l56.02206,0l-45.32273,34.70168l17.31215,56.14914l-45.32274,-34.70262l-45.32274,34.70262l17.31215,-56.14914l-45.32274,-34.70168z"
							stroke={starOutlineColor}
						/>
					</svg>
				);
			})}
		</div>
	);
}

/**
 * Highest value a rating can have in the chosen format.
 *
 * @param {string} valueType  star, percent or point
 * @param {number} starCount  number of stars
 * @param {number} pointScale top of the point scale, 5 or 10
 * @return {number} highest value
 */
export function getRatingMax(valueType, starCount, pointScale) {
	if (valueType === "percent") {
		return 100;
	}

	return valueType === "point" ? pointScale || 10 : starCount;
}

/**
 * Smallest step between two ratings in the chosen format.
 *
 * @param {string} valueType star, percent or point
 * @return {number} step
 */
export function getRatingStep(valueType) {
	if (valueType === "percent") {
		return 1;
	}

	return valueType === "point" ? 0.5 : 0.1;
}

/**
 * Carry the ratings over to another scale, so 4 of 5 stars becomes 80% or
 * 8 of 10 points.
 *
 * @param {Array}  parts  rated features
 * @param {number} oldMax highest value of the current scale
 * @param {number} newMax highest value of the new scale
 * @param {number} step   step of the new scale
 * @return {Array} features with converted values
 */
export function rescaleParts(parts, oldMax, newMax, step) {
	return parts.map((part) => ({
		...part,
		//toFixed drops the float noise of steps like 0.1
		value: parseFloat(
			(Math.round(((part.value / oldMax) * newMax) / step) * step).toFixed(2),
		),
	}));
}

/**
 * The offer price written for people, like $136. Mirrors
 * ub_review_format_price() in block.php.
 *
 * @param {number} price    offer price
 * @param {string} currency ISO currency code
 * @return {string} price
 */
export function formatPrice(price, currency) {
	const symbols = {
		USD: "$",
		EUR: "€",
		GBP: "£",
		JPY: "¥",
		INR: "₹",
		AUD: "A$",
		CAD: "C$",
	};
	const amount = Number.isInteger(Number(price))
		? Number(price).toLocaleString("en-US")
		: Number(price).toLocaleString("en-US", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			});

	return symbols[currency] ? `${symbols[currency]}${amount}` : `${amount} ${currency}`;
}

//feature names whose Enter is already stopped
const enterStopped = new WeakSet();

/**
 * Stops Enter in a feature name. Without onSplit WordPress takes Enter in a
 * RichText as "add a block after this one" and puts a paragraph under the
 * review; a feature name has never done anything on Enter since WP 6.4.
 *
 * @param {HTMLElement|null} node feature name editable.
 */
const stopFeatureEnter = (node) => {
	if (!node || enterStopped.has(node)) {
		return;
	}
	enterStopped.add(node);
	node.addEventListener("beforeinput", (event) => {
		if (event.inputType === "insertParagraph") {
			event.preventDefault();
		}
	});
};

export function ReviewBody(props) {
	const {
		isSelected,
		setAttributes,
		authorName,
		itemName,
		imgID,
		imgAlt,
		imgURL,
		imgPosition,
		enableImage,
		description,
		descriptionEnabled,
		blockID,
		parts,
		useSummary,
		summaryTitle,
		summaryDescription,
		valueType,
		starCount,
		pointScale,
		reviewLayout,
		showPriceBadge,
		offerPrice,
		offerCurrency,
		callToActionText,
		callToActionURL,
		ctaAlignment,
		callToActionBackColor,
		callToActionBorderColor,
		callToActionForeColor,
		inactiveStarColor,
		activeStarColor,
		selectedStarColor,
		starOutlineColor,
		activePercentBarColor,
		percentBarColor,
		setEditable,
		activeStarIndex,
		setActiveStarIndex,
		alignments,
		enableCTA,
		measureCTAFontSize,
		imageSize,
		ctaFontSize,
		ctaOpenInNewTab,
		ctaNoFollow,
		ctaIsSponsored,
		block,
		padding,
		margin,
		summaryTitleFontSize,
		mainTitleFontSize,
		children,
		proWrapperStyles,
		wrapperRef,
	} = props;

	const { titleAlign, authorAlign, descriptionAlign } = alignments;

	const [average, setAverage] = useState(
		parts?.map((i) => i.value).reduce((total, v) => total + v) / parts?.length,
	);
	const [mouseOnHold, setMouseOnHold] = useState(false);

	const ctaButton = useRef(null);

	useEffect(() => {
		if (measureCTAFontSize) {
			if (ctaButton.current) {
				setAttributes({
					callToActionFontSize: parseInt(
						getComputedStyle(ctaButton.current).fontSize.slice(0, -2),
					),
				});
			}
		}
	}, [measureCTAFontSize]);

	const newAverage =
		parts.map((i) => i.value).reduce((total, v) => total + v) / parts.length;

	if (average !== newAverage) {
		setAverage(newAverage);
	}

	const setNewPercentage = (percentageBar, mouseX, i, j) => {
		const newValue = Math.round(
			(100 * (mouseX - percentageBar.x)) / percentageBar.width,
		);
		const newArray = [
			...parts.slice(0, i),
			{ label: j.label, value: newValue },
			...parts.slice(i + 1),
		];
		setAttributes({ parts: newArray });
		setActiveStarIndex(i);
		setAverage(
			newArray.map((i) => i.value).reduce((total, v) => total + v) /
				newArray.length,
		);
	};
	const paddingObj = getSpacingCss(padding);
	const marginObj = getSpacingCss(margin);
	const summaryStyles = {
		fontSize: summaryTitleFontSize || "24px",
	};
	const mainTitleStyles = {
		textAlign: titleAlign,
		fontSize: mainTitleFontSize || "28px",
	};
	const styles = {
		paddingTop: paddingObj?.top,
		paddingRight: paddingObj?.right,
		paddingBottom: paddingObj?.bottom,
		paddingLeft: paddingObj?.left,
		marginTop: marginObj?.top,
		marginRight: marginObj?.right,
		marginBottom: marginObj?.bottom,
		marginLeft: marginObj?.left,
		...(proWrapperStyles || {}),
	};

	const has_button_block = block.innerBlocks.length > 0;

	const isCardLayout = reviewLayout === "card";
	const ratingMax = getRatingMax(valueType, starCount, pointScale);

	//the card writes every rating as a bar, a click on it sets the value at
	//that spot of the scale
	const setValueFromBar = (bar, mouseX, i, j) => {
		const step = getRatingStep(valueType);
		const ratio = Math.min(1, Math.max(0, (mouseX - bar.x) / bar.width));
		const newValue = parseFloat(
			(Math.round((ratio * ratingMax) / step) * step).toFixed(2),
		);
		const newArray = [
			...parts.slice(0, i),
			{ label: j.label, value: newValue },
			...parts.slice(i + 1),
		];
		setAttributes({ parts: newArray });
		setActiveStarIndex(i);
		setAverage(
			newArray.map((i) => i.value).reduce((total, v) => total + v) /
				newArray.length,
		);
	};

	const renderCardEntry = (j, i) => (
		<div className="ub_review_score_entry" key={i}>
			<RichText
				tagName="span"
				className="ub_review_score_label"
				placeholder={__("Feature name")}
				value={j.label}
				onChange={(text) =>
					setAttributes({
						parts: [
							...parts.slice(0, i),
							{ label: text, value: j.value },
							...parts.slice(i + 1),
						],
					})
				}
				unstableOnFocus={() => {
					setEditable("");
					setActiveStarIndex(i);
				}}
			/>
			<span
				className="ub_review_score_bar"
				style={{ backgroundColor: percentBarColor || "#e8e8e8" }}
				onClick={(e) =>
					setValueFromBar(e.currentTarget.getBoundingClientRect(), e.clientX, i, j)
				}
			>
				<span
					className="ub_review_score_fill"
					style={{
						width: `${Math.min(100, Math.max(0, (j.value / ratingMax) * 100))}%`,
						backgroundColor: activePercentBarColor || "#3e8e41",
					}}
				>
					<span className="ub_review_score_value">
						{valueType === "percent" ? `${j.value}%` : j.value}
					</span>
				</span>
			</span>
			{parts.length > 1 && (
				<span
					className="ub_review_remove_entry"
					role="button"
					tabIndex={0}
					title={__("Remove this feature")}
					aria-label={__("Remove this feature")}
					onClick={() => {
						setEditable("");
						const newParts = parts
							.slice(0, i)
							.concat(parts.slice(i + 1, parts.length));
						setAttributes({ parts: newParts });
						setAverage(
							newParts.map((i) => i.value).reduce((total, v) => total + v) /
								newParts.length,
						);
						if (i <= activeStarIndex) {
							setActiveStarIndex(activeStarIndex - 1);
						}
					}}
				>
					<Icon icon={trash} size={18} />
				</span>
			)}
		</div>
	);

	const addEntryButton = (
		//An SVG, not a dashicon: the dashicons font is not loaded in the
		//iframed editor canvas, which left this button empty and invisible.
		<div
			title={__("Insert new review entry")}
			aria-label={__("Insert new review entry")}
			role="button"
			tabIndex={0}
			onClick={() => {
				setAttributes({
					parts: [...parts, { label: "", value: 0 }],
				});
				setAverage(average / (parts.length + 1));
			}}
			className="ub_review_add_entry"
		>
			<Icon icon={plusCircle} size={24} />
		</div>
	);

	return (
		<div
			className={`ub_review_block${isCardLayout ? " ub_review_layout_card" : ""}`}
			style={generateStyles(styles)}
			ref={wrapperRef}
		>
			<RichText
				className="ub_review_item_name"
				placeholder={__("Title of the review")}
				value={itemName}
				style={generateStyles(mainTitleStyles)}
				onChange={(text) => setAttributes({ itemName: text })}
				unstableOnFocus={() => setEditable("reviewTitle")}
			/>
			{isCardLayout && showPriceBadge && offerPrice > 0 && (
				<span className="ub_review_price_badge">
					{formatPrice(offerPrice, offerCurrency)}
				</span>
			)}
			<RichText
				className="ub_review_author_name"
				placeholder={__("Review Author name")}
				value={authorName}
				style={{ textAlign: authorAlign }}
				onChange={(text) => setAttributes({ authorName: text })}
				unstableOnFocus={() => setEditable("reviewAuthor")}
			/>
			{(enableImage || descriptionEnabled) && (
				<div
					className={`ub_review_description_container ub_review_${imgPosition}_image`}
				>
					{enableImage &&
						(imgID ? (
							<div className="ub_review_image_container">
								<img
									className="ub_review_image"
									src={imgURL}
									alt={imgAlt}
									style={{
										maxHeight: `${imageSize}px`,
										maxWidth: `${imageSize}px`,
									}}
								/>
								{isSelected && (
									<Button
										className="ub-remove-image"
										onClick={() =>
											setAttributes({
												imgID: 0,
												imgURL: "",
												imgAlt: "",
											})
										}
									>
										{removeIcon}
									</Button>
								)}
							</div>
						) : (
							<div className="ub_review_upload_button">
								<MediaUpload
									onSelect={(img) =>
										setAttributes({
											imgID: img.id,
											imgURL: img.url,
											imgAlt: img.alt,
										})
									}
									allowedTypes={["image"]}
									value={imgID}
									render={({ open }) => (
										<Button
											className="components-button button button-medium"
											onClick={open}
										>
											{__("Upload Image")}
										</Button>
									)}
								/>
							</div>
						))}
					{descriptionEnabled && (
						<RichText
							className="ub_review_description"
							placeholder={__("Item description")}
							value={description}
							onChange={(text) => setAttributes({ description: text })}
							style={{ textAlign: descriptionAlign }}
							unstableOnFocus={() => setEditable("reviewItemDescription")}
						/>
					)}
				</div>
			)}
			{isCardLayout && (
				<div className="ub_review_card_bars">
					{parts.map(renderCardEntry)}
					{addEntryButton}
				</div>
			)}
			{!isCardLayout && parts.map((j, i) => (
				<div
					className={`ub_review_${
						valueType === "percent" ? "percentage_" : ""
					}entry`}
				>
					<RichText
						key={i}
						placeholder={__("Feature name")}
						value={j.label}
						onChange={(text) =>
							setAttributes({
								parts: [
									...parts.slice(0, i),
									{ label: text, value: j.value },
									...parts.slice(i + 1),
								],
							})
						}
						unstableOnFocus={() => {
							setEditable("");
							setActiveStarIndex(i);
						}}
						//the onSplit prop of RichText is deprecated since WP 6.4 (console: "wp.blockEditor.RichText onSplit prop is deprecated"), and WordPress has not called it since then;
						//Enter adds nothing to a feature name, as it already did since then
						disableLineBreaks
						ref={stopFeatureEnter}
						onReplace={(label) => {
							setAttributes({
								parts: [
									...parts.slice(0, i),
									{ label: label[0], value: j.value },
									{ label: label[1], value: j.value },
									...parts.slice(i + 1),
								],
							});
						}}
						onMerge={(mergeWithNext) => {
							if (mergeWithNext) {
								if (i < parts.length - 1) {
									setAttributes({
										parts: [
											...parts.slice(0, i),
											{
												label: `${parts[i].label}${parts[i + 1].label}`,
												value: j.value,
											},
											...parts.slice(i + 2),
										],
									});
								}
							} else {
								if (i > 0) {
									setAttributes({
										parts: [
											...parts.slice(0, i - 1),
											{
												label: `${parts[i - 1].label}${parts[i].label}`,
												value: parts[i - 1].value,
											},
											...parts.slice(i + 1),
										],
									});
								}
								if (i === parts.length - 1) {
									setActiveStarIndex(-1);
								}
							}
						}}
					/>
					<div
						key={i}
						className={"ub_review_value"}
						style={{
							marginLeft: "auto",
							minWidth: parts.length > 1 ? 120 : 100,
						}}
					>
						{parts.length > 1 && (
							<span
								className="ub_review_remove_entry"
								role="button"
								tabIndex={0}
								title={__("Remove this feature")}
								aria-label={__("Remove this feature")}
								onClick={() => {
									setEditable("");
									const newParts = parts
										.slice(0, i)
										.concat(parts.slice(i + 1, parts.length));
									setAttributes({ parts: newParts });

									setAverage(
										newParts
											.map((i) => i.value)
											.reduce((total, v) => total + v) / newParts.length,
									);

									if (i <= activeStarIndex) {
										setActiveStarIndex(activeStarIndex - 1);
									}
								}}
							>
								<Icon icon={trash} size={20} />
							</span>
						)}
						{valueType === "star" ? (
							<Stars
								id={`${blockID}-${i}`}
								key={i}
								value={j.value}
								limit={starCount}
								setValue={(newValue) => {
									const newArray = [
										...parts.slice(0, i),
										{ label: j.label, value: newValue },
										...parts.slice(i + 1),
									];
									setAttributes({ parts: newArray });
									setActiveStarIndex(i);
									setAverage(
										newArray
											.map((i) => i.value)
											.reduce((total, v) => total + v) / newArray.length,
									);
								}}
								inactiveStarColor={inactiveStarColor}
								activeStarColor={activeStarColor}
								selectedStarColor={selectedStarColor}
								starOutlineColor={starOutlineColor}
							/>
						) : valueType === "point" ? (
							<span className="ub_review_points">
								<input
									type="number"
									className="ub_review_points_value"
									aria-label={__("Points", "ultimate-blocks")}
									min={0}
									max={pointScale}
									step={0.5}
									value={j.value}
									onFocus={() => {
										setEditable("");
										setActiveStarIndex(i);
									}}
									onChange={(e) => {
										const newValue = Math.min(
											pointScale,
											Math.max(0, parseFloat(e.target.value) || 0),
										);
										const newArray = [
											...parts.slice(0, i),
											{ label: j.label, value: newValue },
											...parts.slice(i + 1),
										];
										setAttributes({ parts: newArray });
										setAverage(
											newArray
												.map((i) => i.value)
												.reduce((total, v) => total + v) / newArray.length,
										);
									}}
								/>
								<span className="ub_review_points_scale">/{pointScale}</span>
							</span>
						) : (
							<div className="ub_review_percentage">
								<svg
									className="ub_review_percentage_bar"
									viewBox="0 0 100 1"
									style={{ pointerEvents: "all" }}
									preserveAspectRatio="none"
									height="10"
									onClick={(e) =>
										setNewPercentage(
											e.currentTarget.getBoundingClientRect(),
											e.clientX,
											i,
											j,
										)
									}
									//in cases where the user drags across the bar
									onMouseDown={() => setMouseOnHold(true)}
									onMouseUp={() => setMouseOnHold(false)}
									onMouseMove={(e) => {
										if (mouseOnHold) {
											setNewPercentage(
												e.currentTarget.getBoundingClientRect(),
												e.clientX,
												i,
												j,
											);
										}
									}}
								>
									<path
										className="ub_review_percentage_bar_trail"
										d="M 0.5,0.5 L 99.5,0.5"
										stroke={percentBarColor || "#d9d9d9"}
										strokeWidth="1"
									/>
									<path
										className="ub_review_percentage_bar_path"
										d="M 0.5,0.5 L 99.5,0.5"
										stroke={activePercentBarColor}
										strokeWidth="1"
										strokeDashoffset={`${100 - j.value}px`}
									/>
								</svg>
								<div>{j.value}%</div>
							</div>
						)}
					</div>
				</div>
			))}
			{!isCardLayout && addEntryButton}
			<div className="ub_review_summary">
				{useSummary && (
					<RichText
						style={generateStyles(summaryStyles)}
						className="ub_review_summary_title"
						placeholder={__("Title of the summary goes here")}
						onChange={(text) => setAttributes({ summaryTitle: text })}
						value={summaryTitle}
						unstableOnFocus={() => setEditable("")}
					/>
				)}
				<div className="ub_review_overall_value">
					{useSummary && (
						<RichText
							placeholder={__("Summary of the review goes here")}
							onChange={(text) => setAttributes({ summaryDescription: text })}
							value={summaryDescription}
							unstableOnFocus={() => setEditable("")}
						/>
					)}
					<div className="ub_review_average">
						<span className="ub_review_rating">
							{Math.round(average * 10) / 10}
							{valueType === "percent" ? "%" : ""}
							{valueType === "point" && (
								<span className="ub_review_points_scale">/{pointScale}</span>
							)}
						</span>
						{valueType === "star" && (
							<Stars
								id={`${blockID}-average`}
								className="ub_review_average_stars"
								onHover={() => null}
								onClick={() => null}
								value={average}
								limit={starCount}
								inactiveStarColor={inactiveStarColor}
								activeStarColor={activeStarColor}
								selectedStarColor={selectedStarColor}
								starOutlineColor={starOutlineColor}
							/>
						)}
					</div>
				</div>
				{children}
				<div className="ub_review_cta_panel">
					<div
						className="ub_review_cta_main"
						style={{
							justifyContent: ctaAlignment,
						}}
					>
						{enableCTA && (
							<InnerBlocks
								renderAppender={
									has_button_block ? false : InnerBlocks.ButtonBlockAppender
								}
								allowedBlocks={["ub/button"]}
								template={[
									[
										"ub/button",
										{
											chosenIcon: "",
											placeholder: "Call To Action",
											buttonText: "Button Text",
											align: ctaAlignment,
											buttons: [
												{
													buttonText: !isEmpty(callToActionText)
														? callToActionText
														: "Call To Action",
													chosenIcon: "",
													buttonColor: !isEmpty(callToActionBackColor)
														? callToActionBackColor
														: "#E11B4C",
													buttonTextColor: callToActionForeColor || "#FFFFFF",
													url: callToActionURL,
													openInNewTab: ctaOpenInNewTab,
													addSponsored: ctaIsSponsored,
													addNoFollow: ctaNoFollow,
													size: "medium",
													buttonHoverColor: !isEmpty(callToActionBackColor)
														? callToActionBackColor
														: "#E11B4C",
													buttonTextHoverColor: "#ffffff",
													buttonRounded: true,
													buttonRadius: 10,
													buttonRadiusUnit: "px",
													topLeftRadius: 10,
													topLeftRadiusUnit: "px",
													topRightRadius: 10,
													topRightRadiusUnit: "px",
													bottomLeftRadius: 10,
													bottomLeftRadiusUnit: "px",
													bottomRightRadius: 10,
													bottomRightRadiusUnit: "px",
													iconPosition: "left",
													iconSize: 0,
													iconUnit: "px",
													buttonIsTransparent: false,
													buttonWidth: "flex",
												},
											],
											buttonColor: "#313131",
											buttonHoverColor: "#313131",
											buttonIsTransparent: false,
											buttonRounded: true,
											buttonTextColor: "#ffffff",
											buttonTextHoverColor: "#ffffff",
											buttonWidth: "flex",
											iconPosition: "left",
											isFlexWrap: true,
											margin: {},
											openInNewTab: ctaOpenInNewTab,
											addSponsored: ctaIsSponsored,
											addNoFollow: ctaNoFollow,
											orientation: "row",
											padding: {},
											size: "medium",
											url: "",
										},
									],
								]}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
