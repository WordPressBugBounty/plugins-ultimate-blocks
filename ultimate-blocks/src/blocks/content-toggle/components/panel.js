import icon from "../icons/icon";
import icons from "../icons/icons";
import { plus, closeSmall, chevronDown, Icon } from "@wordpress/icons";

import { panel_version_1_1_9 } from "../oldVersions";
import { useState, useEffect } from "react";
import SavedStylesInspector from "$Inc/components/SavedStyles/SavedStylesInspector";
import ProManager from "$Manager/ProManager";
import metadata from "./panel/block.json";
import { __ } from "@wordpress/i18n";
import { registerBlockType } from "@wordpress/blocks";

import {
	RichText,
	InnerBlocks,
	InspectorControls,
	InspectorAdvancedControls,
	useBlockProps,
	__experimentalSpacingSizesControl as SpacingSizesControl,
	BlockControls,
} from "@wordpress/block-editor";
import GenericStyleControl, {
	createStyleClipboard,
} from "$Inc/components/GenericStyleControl";
import { ColorSettings } from "../../components/";

import { compose } from "@wordpress/compose";

import {
	withDispatch,
	withSelect,
	useSelect,
	useDispatch,
} from "@wordpress/data";

import {
	getBorderCSS,
	getSingleSideBorderValue,
} from "../../utils/styling-helpers";

import {
	PanelBody,
	PanelRow,
	SelectControl,
	Button,
	ToggleControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
} from "@wordpress/components";
import { TITLE_TAG_OPTIONS } from "./constants";

const attributes = {
	index: {
		type: "number",
		default: 0,
	},
	parentID: {
		type: "string",
		default: "",
	},
	theme: {
		type: "text",
		default: "",
	},
	collapsed: {
		type: "boolean",
		default: false,
	},
	collapsedOnMobile: {
		type: "boolean",
		default: false,
	},
	hasFAQSchema: {
		type: "boolean",
		default: false,
	},
	titleColor: {
		type: "string",
		default: "",
	},
	titleLinkColor: {
		type: "string",
		default: "",
	},
	panelTitle: {
		type: "string",
		default: "",
	},
	newBlockPosition: {
		type: "string",
		default: "none", //changes into above/below depending on which button is clicked
	},
	titleTag: {
		type: "string",
		default: "p",
	},
	preventCollapse: {
		type: "boolean",
		default: false,
	},
	toggleLocation: {
		type: "string",
		default: "right",
	},
	toggleColor: {
		type: "string",
		default: "#000000",
	},
	toggleIcon: {
		type: "string",
		default: "chevron", //valid icons: chevron, plus, none
	},
	toggleID: {
		type: "string",
		default: "",
	},
	useToggleInToC: {
		type: "boolean",
		default: false,
	},
	border: {
		type: "boolean",
		default: true,
	},
	showOnlyOne: {
		type: "boolean",
		default: false,
	},
	defaultOpen: {
		type: "boolean",
		default: false,
	},
};

function ContentTogglePanel(props) {
	// Mirrors block.php: a collapsed panel still starts open when it is the
	// "Default Open" panel.
	const [showPanel, setPanelStatus] = useState(
		!props.attributes.collapsed || props.attributes.defaultOpen,
	);
	const blockProps = useBlockProps();

	const styleClipboard = createStyleClipboard(
		"ub_content_toggle_panel_copied_style",
		["theme", "titleColor", "titleLinkColor", "toggleColor"],
	);

	const {
		attributes: {
			theme,
			titleColor,
			titleLinkColor,
			panelTitle,
			collapsed,
			collapsedOnMobile,
			defaultOpen,
			hasFAQSchema,
			titleTag,
			preventCollapse,
			toggleLocation,
			toggleColor,
			toggleIcon,
			toggleID,
			useToggleInToC,
			border,
			showOnlyOne,
			parentID,
		},
		setAttributes,
		removeBlock,
		block,
		blockParent,
		blockParentId,
		updateBlockAttributes,
		selectBlock,
		proSaveStyledControl,
	} = props;

	const toggleIconPositions = {
		left: __("Left", "ultimate-blocks"),
		right: __("Right", "ultimate-blocks"),
	};

	// @deprecated
	// if (parentID === "" || parentID !== blockParentId) {
	// 	setAttributes({ parentID: blockParentId });
	// }

	useEffect(() => {
		if (blockParent?.attributes?.titleLinkColor === "invalid") {
			setPanelStatus(true);
		}
	}, []);

	useEffect(() => {
		setPanelStatus(!collapsed || defaultOpen);
	}, [collapsed, defaultOpen]);

	const panels = blockParent?.innerBlocks ?? [];

	const availablePanels = panels.map((panel, index) => {
		return {
			value: panel.clientId,
			label: `Panel ${index + 1}`,
		};
	});

	const defaultOpenOptions = [
		{ value: "none", label: __("None", "ultimate-blocks") },
		...availablePanels,
	];

	return (
		<div {...blockProps}>
			<InspectorControls group="settings">
				<PanelBody title={__("Title", "ultimate-blocks")} initialOpen={false}>
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={__("Title tag", "ultimate-blocks")}
						options={TITLE_TAG_OPTIONS}
						value={titleTag}
						onChange={(titleTag) => {
							setAttributes({ titleTag });
							if (titleTag === "p" && useToggleInToC) {
								setAttributes({ useToggleInToC: false });
							}
						}}
					/>
				</PanelBody>
				<PanelBody
					title={__("Open / Close behavior", "ultimate-blocks")}
					initialOpen={false}
				>
					<div className="ub-content-toggle-behavior-controls">
					{blockParent && //compatibility with v 2.0.0
						!blockParent.attributes.individualCollapse &&
						!collapsedOnMobile && (
							<ToggleControl
								__nextHasNoMarginBottom
								label={__("Only one panel open at a time", "ultimate-blocks")}
								help={__(
									"Opening a panel closes the others.",
									"ultimate-blocks",
								)}
								checked={showOnlyOne}
									onChange={() => {
										setAttributes({ showOnlyOne: !showOnlyOne });
										if (!showOnlyOne) {
											setAttributes({
												collapsed: false,
												preventCollapse: false,
												collapsedOnMobile: false,
											});
										}
									}}
							/>
						)}
					{!preventCollapse && (
						<>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__("Starts closed", "ultimate-blocks")}
								help={__(
									"The panel is closed when the page loads.",
									"ultimate-blocks",
								)}
								checked={collapsed}
									onChange={() => {
										setAttributes({ collapsed: !collapsed });

										if (!collapsed) {
											setAttributes({ preventCollapse: false });
										}
									}}
							/>
							{/* every panel sets its own state when they are set one by one */}
							{collapsed && !blockParent?.attributes?.individualCollapse && (
								<SelectControl
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									label={__("Panel that starts open", "ultimate-blocks")}
									options={defaultOpenOptions}
									value={
										panels.find((panel) => panel?.attributes?.defaultOpen)
											?.clientId ?? "none"
									}
									onChange={(newId) => {
										panels.forEach((panel) => {
											if (panel.clientId === newId) {
												updateBlockAttributes(panel.clientId, {
													defaultOpen: true,
												});
											} else {
												updateBlockAttributes(panel.clientId, {
													defaultOpen: false,
												});
											}
										});
									}}
								/>
							)}
							{!showOnlyOne && (
								<ToggleControl
									__nextHasNoMarginBottom
									label={__("Collapsed on mobile", "ultimate-blocks")}
									help={__(
										"On phones the panel starts closed.",
										"ultimate-blocks",
									)}
									checked={collapsedOnMobile}
										onChange={() => {
											setAttributes({ collapsedOnMobile: !collapsedOnMobile });
											if (!collapsedOnMobile) {
												setAttributes({ showOnlyOne: false });
											}
										}}
								/>
							)}
						</>
					)}
					{blockParent && //compatibility with v 2.0.0
						!blockParent.attributes.individualCollapse &&
						!collapsed &&
						!collapsedOnMobile &&
						!showOnlyOne && (
							<ToggleControl
								__nextHasNoMarginBottom
								label={__("Prevent collapse", "ultimate-blocks")}
								help={__(
									"The panel stays open and visitors can't close it.",
									"ultimate-blocks",
								)}
								checked={preventCollapse}
								onChange={() =>
									setAttributes({ preventCollapse: !preventCollapse })
								}
							/>
						)}
					</div>
				</PanelBody>
				<PanelBody title={__("FAQ Schema")} initialOpen={false}>
					<ToggleControl
						__nextHasNoMarginBottom
						label={__("Enable FAQ Schema")}
						help={__(
							"Adds FAQ structured data so search engines can read the panels as questions and answers.",
							"ultimate-blocks",
						)}
						checked={hasFAQSchema}
						onChange={() => setAttributes({ hasFAQSchema: !hasFAQSchema })}
					/>
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="color">
				<ColorSettings
					attrKey="theme"
					label={__("Title Background", "ultimate-blocks")}
				/>
				<ColorSettings
					attrKey="titleColor"
					label={__("Title Text", "ultimate-blocks")}
				/>
				<ColorSettings
					attrKey="titleLinkColor"
					label={__("Title Link", "ultimate-blocks")}
				/>
				<ColorSettings
					attrKey="toggleColor"
					label={__("Toggle Icon", "ultimate-blocks")}
				/>
			</InspectorControls>
			<InspectorControls group="styles">
				{proSaveStyledControl ? (
					proSaveStyledControl
				) : (
					<SavedStylesInspector
						attributes={props.attributes}
						setAttribute={(allAttrs) => {
							const { panelTitle, ...attrs } = allAttrs;

							// update block and its innerblock panel attributes
							setAttributes(attrs);
						}}
						attributesToSave={(() => {
							const excludeList = ["index", "parent", "parentID"];

							return Object.keys(props.attributes).filter((key) => {
								return (
									Object.prototype.hasOwnProperty.call(props.attributes, key) &&
									!excludeList.includes(key)
								);
							});
						})()}
						previewAttributeCallback={(attr) => {
							// eslint-disable-next-line no-unused-vars
							const { parent, parentID, ...rest } = attr;
							return rest;
						}}
						previewElementCallback={(el) => el}
						previewBlockType={"ub/content-toggle-panel-block-preview"}
					/>
				)}
				<PanelBody
					title={__("Toggle Icon", "ultimate-blocks")}
					initialOpen={false}
				>
					<div className="ub-content-toggle-behavior-controls">
						<ToggleGroupControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							isBlock
							label={__("Icon", "ultimate-blocks")}
							value={toggleIcon}
							onChange={(value) => setAttributes({ toggleIcon: value })}
						>
							<ToggleGroupControlOption
								value="none"
								label={__("None", "ultimate-blocks")}
							/>
							<ToggleGroupControlOptionIcon
								value="chevron"
								icon={chevronDown}
								label={__("Chevron", "ultimate-blocks")}
							/>
							<ToggleGroupControlOptionIcon
								value="plus"
								icon={plus}
								label={__("Plus", "ultimate-blocks")}
							/>
						</ToggleGroupControl>
						{toggleIcon !== "none" && (
							<ToggleGroupControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								isBlock
								label={__("Position", "ultimate-blocks")}
								value={toggleLocation}
								onChange={(value) => setAttributes({ toggleLocation: value })}
							>
								{Object.keys(toggleIconPositions).map((p) => (
									<ToggleGroupControlOption
										key={p}
										value={p}
										label={toggleIconPositions[p]}
									/>
								))}
							</ToggleGroupControl>
						)}
					</div>
				</PanelBody>
				<PanelBody
					title={__("Dimension Settings", "ultimate-blocks")}
					initialOpen={false}
				>
					<SpacingSizesControl
						allowReset={true}
						label={__("Padding", "ultimate-blocks")}
						values={blockParent?.attributes?.padding}
						sides={["top", "right", "bottom", "left"]}
						onChange={(newValue) => {
							updateBlockAttributes(blockParent?.clientId, {
								padding: newValue,
							});
						}}
					/>
					<SpacingSizesControl
						minimumCustomValue={-Infinity}
						allowReset={true}
						label={__("Margin", "ultimate-blocks")}
						values={blockParent?.attributes?.margin}
						sides={["top", "right", "bottom", "left"]}
						onChange={(newValue) => {
							updateBlockAttributes(blockParent?.clientId, {
								margin: newValue,
							});
						}}
					/>
				</PanelBody>
			</InspectorControls>
			<InspectorAdvancedControls>
				{!useToggleInToC && (
					<>
						<PanelRow>
							<p>{__("Panel ID")}</p>
							<input
								type="text"
								value={toggleID}
								onChange={(e) => setAttributes({ toggleID: e.target.value })}
							/>
						</PanelRow>
						<p class="ub-custom-id-input">
							{__(
								"Enter a word or two — without spaces — to make a unique web address just for this block, called an “anchor.” Then, you’ll be able to link directly to this section of your page.",
							)}
							<a
								href="https://wordpress.org/support/article/page-jumps/"
								target="_blank"
								rel="external noreferrer noopener"
							>
								{__("Learn more about anchors")}
								<span class="components-visually-hidden">
									{__(" (opens in a new tab)")}
								</span>
								<span class="dashicons-before dashicons-external" />
							</a>
						</p>
					</>
				)}
				{titleTag !== "p" && (
					<PanelRow>
						<p>{__("Use this panel in the Table of Contents")}</p>
						<ToggleControl
							checked={useToggleInToC}
							onChange={() => {
								setAttributes({ useToggleInToC: !useToggleInToC });
							}}
						/>
					</PanelRow>
				)}
			</InspectorAdvancedControls>
			<BlockControls>
				<GenericStyleControl
					attributes={props.attributes}
					setAttributes={setAttributes}
					clipboard={styleClipboard}
					blockName="Accordion Panel"
				/>
			</BlockControls>
			<div
				className={`wp-block-ub-content-toggle-accordion`}
				style={{
					...(() => {
						const panelBorder = blockParent?.attributes?.panelBorder;
						if (panelBorder && Object.keys(panelBorder).length > 0) {
							const borderCSS = getBorderCSS(panelBorder);
							return {
								borderTop: getSingleSideBorderValue(borderCSS, "top"),
								borderRight: getSingleSideBorderValue(borderCSS, "right"),
								borderBottom: getSingleSideBorderValue(borderCSS, "bottom"),
								borderLeft: getSingleSideBorderValue(borderCSS, "left"),
							};
						}
						return { borderColor: theme };
					})(),
					borderTopLeftRadius:
						blockParent?.attributes?.panelBorderRadius?.topLeft,
					borderTopRightRadius:
						blockParent?.attributes?.panelBorderRadius?.topRight,
					borderBottomLeftRadius:
						blockParent?.attributes?.panelBorderRadius?.bottomLeft,
					borderBottomRightRadius:
						blockParent?.attributes?.panelBorderRadius?.bottomRight,
				}}
			>
				<div className="wp-block-ub-content-toggle-accordion-inner">
					<div
						className="wp-block-ub-content-toggle-accordion-title-wrap"
						style={{ backgroundColor: theme }}
					>
						<RichText
							tagName={titleTag}
							style={{
								color: titleColor,
								// Same variable block.php sets, read by `> a` in style.scss.
								"--ub-content-toggle-title-link-color": titleLinkColor || undefined,
							}}
							className={`wp-block-ub-content-toggle-accordion-title ub-accordion-title-${blockParentId}`}
							value={panelTitle}
							allowedFormats={["core/bold", "core/italic", "core/link"]}
							onChange={(value) => setAttributes({ panelTitle: value })}
							placeholder={__("Panel Title")}
							keepPlaceholderOnFocus={true}
							unstableOnFocus={() => {
								setPanelStatus(true);
							}}
						/>
						{toggleIcon !== "none" && (
							<div
								className={
									"wp-block-ub-content-toggle-accordion-toggle-wrap " +
									toggleLocation
								}
								style={{ color: toggleColor }}
							>
								<span
									onClick={() => setPanelStatus(!showPanel)}
									className={`wp-block-ub-content-toggle-accordion-state-indicator ${
										icons[toggleIcon] ? icons[toggleIcon] : ""
									} ${showPanel ? "open" : ""}`}
								/>
								<div className="wp-block-ub-content-toggle-accordion-toggle-location">
									<span
										title={__("Switch toggle location", "ultimate-blocks")}
										onClick={() =>
											setAttributes({
												toggleLocation:
													toggleLocation === "left" ? "right" : "left",
											})
										}
										className="dashicons dashicons-leftright"
									/>
								</div>
							</div>
						)}
					</div>
					{showPanel && (
						<div className="wp-block-ub-content-toggle-accordion-content-wrap">
							<InnerBlocks
								templateLock={false}
								template={[
									["core/paragraph", { placeholder: __("Panel content") }],
								]}
							/>
						</div>
					)}
				</div>
				<div className="wp-block-ub-content-toggle-accordion-controls-top">
					<span
						title={__("Insert New Toggle Above")}
						onClick={() => setAttributes({ newBlockPosition: "above" })}
					>
						<Icon icon={plus} size={20} />
					</span>
					<span
						title={__("Delete This Toggle")}
						onClick={() => removeBlock(block.clientId)}
					>
						<Icon icon={closeSmall} size={20} />
					</span>
				</div>
				<div className="wp-block-ub-content-toggle-accordion-controls-bottom">
					<span
						title={__("Insert New Toggle Below")}
						onClick={() => setAttributes({ newBlockPosition: "below" })}
					>
						<Icon icon={plus} size={20} />
					</span>
				</div>
			</div>
		</div>
	);
}

registerBlockType("ub/content-toggle-panel", {
	title: __("Content Toggle Panel"),
	parent: ["ub/content-toggle"],
	icon: icon,
	category: "ultimateblocks",
	attributes,
	supports: {
		inserter: false,
		reusable: false,
	},

	edit: compose([
		withSelect((select, ownProps) => {
			const { getBlock, getBlockRootClientId } =
				select("core/block-editor") || select("core/editor");
			const { clientId } = ownProps;

			return {
				block: getBlock(clientId),
				blockParentId: getBlockRootClientId(clientId),
			};
		}),
		withDispatch((dispatch) => {
			const { updateBlockAttributes, removeBlock, selectBlock } =
				dispatch("core/block-editor") || dispatch("core/editor");

			return { updateBlockAttributes, removeBlock, selectBlock };
		}),
	])(ContentTogglePanel),
	save(props) {
		const { theme, collapsed, titleColor, panelTitle, index, parentID } =
			props.attributes;
		const classNamePrefix = "wp-block-ub-content-toggle";
		return (
			<div
				style={{ borderColor: theme }}
				className={`${classNamePrefix}-accordion`}
			>
				<div
					aria-expanded={collapsed}
					tabIndex={0}
					aria-controls={`ub-content-toggle-panel-${index}-${parentID}`}
					className={`${classNamePrefix}-accordion-title-wrap`}
					style={{ backgroundColor: theme }}
				>
					<RichText.Content
						tagName="span"
						className={`${classNamePrefix}-accordion-title`}
						style={{ color: titleColor || "inherit" }}
						value={panelTitle}
					/>
					<span
						className={
							`${classNamePrefix}-accordion-state-indicator dashicons dashicons-arrow-right-alt2 ` +
							(collapsed ? "" : "open")
						}
					/>
				</div>
				<div
					role="region"
					id={`ub-content-toggle-panel-${index}-${parentID}`}
					style={{
						height: collapsed ? "0" : "",
						paddingTop: collapsed ? "0" : "",
						paddingBottom: collapsed ? "0" : "",
					}}
					className={`${classNamePrefix}-accordion-content-wrap${
						collapsed ? " ub-hide" : ""
					}`}
				>
					<InnerBlocks.Content />
				</div>
			</div>
		);
	},

	deprecated: [
		{
			attributes,
			save: panel_version_1_1_9,
		},
	],
});

function PanelEdit(props) {
	const { block, blockParent, blockParentId } = useSelect(
		(select) => {
			const { getBlock, getBlockRootClientId } = select("core/block-editor");
			const { clientId } = props;
			const rootClientId = getBlockRootClientId(clientId);

			return {
				block: getBlock(clientId),
				blockParent: getBlock(rootClientId),
				blockParentId: rootClientId,
			};
		},
		[props.clientId]
	);
	const { updateBlockAttributes, removeBlock, selectBlock } =
		useDispatch("core/block-editor");

	return (
		<ContentTogglePanel
			{...props}
			block={block}
			blockParent={blockParent}
			blockParentId={blockParentId}
			updateBlockAttributes={updateBlockAttributes}
			removeBlock={removeBlock}
			selectBlock={selectBlock}
		/>
	);
}

registerBlockType(metadata.name, {
	...metadata,
	icon,
	edit: PanelEdit,
	save: () => <InnerBlocks.Content />,
});

// only register the preview block if the pro version is not active
if (!ProManager.proStatus()) {
	// block for preview purposes
	registerBlockType("ub/content-toggle-panel-block-preview", {
		title: __("Content Toggle Panel Preview - Internal Use", "ultimate-blocks"),
		icon,
		category: "ultimateblocks",
		attributes,
		supports: {
			inserter: false,
			reusable: false,
		},
		edit: PanelEdit,
		save: () => null,
	});
}
