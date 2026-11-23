import { isEmpty } from "lodash";
import Inspector from "./inspector";
import { useEffect, useState } from "react";
import GenericStyleControl, {
	createStyleClipboard,
} from "$Inc/components/GenericStyleControl";
import {
	upgradeButtonLabel,
	getDescendantBlocks,
	objectsMatch,
	getParentBlock,
} from "../../../common";
import SavedStylesInspector from "$Inc/components/SavedStyles/SavedStylesInspector";

const objectsNewChange = (obj1, obj2) => {
	let diff = {};
	if (obj1 && obj2) {
		Object.keys(obj1).forEach((key) => {
			if (obj2.hasOwnProperty(key) && obj1[key] !== obj2[key]) {
				diff = Object.assign(diff, { [key]: obj2[key] });
			}
		});
		return diff;
	}
	return null;
};

import { __ } from "@wordpress/i18n";
import { chevronDown, plus } from "@wordpress/icons";
import { createBlock } from "@wordpress/blocks";

import {
	BlockControls,
	InnerBlocks,
	InspectorControls,
	useBlockProps,
	BlockAlignmentControl,
	__experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
	__experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients,
} from "@wordpress/block-editor";
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	Button,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
} from "@wordpress/components";

import { SpacingControlWithToolsPanel, BorderControl } from "../../components";
import { generateStyles, getSpacingCss } from "../../utils/styling-helpers";
import { TITLE_TAG_OPTIONS } from "./constants";

const INITIAL_STATE_HELP = {
	open: __("Every panel is open when the page loads.", "ultimate-blocks"),
	closed: __("Every panel is closed when the page loads.", "ultimate-blocks"),
	one: __("Only the panel you pick is open when the page loads.", "ultimate-blocks"),
	individual: __(
		"Select a panel to set whether it starts open or closed.",
		"ultimate-blocks",
	),
};
export function OldPanelContent(props) {
	const {
		attributes,
		setAttributes,
		className,
		isSelected,
		updateBlockAttributes,
		selectBlock,
		insertBlock,
		removeBlock,
		selectedBlock,
		parentOfSelectedBlock,
		block,
		replaceBlock,
	} = props;
	//withState({ oldArrangement: "", mainBlockSelected: true }),

	const [oldArrangement, setOldArrangement] = useState("");
	const [mainBlockSelected, toggleMainBlockSelected] = useState(true);

	const { collapsed, theme, titleColor } = attributes;

	const panels = props.block.innerBlocks;

	const newArrangement = JSON.stringify(
		panels.map((panel) => panel.attributes.index),
	);

	const newBlockTarget = panels.filter(
		(panel) => panel.attributes.newBlockPosition !== "none",
	);

	const onThemeChange = (value) => {
		setAttributes({ theme: value });

		panels.forEach((panel) =>
			updateBlockAttributes(panel.clientId, { theme: value }),
		);
	};

	const onTitleColorChange = (value) => {
		setAttributes({ titleColor: value });

		panels.forEach((panel) =>
			updateBlockAttributes(panel.clientId, { titleColor: value }),
		);
	};

	const onCollapseChange = () => {
		setAttributes({ collapsed: !collapsed });
		panels.forEach((panel) =>
			updateBlockAttributes(panel.clientId, {
				collapsed: !panel.attributes.collapsed,
			}),
		);
	};

	//Detect if one of the child blocks has received a command to add another child block
	if (newBlockTarget.length > 0) {
		const { index, newBlockPosition } = newBlockTarget[0].attributes;
		insertBlock(
			createBlock("ub/content-toggle-panel", {
				theme: theme,
				collapsed: collapsed,
				titleColor: titleColor,
			}),
			newBlockPosition === "below" ? index + 1 : index,
			block.clientId,
		);
		updateBlockAttributes(newBlockTarget[0].clientId, {
			newBlockPosition: "none",
		});
	}

	//Fix indexes in case of rearrangments

	if (newArrangement !== oldArrangement) {
		if (oldArrangement === "[0]" && newArrangement === "[]") {
			removeBlock(block.clientId);
		} else {
			panels.forEach((panel, i) =>
				updateBlockAttributes(panel.clientId, {
					index: i,
					parent: block.clientId,
				}),
			);
			setOldArrangement(newArrangement);
		}
	} else if (mainBlockSelected) {
		const childBlocks = panels
			.filter((block) => block.name === "ub/content-toggle-panel")
			.map((panels) => panels.clientId);
		if (
			selectedBlock !== block.clientId &&
			childBlocks.includes(selectedBlock)
		) {
			toggleMainBlockSelected(false);
		}
	} else {
		selectBlock(parentOfSelectedBlock);
		toggleMainBlockSelected(true);
	}

	return (
		<>
			{isSelected && (
				<Inspector
					{...{
						attributes,
						onThemeChange,
						onCollapseChange,
						onTitleColorChange,
					}}
				/>
			)}
			<div className={className}>
				<button
					onClick={() => {
						replaceBlock(
							block.clientId,
							createBlock(
								"ub/content-toggle-block",
								{ collapsed, theme, titleColor },
								block.innerBlocks.map((innerBlock, i) =>
									createBlock(
										"ub/content-toggle-panel-block",
										{
											index: i,
											theme,
											collapsed,
											titleColor,
											panelTitle: innerBlock.attributes.panelTitle,
											newBlockPosition: innerBlock.attributes.newBlockPosition,
										},
										innerBlock.innerBlocks,
									),
								),
							),
						);
					}}
				>
					{upgradeButtonLabel}
				</button>
				<InnerBlocks
					template={[["ub/content-toggle-panel"]]} //initial content
					templateLock={false}
					allowedBlocks={["ub/content-toggle-panel"]}
				/>
			</div>
		</>
	);
}

const oldColorDefaults = {
	theme: "#e11b4c",
	titleColor: "#ffffff",
};

export function PanelContent(props) {
	const panels = props.block.innerBlocks;
	const {
		attributes: {
			collapsed,
			collapsedOnMobile,
			individualCollapse,
			theme,
			titleColor,
			titleLinkColor,
			blockID,
			hasFAQSchema,
			titleTag,
			preventCollapse,
			toggleLocation,
			toggleColor,
			toggleIcon,
			border,
			showOnlyOne,
			padding,
			margin,
			align,
			panelBorderRadius,
			panelBorder,
		},
		setAttributes,
		className,
		isSelected,
		updateBlockAttributes,
		selectBlock,
		insertBlock,
		insertBlocks,
		removeBlock,
		selectedBlock,
		block,
		getClientIdsWithDescendants,
		getBlock,
		rootBlockClientId,
		ColorControlProvider,
		SearchElem,
		SearchInspectorControl,
		proColorSettings,
		proSaveStyledControl,
	} = props;
	const blockProps = useBlockProps({
		className: !isEmpty(align) ? "align" + align : "",
	});
	const colorGradientSettings = useMultipleOriginColorsAndGradients();

	const styleClipboard = createStyleClipboard(
		"ub_content_toggle_copied_style",
		[
			"theme",
			"titleColor",
			"titleLinkColor",
			"toggleColor",
			"padding",
			"margin",
			"align",
			"panelBorderRadius",
			"panelBorder",
		],
	);

	const newArrangement = panels.map((panel) => panel.attributes.index);

	useEffect(() => {
		//first initializations
		const { block, attributes, setAttributes } = props;
		const { theme, titleColor, showOnlyOne, collapsedOnMobile } = attributes;

		if (!props.attributes.blockID) {
			let initialColors = {};
			if (!theme) {
				initialColors.theme = "#f1f1f1";
			}
			if (!titleColor) {
				initialColors.titleColor = "#000000";
			}

			setAttributes(initialColors);
		} else if (block.innerBlocks.length) {
			Object.assign(props.attributes, {
				theme: block.innerBlocks[0].attributes.theme,
				titleColor: block.innerBlocks[0].attributes.titleColor,
			});
		}

		if (showOnlyOne && collapsedOnMobile) {
			setAttributes({ showOnlyOne: false });
			block.innerBlocks.forEach((panel) => {
				props.updateBlockAttributes(panel.clientId, {
					showOnlyOne: false,
				});
			});
		}

		//blockid initialization
		if (blockID === "") {
			setAttributes(
				Object.assign({ blockID: block.clientId }, newColorDefaults),
			);
		}

		//initialize variable for monitoring changes in child block attributes
		setOldAttributeValues(
			panels.map((panel) =>
				((
					{
						panelTitle,
						newBlockPosition,
						index,
						parent,
						parentID,
						toggleID,
						...others
					} = panel.attributes,
				) => others)(),
			),
		);
	}, []);
	useEffect(() => {
		const rootBlock = getParentBlock(rootBlockClientId, "core/block");
		if (!rootBlock) {
			setAttributes({ blockID: block.clientId });
		}
	}, [block?.clientId]);

	const [oldArrangement, setOldArrangement] = useState([]);
	const [oldAttributeValues, setOldAttributeValues] = useState([]);
	const [mainBlockSelected, setMainBlockSelectStatus] = useState(true);
	const [firstPanelInserted, setFirstPanelInsertStatus] = useState(false);

	const newBlockTarget = panels.filter(
		(panel) => panel.attributes.newBlockPosition !== "none",
	);

	const onThemeChange = (value) => {
		setAttributes({ theme: value });

		panels.forEach((panel) =>
			updateBlockAttributes(panel.clientId, { theme: value }),
		);
	};

	const onTitleColorChange = (value) => {
		setAttributes({ titleColor: value });

		panels.forEach((panel) =>
			updateBlockAttributes(panel.clientId, { titleColor: value }),
		);
	};

	const onLinkColorChange = (value) => {
		setAttributes({ titleLinkColor: value });
		panels.forEach((panel) =>
			updateBlockAttributes(panel.clientId, { titleLinkColor: value }),
		);
	};
	const onToggleColorChange = (value) => {
		setAttributes({ toggleColor: value });
		panels.forEach((panel) =>
			updateBlockAttributes(panel.clientId, { toggleColor: value }),
		);
	};
	const onPreventCollapseChange = () => {
		setAttributes({ preventCollapse: !preventCollapse });
		panels.forEach((panel) =>
			updateBlockAttributes(panel.clientId, {
				preventCollapse: !panel.attributes.preventCollapse,
				...(!preventCollapse && { collapsed: false }),
			}),
		);
	};

	const newColorDefaults = {
		theme: "#f1f1f1",
		titleColor: "#000000",
	};

	const toggleIconPositions = {
		left: __("Left", "ultimate-blocks"),
		right: __("Right", "ultimate-blocks"),
	};

	//Detect if one of the child blocks has received a command to add another child block
	let presets = Object.assign(
		{},
		blockID ? oldColorDefaults : newColorDefaults,
	);

	useEffect(() => {
		if (newBlockTarget.length > 0) {
			const { index, newBlockPosition } = newBlockTarget[0].attributes;
			insertBlock(
				createBlock("ub/content-toggle-panel-block", {
					theme: theme || presets.theme,
					collapsed: showOnlyOne ? true : collapsed,
					titleColor: titleColor || presets.titleColor,
					titleTag,
					preventCollapse,
					toggleLocation,
					toggleColor,
					toggleIcon,
					border,
					showOnlyOne,
				}),
				newBlockPosition === "below" ? index + 1 : index,
				block.clientId,
			);
			updateBlockAttributes(newBlockTarget[0].clientId, {
				newBlockPosition: "none",
			});
		}
	}, [newBlockTarget]);

	if (newArrangement.length === 0) {
		if (oldArrangement.length > 0) {
			removeBlock(block.clientId);
			return null; //prevent block from being rendered to prevent error
		} else {
			if (!firstPanelInserted) {
				setFirstPanelInsertStatus(true);
				setTimeout(() => {
					const defaultPanelSettings = {
						theme: newColorDefaults.theme,
						collapsed,
						titleColor: newColorDefaults.titleColor,
						titleLinkColor,
						hasFAQSchema,
						toggleLocation,
						toggleColor,
						toggleIcon,
						border,
						showOnlyOne,
					};

					insertBlocks(
						[
							//needs to be created separately to prevent duplicates
							createBlock(
								"ub/content-toggle-panel-block",
								defaultPanelSettings,
							),
						],
						0,
						block.clientId,
						false,
					);
				}, 40);
			}

			if (
				JSON.stringify(oldArrangement) !==
				JSON.stringify(Array.from(Array(panels.length).keys()))
			) {
				setOldArrangement(Array.from(Array(panels.length).keys()));
			}
		}
	}

	if (!newArrangement.every((item, i) => item === oldArrangement[i])) {
		//Fix indexes in case of rearrangments
		if (newArrangement.length < oldArrangement.length && showOnlyOne) {
			if (!panels.map((p) => p.attributes.collapsed).includes(false)) {
				oldArrangement.forEach((i) => {
					if (!newArrangement.includes(i)) {
						updateBlockAttributes(panels[Math.max(0, i - 1)].clientId, {
							collapsed: false,
						});
					}
				});
			}
		}
		panels.forEach((panel, i) =>
			updateBlockAttributes(panel.clientId, {
				index: i,
				// @deprecated
				// parent: block.clientId,
			}),
		);
		setOldArrangement(newArrangement);
	} else if (mainBlockSelected) {
		if (
			selectedBlock !== block.clientId &&
			getDescendantBlocks(props.block)
				.map((d) => d.clientId)
				.includes(selectedBlock)
		) {
			setMainBlockSelectStatus(false);
		}
	} else {
		const childBlocks = props.block.innerBlocks
			.filter((block) => block.name === "ub/content-toggle-panel-block")
			.map((panels) => panels.clientId);

		if (childBlocks.includes(selectedBlock) && !wp.data.useDispatch) {
			//useDispatch is only present in Gutenberg v5.9, together with clickthrough selection feature
			setMainBlockSelectStatus(true);
			selectBlock(props.block.clientId);
		}
	}

	if (oldArrangement.length > 0) {
		let newAttributeValues = panels.map((panel) =>
			((
				{
					panelTitle,
					newBlockPosition,
					index,
					parent,
					parentID,
					toggleID,
					...others
				} = panel.attributes,
			) => others)(),
		);

		if (newAttributeValues.length > 0) {
			if (newAttributeValues.length === oldAttributeValues.length) {
				if (
					!newAttributeValues.every((entry, i) =>
						objectsMatch(entry, oldAttributeValues[i]),
					)
				) {
					//add exception for changing collapsed to matching for index when showOnlyOne is changed to true
					//when showOnlyOne is true and collapsed state is changed in one of the panels,

					const changedPanel = block.innerBlocks
						.map((innerBlock) => innerBlock.clientId)
						.indexOf(selectedBlock);

					const newChange = objectsNewChange(
						oldAttributeValues[changedPanel],
						newAttributeValues[changedPanel],
					);

					if (
						changedPanel > -1 && //for preventing errors in gutenberg 8
						newAttributeValues[changedPanel].showOnlyOne
					) {
						//if value of collapsed is changed for a panel via inspector panel and showonlyone is active,
						//value of collapsed in all other panels should be automatically set to true

						panels.forEach((panel, i) => {
							updateBlockAttributes(
								panel.clientId,
								Object.assign(
									{},
									newChange,
									i !== changedPanel ? { collapsed: true } : null,
								),
							);
						});
						setAttributes(Object.assign({ collapsed: false }, newChange));
					} else if (
						newChange &&
						!(newChange.hasOwnProperty("collapsed") && individualCollapse)
					) {
						panels.forEach((panel) => {
							updateBlockAttributes(panel.clientId, newChange);
						});
						setAttributes(newChange);
					}
					setOldAttributeValues(newAttributeValues);
				}
			} else {
				setOldAttributeValues(newAttributeValues);
			}
		}
	}

	const availablePanels = panels?.map((panel, index) => {
		return {
			value: panel.clientId,
			label: `Panel ${index + 1}`,
		};
	});

	//the same settings are kept on the block and on every panel
	const setOnAllPanels = (newAttributes) => {
		setAttributes(newAttributes);
		panels.forEach((panel) =>
			updateBlockAttributes(panel.clientId, newAttributes),
		);
	};

	const defaultOpenPanelId =
		panels.find((panel) => panel?.attributes?.defaultOpen)?.clientId ??
		panels[0]?.clientId;

	const setDefaultOpenPanel = (openId) => {
		panels.forEach((panel) =>
			updateBlockAttributes(panel.clientId, {
				defaultOpen: panel.clientId === openId,
			}),
		);
	};

	//the old toggles, read as one choice
	let initialState = "open";
	if (individualCollapse) {
		initialState = "individual";
	} else if (
		collapsed &&
		panels.some((panel) => panel?.attributes?.defaultOpen)
	) {
		initialState = "one";
	} else if (collapsed) {
		initialState = "closed";
	}

	const initialStateOptions = [
		{ value: "open", label: __("All panels open", "ultimate-blocks") },
		{ value: "closed", label: __("All panels closed", "ultimate-blocks") },
		{ value: "one", label: __("One panel open", "ultimate-blocks") },
		{ value: "individual", label: __("Set on each panel", "ultimate-blocks") },
	];

	const onInitialStateChange = (value) => {
		//the panels read this one from the accordion itself
		setAttributes({ individualCollapse: value === "individual" });

		if (value === "individual") {
			//each panel keeps the state the first one had, then gets its own
			//toggle in the panel settings
			setOnAllPanels({
				showOnlyOne: false,
				collapsed: panels[0]?.attributes?.collapsed ?? collapsed,
			});
			setDefaultOpenPanel(null);
			return;
		}

		setOnAllPanels({
			collapsed: value !== "open",
			//only open panels can be kept from closing
			...(value !== "open" && { preventCollapse: false }),
		});
		setDefaultOpenPanel(value === "one" ? defaultOpenPanelId : null);
	};

	const onShowOnlyOneChange = () => {
		setOnAllPanels({ showOnlyOne: !showOnlyOne });

		if (showOnlyOne) {
			//value before setAttributes still in use
			setOnAllPanels({ collapsed: false, preventCollapse: false });
		} else {
			//only the first panel starts open, a panel picked earlier would
			//open as well
			panels.forEach((panel, i) =>
				updateBlockAttributes(panel.clientId, {
					collapsed: i !== 0,
					defaultOpen: false,
				}),
			);
		}
	};

	const onCollapsedOnMobileChange = () => {
		setOnAllPanels({
			collapsedOnMobile: !collapsedOnMobile,
			...(!collapsedOnMobile && { showOnlyOne: false }),
		});
	};
	const paddingObj = getSpacingCss(padding);
	const marginObj = getSpacingCss(margin);
	const styles = {
		paddingTop: paddingObj?.top,
		paddingRight: paddingObj?.right,
		paddingBottom: paddingObj?.bottom,
		paddingLeft: paddingObj?.left,
		marginTop: marginObj?.top,
		marginRight: marginObj?.right,
		marginBottom: marginObj?.bottom,
		marginLeft: marginObj?.left,
	};
	const finalProColorSettings = proColorSettings
		? [...proColorSettings(panels, updateBlockAttributes)]
		: [];
	return (
		<div {...blockProps}>
			<BlockControls group="block">
				<BlockAlignmentControl
					value={align}
					controls={["full", "wide"]}
					onChange={(newAlign) => setAttributes({ align: newAlign })}
				/>
			</BlockControls>
			<BlockControls>
				<GenericStyleControl
					attributes={props.attributes}
					setAttributes={setAttributes}
					clipboard={styleClipboard}
					blockName="Accordions (UB)"
				/>
			</BlockControls>
			{isSelected && (
				<>
					<InspectorControls group="settings">
						<PanelBody title={__("Title", "ultimate-blocks")} initialOpen={false}>
							<SelectControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={__("Title tag", "ultimate-blocks")}
								help={__(
									"The HTML tag of every panel title. Headings show up in the page outline.",
									"ultimate-blocks",
								)}
								options={TITLE_TAG_OPTIONS}
								value={titleTag}
								onChange={(titleTag) => {
									setAttributes({ titleTag });
									panels.forEach((panel) =>
										updateBlockAttributes(panel.clientId, { titleTag }),
									);
								}}
							/>
						</PanelBody>
						<PanelBody
							title={__("Open / Close behavior", "ultimate-blocks")}
							initialOpen={false}
						>
							<div className="ub-content-toggle-behavior-controls">
								{!individualCollapse && (
									<ToggleControl
										__nextHasNoMarginBottom
										label={__("Only one panel open at a time", "ultimate-blocks")}
										help={__(
											"Opening a panel closes the others. The first panel starts open.",
											"ultimate-blocks",
										)}
										checked={showOnlyOne}
										onChange={onShowOnlyOneChange}
									/>
								)}
								{!showOnlyOne && (
									<SelectControl
										__next40pxDefaultSize
										__nextHasNoMarginBottom
										label={__("Initial state", "ultimate-blocks")}
										help={INITIAL_STATE_HELP[initialState]}
										options={initialStateOptions}
										value={initialState}
										onChange={onInitialStateChange}
									/>
								)}
								{!showOnlyOne && initialState === "one" && (
									<SelectControl
										__next40pxDefaultSize
										__nextHasNoMarginBottom
										label={__("Panel that starts open", "ultimate-blocks")}
										options={availablePanels}
										value={defaultOpenPanelId}
										onChange={setDefaultOpenPanel}
									/>
								)}
								{!showOnlyOne && !individualCollapse && !preventCollapse && (
									<ToggleControl
										__nextHasNoMarginBottom
										label={__("Collapsed on mobile", "ultimate-blocks")}
										help={__(
											"On phones every panel starts closed, whatever the initial state says.",
											"ultimate-blocks",
										)}
										checked={collapsedOnMobile}
										onChange={onCollapsedOnMobileChange}
									/>
								)}
								{!collapsed &&
									!collapsedOnMobile &&
									!showOnlyOne &&
									!individualCollapse && (
										<ToggleControl
											__nextHasNoMarginBottom
											label={__("Prevent collapse", "ultimate-blocks")}
											help={__(
												"Panels stay open and visitors can't close them.",
												"ultimate-blocks",
											)}
											checked={preventCollapse}
											onChange={onPreventCollapseChange}
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
								onChange={() => {
									setAttributes({ hasFAQSchema: !hasFAQSchema });
									panels.forEach((panel) =>
										updateBlockAttributes(panel.clientId, {
											hasFAQSchema: !panel.attributes.hasFAQSchema,
										}),
									);
								}}
							/>
						</PanelBody>
					</InspectorControls>
					<InspectorControls group="styles">
						{proSaveStyledControl ? (
							proSaveStyledControl(panels, updateBlockAttributes)
						) : (
							<SavedStylesInspector
								attributes={props.attributes}
								setAttribute={(allAttrs) => {
									const { panelTitle, ...attrs } = allAttrs;

									// update block and its innerblock panel attributes
									setAttributes(attrs);

									if (panels && Array.isArray(panels)) {
										panels.forEach((panel) => {
											updateBlockAttributes(panel.clientId, attrs);
										});
									}
								}}
								attributesToSave={(() => {
									const excludeList = [
										"index",
										"parent",
										"parentID",
										"panelTitle",
										"blockID",
									];

									return Object.keys(props.attributes).filter((key) => {
										return (
											Object.prototype.hasOwnProperty.call(
												props.attributes,
												key,
											) && !excludeList.includes(key)
										);
									});
								})()}
								previewAttributeCallback={(attr) => {
									// eslint-disable-next-line no-unused-vars
									const { parent, parentID, blockID, ...rest } = attr;
									return rest;
								}}
								previewElementCallback={(el) => el}
							/>
						)}
						<InspectorControls group="color">
							<ColorGradientSettingsDropdown
								{...colorGradientSettings}
								enableAlpha
								panelId={block.clientId}
								title={__("Color Scheme")}
								settings={[
									{
										colorValue: theme,
										onColorChange: onThemeChange,
										label: __("Title Background", "ultimate-blocks"),
									},
									{
										colorValue: titleColor,
										onColorChange: onTitleColorChange,
										label: __("Title Text", "ultimate-blocks"),
									},
									{
										colorValue: titleLinkColor,
										onColorChange: onLinkColorChange,
										label: __("Title Link", "ultimate-blocks"),
									},
									{
										colorValue: toggleColor,
										onColorChange: onToggleColorChange,
										label: __("Toggle Icon", "ultimate-blocks"),
									},
									...finalProColorSettings.map((setting) => ({
										colorValue: setting.value,
										onColorChange: setting.onChange,
										label: setting.label,
									})),
								]}
							/>
							{ColorControlProvider && ColorControlProvider}
						</InspectorControls>
						<InspectorControls group="border">
							<BorderControl
								showDefaultBorder
								showDefaultBorderRadius
								attrBorderKey="panelBorder"
								attrBorderRadiusKey="panelBorderRadius"
								borderLabel={__("Panel Border", "ultimate-blocks")}
								borderRadiusLabel={__("Panel Border Radius", "ultimate-blocks")}
							/>
						</InspectorControls>
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
									onChange={(value) => setOnAllPanels({ toggleIcon: value })}
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
										onChange={(value) =>
											setOnAllPanels({ toggleLocation: value })
										}
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
					</InspectorControls>
					<InspectorControls group="dimensions">
						<SpacingControlWithToolsPanel
							showByDefault
							attrKey="padding"
							label={__("Padding", "ultimate-blocks")}
						/>
						<SpacingControlWithToolsPanel
							minimumCustomValue={-Infinity}
							showByDefault
							attrKey="margin"
							label={__("Margin", "ultimate-blocks")}
						/>
					</InspectorControls>
					{SearchInspectorControl && SearchInspectorControl}
				</>
			)}
			<div
				className={className}
				style={generateStyles(styles)}
				id={`ub-content-toggle-${blockID}`}
			>
				{SearchElem && SearchElem}
				<InnerBlocks
					templateLock={false}
					allowedBlocks={["ub/content-toggle-panel-block"]}
				/>
				<style
					dangerouslySetInnerHTML={{
						__html: `.ub-accordion-title-${blockID} a{
							color: ${titleLinkColor || "inherit"}
						}`,
					}}
				/>
			</div>
		</div>
	);
}
