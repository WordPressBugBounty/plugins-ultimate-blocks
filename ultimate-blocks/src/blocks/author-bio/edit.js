import { __, _n, sprintf } from "@wordpress/i18n";
import { RichText, useBlockProps } from "@wordpress/block-editor";
import { dateI18n, getSettings as getDateSettings } from "@wordpress/date";
import { decodeEntities } from "@wordpress/html-entities";
import Inspector from "./inspector";
import { usePostAuthor } from "./hooks/use-post-author";
import getStyles from "./get-styles";
import networks from "./networks.json";

const META_PREFIX = "ub_author_";

const getInitials = (name) =>
	name
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => word.charAt(0).toUpperCase())
		.join("");

//the same size and fallback the frontend asks gravatar for
const getAvatarUrl = (url, size, initials) => {
	if (!url) {
		return "";
	}

	try {
		const avatar = new URL(url);
		avatar.searchParams.set("s", size * 2);
		if (initials) {
			avatar.searchParams.set("d", "blank");
		}
		return avatar.toString();
	} catch {
		return url;
	}
};

const stripTags = (html) => html.replace(/<[^>]*>/g, "");

export default function Edit(props) {
	const { attributes, setAttributes, context } = props;
	const {
		source,
		customName,
		customRole,
		customBio,
		customAvatarUrl,
		customUrl,
		customSocials,
		showHeading,
		headingText,
		headingLevel,
		showAvatar,
		avatarSize,
		avatarShape,
		avatarInitials,
		showRole,
		showBio,
		showSocials,
		showPostCount,
		showPostsLink,
		postsLinkText,
		showLatestPosts,
		latestPostsTitle,
		latestPostsCount,
		showLatestPostsDate,
		nameLink,
	} = attributes;

	const isCustom = source === "custom";
	const postAuthor = usePostAuthor(
		!isCustom,
		context.postId,
		context.postType,
		showLatestPosts ? latestPostsCount : 0
	);
	const user = postAuthor?.user;

	const author = isCustom
		? {
				name: stripTags(customName),
				role: customRole,
				avatar: customAvatarUrl,
				link: customUrl,
				socials: customSocials,
			}
		: {
				name: user?.name ?? "",
				role: user?.meta?.[`${META_PREFIX}job_title`] ?? "",
				bio: user?.description ?? "",
				avatar: getAvatarUrl(
					user?.avatar_urls?.["96"],
					avatarSize,
					avatarInitials
				),
				link: nameLink === "website" ? user?.url : user?.link,
				socials: Object.fromEntries(
					networks.map(({ key }) => [
						key,
						key === "website" ? user?.url : user?.meta?.[`${META_PREFIX}${key}`],
					])
				),
			};

	const initials = avatarInitials ? getInitials(author.name) : "";
	const socialLinks = networks.filter(({ key }) => author.socials?.[key]?.trim());

	const blockProps = useBlockProps({
		className: "ub-author-bio",
		style: getStyles(attributes),
	});

	const meta = [];
	if (showRole && (isCustom || author.role)) {
		meta.push(
			isCustom ? (
				<RichText
					key="role"
					tagName="span"
					className="ub-author-bio__role"
					value={customRole}
					allowedFormats={[]}
					placeholder={__("Role or job title", "ultimate-blocks")}
					onChange={(value) => setAttributes({ customRole: value })}
				/>
			) : (
				<span key="role" className="ub-author-bio__role">
					{author.role}
				</span>
			)
		);
	}
	if (!isCustom && showPostCount && postAuthor?.count != null) {
		meta.push(
			<span key="count" className="ub-author-bio__count">
				{sprintf(
					/* translators: %s: number of published posts */
					_n("%s article", "%s articles", postAuthor.count, "ultimate-blocks"),
					postAuthor.count.toLocaleString()
				)}
			</span>
		);
	}

	return (
		<>
			<Inspector {...props} />
			<div {...blockProps}>
				{showHeading && (
					<RichText
						tagName={headingLevel}
						className="ub-author-bio__heading"
						value={headingText}
						allowedFormats={[]}
						placeholder={__("About the Author", "ultimate-blocks")}
						onChange={(value) => setAttributes({ headingText: value })}
					/>
				)}
				<div className="ub-author-bio__inner">
					{showAvatar && (initials || author.avatar) && (
						<div className={`ub-author-bio__avatar is-${avatarShape}`}>
							{initials && (
								<span className="ub-author-bio__initials" aria-hidden="true">
									{initials}
								</span>
							)}
							{author.avatar && (
								<img
									src={author.avatar}
									alt=""
									width={avatarSize}
									height={avatarSize}
								/>
							)}
						</div>
					)}
					<div className="ub-author-bio__content">
						{isCustom ? (
							<RichText
								tagName="p"
								className="ub-author-bio__name"
								value={customName}
								allowedFormats={[]}
								placeholder={__("Author name", "ultimate-blocks")}
								onChange={(value) => setAttributes({ customName: value })}
							/>
						) : (
							<p className="ub-author-bio__name">
								{nameLink === "none" ? (
									author.name
								) : (
									<a href={author.link} onClick={(event) => event.preventDefault()}>
										{author.name || __("Post author", "ultimate-blocks")}
									</a>
								)}
							</p>
						)}
						{meta.length > 0 && (
							<p className="ub-author-bio__meta">
								{meta.flatMap((item, index) =>
									index === 0
										? [item]
										: [
												<span
													key={`separator-${index}`}
													className="ub-author-bio__separator"
													aria-hidden="true"
												>
													·
												</span>,
												item,
											]
								)}
							</p>
						)}
						{showBio &&
							(isCustom ? (
								<RichText
									tagName="div"
									multiline={false}
									className="ub-author-bio__bio"
									value={customBio}
									allowedFormats={["core/bold", "core/italic", "core/link"]}
									placeholder={__("A few words about the author…", "ultimate-blocks")}
									onChange={(value) => setAttributes({ customBio: value })}
								/>
							) : (
								author.bio && (
									<div className="ub-author-bio__bio">
										{author.bio
											.split(/\n\s*\n/)
											.map((paragraph, index) => (
												<p key={index}>{paragraph}</p>
											))}
									</div>
								)
							))}
						{showSocials && socialLinks.length > 0 && (
							<ul className="ub-author-bio__socials">
								{socialLinks.map(({ key, label, viewBox, path }) => (
									<li key={key}>
										<span
											className={`ub-author-bio__social is-${key}`}
											aria-label={label}
										>
											<svg viewBox={viewBox} aria-hidden="true" focusable="false">
												<path d={path} />
											</svg>
										</span>
									</li>
								))}
							</ul>
						)}
						{!isCustom && showLatestPosts && postAuthor?.latest.length > 0 && (
							<div className="ub-author-bio__latest">
								<RichText
									tagName="p"
									className="ub-author-bio__latest-title"
									value={latestPostsTitle}
									allowedFormats={[]}
									placeholder={__("Latest Posts", "ultimate-blocks")}
									onChange={(value) => setAttributes({ latestPostsTitle: value })}
								/>
								<ul className="ub-author-bio__latest-list">
									{postAuthor.latest.map((post) => (
										<li key={post.id}>
											<a href={post.link} onClick={(event) => event.preventDefault()}>
												{decodeEntities(post.title?.rendered ?? "") ||
													__("(no title)", "ultimate-blocks")}
											</a>
											{showLatestPostsDate && (
												<time className="ub-author-bio__latest-date" dateTime={post.date}>
													{dateI18n(getDateSettings().formats.date, post.date)}
												</time>
											)}
										</li>
									))}
								</ul>
							</div>
						)}
						{showPostsLink && (!isCustom || author.link) && (
							<RichText
								tagName="span"
								className="ub-author-bio__posts-link wp-element-button"
								value={postsLinkText}
								allowedFormats={[]}
								placeholder={__("View all posts", "ultimate-blocks")}
								onChange={(value) => setAttributes({ postsLinkText: value })}
							/>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
