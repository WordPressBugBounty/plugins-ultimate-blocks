import {
	horizontalTabIcon,
	verticalTabIcon,
	accordionIcon,
} from "../icons/icon";
import SavedStylesInspector from "$Inc/components/SavedStyles/SavedStylesInspector";
import {
	BorderControl,
	ColorSettings,
	CustomFontSizePicker,
	CustomToggleGroupControl,
	FontAppearanceControl,
	FontFamilyControl,
	SpacingControl,
	TabsPanelControl,
	UBSelectControl,
} from "../../components";
const { __ } = wp.i18n;
const { Component } = wp.element;
const { InspectorControls } = wp.blockEditor || wp.editor;
const {
	PanelBody,
	ToggleControl,
	RadioControl,
	TextControl,
	__experimentalToolsPanelItem: ToolsPanelItem,
} = wp.components;

/**
 * Create an Inspector Controls wrapper Component
 */
class Inspector extends Component {
	constructor(props) {
		super(props);
		this.state = { displayMode: "desktop" };
	}
	render() {
		const { displayMode } = this.state;
		const {
			attributes,
			setAttributes,
			ProGeneralControls,
			ProInspectorControls,
			showControls,
			editorActiveTab,
		} = this.props;
		const {
			activeTab,
			tabVertical,
			tabletTabDisplay,
			mobileTabDisplay,
			tabsTitle,
			tabsAnchor,
			useAnchors,
			tabStyle,
			showBorder,
			tabListLabel,
		} = attributes;

		//underlined tabs have no background, unless they turn into an accordion
		//on smaller screens
		const showTabBackground = !(
			tabStyle === "underline" &&
			![tabletTabDisplay, mobileTabDisplay].includes("accordion")
		);

		return (
			<>
				<InspectorControls group="settings">
					<PanelBody title={__("Tab Type")}>
						<RadioControl
							selected={tabStyle}
							options={["tabs", "pills", "underline"].map((a) => ({
								label: __(a),
								value: a,
							}))}
							onChange={(tabStyle) => setAttributes({ tabStyle })}
						/>
					</PanelBody>

					<PanelBody title={__("General", "ultimate-blocks")} initialOpen>
						{tabsTitle.length > 0 && (
							<UBSelectControl
								label={
									<span className="ub-tab-toggle-label-with-badge">
										<span>{__("Initial Open Tab")}</span>
										<span className="ub-tab-new-badge">{__("NEW")}</span>
									</span>
								}
								value={`${editorActiveTab ?? activeTab}`}
								options={tabsTitle.map((title, i) => ({
									label: title || `Tab ${i + 1}`,
									value: `${i}`,
								}))}
								onChange={(value) => {
									const index = parseInt(value, 10);
									setAttributes({ activeTab: index });
									if (showControls) showControls("tab-title", index);
								}}
							/>
						)}

						{/* called, not rendered as <ProGeneralControls />: pro defines it anew on every
						render, so as an element React would remount it each time */}
						{ProGeneralControls && ProGeneralControls()}
						<TextControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={__("Tabs label", "ultimate-blocks")}
							help={__(
								"Screen readers announce it before the tabs, for example \"Pricing plans\".",
								"ultimate-blocks",
							)}
							value={tabListLabel}
							onChange={(value) => setAttributes({ tabListLabel: value })}
						/>
					</PanelBody>

					<PanelBody title={__("Tab Anchors")} initialOpen={false}>
						<ToggleControl
							label={__("Use tab anchors")}
							checked={useAnchors}
							onChange={(useAnchors) => {
								setAttributes({
									useAnchors,
									tabsAnchor: useAnchors
										? Array(tabsTitle.length).fill("")
										: [],
								});
							}}
						/>
						{useAnchors && (
							<TextControl
								label={__("Anchor for current tab")}
								value={tabsAnchor[editorActiveTab ?? activeTab]}
								onChange={(newAnchor) => {
									const idx = editorActiveTab ?? activeTab;
									setAttributes({
										tabsAnchor: [
											...tabsAnchor.slice(0, idx),
											newAnchor.replace(/\s/g, ""),
											...tabsAnchor.slice(idx + 1),
										],
									});
								}}
								help={__(
									"Add an anchor text to let the contents of the active tab be accessed directly through a link",
								)}
							/>
						)}
					</PanelBody>
				</InspectorControls>
				<InspectorControls group="styles">
					<SavedStylesInspector
						attributes={(() => {
							/* eslint-disable no-unused-vars */
							const {
								blockID,
								// eslint-disable-next-line no-shadow
								activeTab,
								id,
								activeControl,
								// eslint-disable-next-line no-shadow
								tabsTitle,
								tabsTitleAlignment,
								...rest
							} = attributes;
							/* eslint-enable no-unused-vars */

							return rest;
						})()}
						setAttribute={(val) => {
							// back-compat for any styles generated before fix
							const { tabsTitle, tabsTitleAlignment, ...rest } = val;

							setAttributes(rest);
						}}
						previewAttributeCallback={(attr) => attr}
						previewElementCallback={(el) => {
							const isVertical = el.querySelector(".vertical-holder");

							if (!isVertical) {
								const horizontalTabs = Array.from(
									el.querySelectorAll(
										".wp-block-ub-tabbed-content-tabs-title .wp-block-ub-tabbed-content-tab-title-wrap",
									),
								);

								if (horizontalTabs.length > 0) {
									const tabAddButton = horizontalTabs.pop();
									tabAddButton.parentNode.removeChild(tabAddButton);
								}
							} else {
								const verticalTabs = Array.from(
									el.querySelectorAll(
										".wp-block-ub-tabbed-content-tabs-title-vertical-tab .wp-block-ub-tabbed-content-tab-title-vertical-wrap",
									),
								);

								if (verticalTabs.length > 0) {
									const verticalTabAddButton = verticalTabs.pop();
									verticalTabAddButton.parentNode.removeChild(
										verticalTabAddButton,
									);
								}

								const verticalTabHolder = el.querySelector(
									".vertical-tab-width",
								);

								if (verticalTabHolder) {
									verticalTabHolder.style.width = "fit-content";
								}
							}

							const tabContentContainer = el.querySelector(
								".block-editor-inner-blocks",
							);

							if (tabContentContainer) {
								tabContentContainer.innerHTML = `<p>${__(
									"Tab Content",
									"ultimate-blocks-pro",
								)}</p>`;
							}

							return el;
						}}
					/>
					<PanelBody title={__("Tab Layout")} initialOpen={false}>
						{/* CustomToggleGroupControl replaces ButtonGroup, deprecated since WP 6.8 (console: "wp.components.ButtonGroup is deprecated") */}
						{/* the controls of this panel sit in one column with an even gap */}
						<div style={{ display: "grid", gap: "16px" }}>
							<CustomToggleGroupControl
								isBlock
								label={__("Mode")}
								value={displayMode}
								onChange={(value) => this.setState({ displayMode: value })}
								options={[
									{
										value: "desktop",
										icon: "desktop",
										label: __("Desktop"),
									},
									{
										value: "tablet",
										icon: "tablet",
										label: __("Tablet"),
									},
									{
										value: "mobile",
										icon: "smartphone",
										label: __("Mobile"),
									},
								]}
							/>
							{displayMode === "desktop" && (
								<CustomToggleGroupControl
									isBlock
									label={__("Tab Display")}
									value={tabVertical ? "vertical" : "horizontal"}
									onChange={(value) =>
										setAttributes({ tabVertical: value === "vertical" })
									}
									options={[
										{
											value: "horizontal",
											icon: horizontalTabIcon,
											label: __("Horizontal"),
										},
										{
											value: "vertical",
											icon: verticalTabIcon,
											label: __("Vertical"),
										},
									]}
								/>
							)}
							{displayMode === "tablet" && (
								<CustomToggleGroupControl
									isBlock
									label={__("Tablet Tab Display")}
									attributeKey="tabletTabDisplay"
									options={[
									{
										value: "horizontaltab",
										icon: horizontalTabIcon,
										label: __("Horizontal"),
									},
									{
										value: "verticaltab",
										icon: verticalTabIcon,
										label: __("Vertical"),
									},
									{
										value: "accordion",
										icon: accordionIcon,
										label: __("Accordion"),
									},
								]}
								/>
							)}
							{displayMode === "mobile" && (
								<CustomToggleGroupControl
									isBlock
									label={__("Mobile Tab Display")}
									attributeKey="mobileTabDisplay"
									options={[
									{
										value: "horizontaltab",
										icon: horizontalTabIcon,
										label: __("Horizontal"),
									},
									{
										value: "verticaltab",
										icon: verticalTabIcon,
										label: __("Vertical"),
									},
									{
										value: "accordion",
										icon: accordionIcon,
										label: __("Accordion"),
									},
								]}
								/>
							)}
						</div>
					</PanelBody>
					<PanelBody
						title={__("Dimension Settings", "ultimate-blocks")}
						initialOpen={false}
					>
						<SpacingControl
							showByDefault
							attrKey="padding"
							label={__("Padding", "ultimate-blocks")}
						/>
						<SpacingControl
							minimumCustomValue={-Infinity}
							showByDefault
							attrKey="margin"
							label={__("Margin", "ultimate-blocks")}
						/>
						<SpacingControl
							showByDefault
							sides={["all"]}
							attrKey="gap"
							label={__("Gap", "ultimate-blocks")}
						/>
						{!tabVertical && (
							<SpacingControl
								showByDefault
								sides={["all"]}
								attrKey="tabButtonsGap"
								label={__("Tab Spacing", "ultimate-blocks")}
							/>
						)}
						<SpacingControl
							showByDefault
							attrKey="tabButtonsPadding"
							label={__("Tab Padding", "ultimate-blocks")}
						/>
					</PanelBody>
				</InspectorControls>
				<InspectorControls group="typography">
					<CustomFontSizePicker
						attrKey="tabTitleFontSize"
						label={__("Tab Title Font Size", "ultimate-blocks")}
					/>
					<FontFamilyControl
						attrKey="tabTitleFontFamily"
						label={__("Tab Title Font Family", "ultimate-blocks")}
					/>
					<FontAppearanceControl
						attrKey="tabTitleFontAppearance"
						label={__("Tab Title Appearance", "ultimate-blocks")}
					/>
					<CustomFontSizePicker
						attrKey="contentFontSize"
						label={__("Content Font Size", "ultimate-blocks")}
					/>
					<FontFamilyControl
						attrKey="contentFontFamily"
						label={__("Content Font Family", "ultimate-blocks")}
					/>
					<FontAppearanceControl
						attrKey="contentFontAppearance"
						label={__("Content Appearance", "ultimate-blocks")}
					/>
				</InspectorControls>
				<InspectorControls group="color">
					<TabsPanelControl
						tabs={[
							{
								name: "normalState",
								title: __("Normal", "ultimate-blocks"),
								component: (
									<>
										{showTabBackground && (
											<ColorSettings
												attrKey="normalColor"
												label={__("Tab Background", "ultimate-blocks")}
											/>
										)}
										<ColorSettings
											attrKey="normalTitleColor"
											label={__("Tab Text", "ultimate-blocks")}
										/>
									</>
								),
							},
							{
								name: "activeState",
								title: __("Active", "ultimate-blocks"),
								component: (
									<>
										{showTabBackground && (
											<ColorSettings
												attrKey="theme"
												label={__("Tab Background", "ultimate-blocks")}
											/>
										)}
										<ColorSettings
											attrKey="titleColor"
											label={__("Tab Text", "ultimate-blocks")}
										/>
									</>
								),
							},
						]}
					/>
					<p className="ub-color-group-label">
						{__("Content", "ultimate-blocks")}
					</p>
					<ColorSettings
						attrKey="contentColor"
						label={__("Content Text", "ultimate-blocks")}
					/>
					<ColorSettings
						attrKey="contentBackground"
						label={__("Content Background", "ultimate-blocks")}
					/>
				</InspectorControls>
				<InspectorControls group="border">
					<ToolsPanelItem
						panelId={this.props.clientId}
						isShownByDefault
						label={__("Show Border", "ultimate-blocks")}
						resetAllFilter={() => setAttributes({ showBorder: true })}
						hasValue={() => showBorder === false}
						onDeselect={() => setAttributes({ showBorder: true })}
					>
						<ToggleControl
							__nextHasNoMarginBottom
							label={__("Show Border", "ultimate-blocks")}
							checked={showBorder !== false}
							onChange={(value) => setAttributes({ showBorder: value })}
						/>
					</ToolsPanelItem>
					<BorderControl
						isShowBorder={false}
						showDefaultBorderRadius
						attrBorderRadiusKey="tabButtonsBorderRadius"
						borderRadiusLabel={__(
							"Tab Buttons Border Radius",
							"ultimate-blocks",
						)}
					/>
					<BorderControl
						isShowBorder={false}
						showDefaultBorderRadius
						attrBorderRadiusKey="tabContentsBorderRadius"
						borderRadiusLabel={__(
							"Tab Contents Border Radius",
							"ultimate-blocks",
						)}
					/>
				</InspectorControls>
				{/* called, not rendered as an element: pro defines ProInspectorControls anew on
				every render, and remounting its InspectorControls each time looped forever
				("Maximum update depth exceeded") once the tab icon controls showed */}
				{ProInspectorControls && ProInspectorControls({ showControls })}
			</>
		);
	}
}

export default Inspector;
