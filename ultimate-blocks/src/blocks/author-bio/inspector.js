import { __ } from "@wordpress/i18n";
import {
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from "@wordpress/block-editor";
import {
	Button,
	ExternalLink,
	PanelBody,
	RangeControl,
	TextControl,
	ToggleControl,
} from "@wordpress/components";
import {
	BorderControl,
	BorderRadiusControl,
	ColorSettings,
	ColorSettingsWithGradient,
	CustomFontSizePicker,
	CustomToggleGroupControl,
	FontAppearanceControl,
	SpacingControlWithToolsPanel,
	TabsPanelControl,
	UBSelectControl,
} from "../components";
import networks from "./networks.json";

const HEADING_TAGS = ["h2", "h3", "h4", "h5", "h6", "p"];

export default function Inspector({ attributes, setAttributes }) {
	const {
		source,
		customAvatarId,
		customAvatarUrl,
		customUrl,
		customSocials,
		showHeading,
		headingLevel,
		showAvatar,
		avatarSize,
		avatarInitials,
		showRole,
		showBio,
		showSocials,
		socialSize,
		showPostCount,
		showPostsLink,
		showLatestPosts,
		latestPostsCount,
		showLatestPostsDate,
		nameLink,
		linkNewTab,
		linkNoFollow,
	} = attributes;

	const isCustom = source === "custom";

	return (
		<>
			<InspectorControls group="settings">
				<PanelBody title={__("Author", "ultimate-blocks")}>
					<div className="ub-author-bio-controls">
						<CustomToggleGroupControl
							label={__("Show", "ultimate-blocks")}
							attributeKey="source"
							isBlock
							options={[
								{ value: "author", label: __("Post author", "ultimate-blocks") },
								{ value: "custom", label: __("Custom", "ultimate-blocks") },
							]}
						/>
						{!isCustom && (
							<p className="components-base-control__help">
								{__(
									"Name, photo and bio come from the author's profile. The job title and social links are under Contact Info there.",
									"ultimate-blocks"
								)}{" "}
								<ExternalLink href="profile.php">
									{__("Edit your profile", "ultimate-blocks")}
								</ExternalLink>
							</p>
						)}
						{isCustom && (
							<>
								<MediaUploadCheck>
									<MediaUpload
										allowedTypes={["image"]}
										value={customAvatarId}
										onSelect={(media) =>
											setAttributes({
												customAvatarId: media.id,
												customAvatarUrl:
													media.sizes?.medium?.url ?? media.url,
											})
										}
										render={({ open }) => (
											<div className="ub-author-bio-controls__avatar">
												{customAvatarUrl && (
													<img src={customAvatarUrl} alt="" />
												)}
												<Button variant="secondary" onClick={open}>
													{customAvatarUrl
														? __("Replace photo", "ultimate-blocks")
														: __("Choose photo", "ultimate-blocks")}
												</Button>
												{customAvatarUrl && (
													<Button
														variant="tertiary"
														isDestructive
														onClick={() =>
															setAttributes({
																customAvatarId: 0,
																customAvatarUrl: "",
															})
														}
													>
														{__("Remove", "ultimate-blocks")}
													</Button>
												)}
											</div>
										)}
									/>
								</MediaUploadCheck>
								<TextControl
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									type="url"
									label={__("Author link", "ultimate-blocks")}
									help={__(
										"The name and the posts button link here.",
										"ultimate-blocks"
									)}
									value={customUrl}
									onChange={(value) => setAttributes({ customUrl: value })}
								/>
							</>
						)}
					</div>
				</PanelBody>
				{isCustom && (
					<PanelBody title={__("Social Links", "ultimate-blocks")} initialOpen={false}>
						<div className="ub-author-bio-controls">
							{networks.map(({ key, label }) => (
								<TextControl
									key={key}
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									type={key === "email" ? "email" : "url"}
									label={label}
									value={customSocials?.[key] ?? ""}
									onChange={(value) =>
										setAttributes({
											customSocials: { ...customSocials, [key]: value },
										})
									}
								/>
							))}
						</div>
					</PanelBody>
				)}
				<PanelBody title={__("Display", "ultimate-blocks")} initialOpen={false}>
					<div className="ub-author-bio-controls">
						<ToggleControl
							__nextHasNoMarginBottom
							label={__("Heading", "ultimate-blocks")}
							checked={showHeading}
							onChange={(value) => setAttributes({ showHeading: value })}
						/>
						{showHeading && (
							<UBSelectControl
								label={__("Heading tag", "ultimate-blocks")}
								value={headingLevel}
								options={HEADING_TAGS.map((tag) => ({
									value: tag,
									label:
										tag === "p" ? __("Paragraph", "ultimate-blocks") : tag.toUpperCase(),
								}))}
								onChange={(value) => setAttributes({ headingLevel: value })}
							/>
						)}
						<ToggleControl
							__nextHasNoMarginBottom
							label={__("Photo", "ultimate-blocks")}
							checked={showAvatar}
							onChange={(value) => setAttributes({ showAvatar: value })}
						/>
						<ToggleControl
							__nextHasNoMarginBottom
							label={__("Job title", "ultimate-blocks")}
							checked={showRole}
							onChange={(value) => setAttributes({ showRole: value })}
						/>
						{!isCustom && (
							<ToggleControl
								__nextHasNoMarginBottom
								label={__("Number of articles", "ultimate-blocks")}
								checked={showPostCount}
								onChange={(value) => setAttributes({ showPostCount: value })}
							/>
						)}
						<ToggleControl
							__nextHasNoMarginBottom
							label={__("Bio", "ultimate-blocks")}
							checked={showBio}
							onChange={(value) => setAttributes({ showBio: value })}
						/>
						<ToggleControl
							__nextHasNoMarginBottom
							label={__("Social links", "ultimate-blocks")}
							checked={showSocials}
							onChange={(value) => setAttributes({ showSocials: value })}
						/>
						{showSocials && (
							<RangeControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={__("Icon size", "ultimate-blocks")}
								value={socialSize}
								min={12}
								max={48}
								onChange={(value) => setAttributes({ socialSize: value ?? 20 })}
							/>
						)}
						{!isCustom && (
							<ToggleControl
								__nextHasNoMarginBottom
								label={__("Latest posts", "ultimate-blocks")}
								help={__(
									"The author's newest posts, without the one being read.",
									"ultimate-blocks"
								)}
								checked={showLatestPosts}
								onChange={(value) => setAttributes({ showLatestPosts: value })}
							/>
						)}
						{!isCustom && showLatestPosts && (
							<>
								<RangeControl
									__next40pxDefaultSize
									__nextHasNoMarginBottom
									label={__("Number of posts", "ultimate-blocks")}
									value={latestPostsCount}
									min={1}
									max={10}
									onChange={(value) => setAttributes({ latestPostsCount: value ?? 3 })}
								/>
								<ToggleControl
									__nextHasNoMarginBottom
									label={__("Post dates", "ultimate-blocks")}
									checked={showLatestPostsDate}
									onChange={(value) => setAttributes({ showLatestPostsDate: value })}
								/>
							</>
						)}
						<ToggleControl
							__nextHasNoMarginBottom
							label={__("All posts button", "ultimate-blocks")}
							help={
								isCustom
									? __("Shows when the author has a link.", "ultimate-blocks")
									: undefined
							}
							checked={showPostsLink}
							onChange={(value) => setAttributes({ showPostsLink: value })}
						/>
					</div>
				</PanelBody>
				{showAvatar && (
					<PanelBody title={__("Photo", "ultimate-blocks")} initialOpen={false}>
						<div className="ub-author-bio-controls">
							<RangeControl
								__next40pxDefaultSize
								__nextHasNoMarginBottom
								label={__("Size", "ultimate-blocks")}
								value={avatarSize}
								min={32}
								max={240}
								onChange={(value) => setAttributes({ avatarSize: value ?? 96 })}
							/>
							<CustomToggleGroupControl
								label={__("Shape", "ultimate-blocks")}
								attributeKey="avatarShape"
								isBlock
								options={[
									{ value: "circle", label: __("Circle", "ultimate-blocks") },
									{ value: "rounded", label: __("Rounded", "ultimate-blocks") },
									{ value: "square", label: __("Square", "ultimate-blocks") },
								]}
							/>
							<ToggleControl
								__nextHasNoMarginBottom
								label={__("Initials when there is no photo", "ultimate-blocks")}
								checked={avatarInitials}
								onChange={(value) => setAttributes({ avatarInitials: value })}
							/>
						</div>
					</PanelBody>
				)}
				<PanelBody title={__("Links", "ultimate-blocks")} initialOpen={false}>
					<div className="ub-author-bio-controls">
						{!isCustom && (
							<UBSelectControl
								label={__("Name links to", "ultimate-blocks")}
								value={nameLink}
								options={[
									{ value: "archive", label: __("Author's posts", "ultimate-blocks") },
									{ value: "website", label: __("Author's website", "ultimate-blocks") },
									{ value: "none", label: __("Nothing", "ultimate-blocks") },
								]}
								onChange={(value) => setAttributes({ nameLink: value })}
							/>
						)}
						{isCustom && (
							<ToggleControl
								__nextHasNoMarginBottom
								label={__("Link the name", "ultimate-blocks")}
								checked={nameLink !== "none"}
								onChange={(value) =>
									setAttributes({ nameLink: value ? "website" : "none" })
								}
							/>
						)}
						<ToggleControl
							__nextHasNoMarginBottom
							label={__("Open links in a new tab", "ultimate-blocks")}
							checked={linkNewTab}
							onChange={(value) => setAttributes({ linkNewTab: value })}
						/>
						<ToggleControl
							__nextHasNoMarginBottom
							label={__("Add nofollow", "ultimate-blocks")}
							help={__(
								"Asks search engines not to follow the name and social links.",
								"ultimate-blocks"
							)}
							checked={linkNoFollow}
							onChange={(value) => setAttributes({ linkNoFollow: value })}
						/>
					</div>
				</PanelBody>
			</InspectorControls>
			<InspectorControls group="color">
				<ColorSettingsWithGradient
					attrBackgroundKey="backgroundColor"
					attrGradientKey="backgroundGradient"
					label={__("Background", "ultimate-blocks")}
				/>
				{showHeading && (
					<ColorSettings attrKey="headingColor" label={__("Heading", "ultimate-blocks")} />
				)}
				<ColorSettings attrKey="nameColor" label={__("Name", "ultimate-blocks")} />
				{(showRole || showPostCount) && (
					<ColorSettings
						attrKey="roleColor"
						label={__("Job title and articles", "ultimate-blocks")}
					/>
				)}
				{showBio && <ColorSettings attrKey="bioColor" label={__("Bio", "ultimate-blocks")} />}
				{!isCustom && showLatestPosts && (
					<ColorSettings
						attrKey="latestPostsColor"
						label={__("Latest posts", "ultimate-blocks")}
					/>
				)}
				{(showSocials || showPostsLink) && (
					<TabsPanelControl
						tabs={[
							{
								name: "normal",
								title: __("Normal", "ultimate-blocks"),
								component: (
									<>
										{showSocials && (
											<ColorSettings
												attrKey="socialColor"
												label={__("Social icons", "ultimate-blocks")}
											/>
										)}
										{showPostsLink && (
											<>
												<ColorSettings
													attrKey="buttonTextColor"
													label={__("Button text", "ultimate-blocks")}
												/>
												<ColorSettingsWithGradient
													attrBackgroundKey="buttonBackgroundColor"
													attrGradientKey="buttonBackgroundGradient"
													label={__("Button background", "ultimate-blocks")}
												/>
											</>
										)}
									</>
								),
							},
							{
								name: "hover",
								title: __("Hover", "ultimate-blocks"),
								component: (
									<>
										{showSocials && (
											<ColorSettings
												attrKey="socialHoverColor"
												label={__("Social icons", "ultimate-blocks")}
											/>
										)}
										{showPostsLink && (
											<>
												<ColorSettings
													attrKey="buttonHoverTextColor"
													label={__("Button text", "ultimate-blocks")}
												/>
												<ColorSettingsWithGradient
													attrBackgroundKey="buttonHoverBackgroundColor"
													attrGradientKey="buttonHoverBackgroundGradient"
													label={__("Button background", "ultimate-blocks")}
												/>
											</>
										)}
									</>
								),
							},
						]}
					/>
				)}
			</InspectorControls>
			<InspectorControls group="typography">
				{showHeading && (
					<>
						<CustomFontSizePicker
							showDefaultFontSize={false}
							attrKey="headingFontSize"
							label={__("Heading Font Size", "ultimate-blocks")}
						/>
						<FontAppearanceControl
							showDefault={false}
							attrKey="headingFontAppearance"
							label={__("Heading Appearance", "ultimate-blocks")}
						/>
					</>
				)}
				<CustomFontSizePicker
					attrKey="nameFontSize"
					label={__("Name Font Size", "ultimate-blocks")}
				/>
				<FontAppearanceControl
					showDefault={false}
					attrKey="nameFontAppearance"
					label={__("Name Appearance", "ultimate-blocks")}
				/>
				{(showRole || showPostCount) && (
					<CustomFontSizePicker
						showDefaultFontSize={false}
						attrKey="roleFontSize"
						label={__("Job Title Font Size", "ultimate-blocks")}
					/>
				)}
				{showBio && (
					<CustomFontSizePicker
						showDefaultFontSize={false}
						attrKey="bioFontSize"
						label={__("Bio Font Size", "ultimate-blocks")}
					/>
				)}
				{!isCustom && showLatestPosts && (
					<CustomFontSizePicker
						showDefaultFontSize={false}
						attrKey="latestPostsFontSize"
						label={__("Latest Posts Font Size", "ultimate-blocks")}
					/>
				)}
				{showPostsLink && (
					<>
						<CustomFontSizePicker
							showDefaultFontSize={false}
							attrKey="buttonFontSize"
							label={__("Button Font Size", "ultimate-blocks")}
						/>
						<FontAppearanceControl
							showDefault={false}
							attrKey="buttonFontAppearance"
							label={__("Button Appearance", "ultimate-blocks")}
						/>
					</>
				)}
			</InspectorControls>
			<InspectorControls group="border">
				<BorderControl
					showDefaultBorder
					attrBorderKey="border"
					attrBorderRadiusKey="borderRadius"
					borderLabel={__("Border", "ultimate-blocks")}
					borderRadiusLabel={__("Border Radius", "ultimate-blocks")}
				/>
				{showPostsLink && (
					<BorderRadiusControl
						attrKey="buttonBorderRadius"
						label={__("Button Radius", "ultimate-blocks")}
					/>
				)}
			</InspectorControls>
			<InspectorControls group="dimensions">
				<SpacingControlWithToolsPanel
					showByDefault
					attrKey="padding"
					label={__("Padding", "ultimate-blocks")}
				/>
				<SpacingControlWithToolsPanel
					minimumCustomValue={-Infinity}
					attrKey="margin"
					label={__("Margin", "ultimate-blocks")}
				/>
				<SpacingControlWithToolsPanel
					sides={["all"]}
					attrKey="gap"
					label={__("Gap between photo and text", "ultimate-blocks")}
					help={__("Works with the Side and Centered styles.", "ultimate-blocks")}
				/>
				{showPostsLink && (
					<SpacingControlWithToolsPanel
						attrKey="buttonPadding"
						label={__("Button Padding", "ultimate-blocks")}
					/>
				)}
			</InspectorControls>
		</>
	);
}
