/**
 * Pro only blocks in the free inserter.
 *
 * Without pro every pro block shows up in the inserter with a PRO badge and
 * adds a locked card to the canvas, which saves nothing to the post. With pro
 * the same cards are hidden from the inserter and a card left in a post turns
 * into the real block.
 */
import { __ } from "@wordpress/i18n";
import { registerBlockType, createBlock, getBlockType } from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";
import { Button, Placeholder } from "@wordpress/components";
import { useDispatch } from "@wordpress/data";
import { useEffect } from "@wordpress/element";
import { FrontendDataManager } from "$Library/ub-common/Inc";
import MainStore from "$BlockStores/mainStore";

const isPro = MainStore.select().getProStatus();

//outside the ub/ namespace, so the extensions and upsells of ub/ blocks leave the cards alone
const getUpsellName = (blockName) =>
	`ub-pro-upsell/${blockName.replace(/^ub\//, "")}`;

/**
 * Pro block icon, the svg markup is sanitized on the server.
 *
 * @param {Object} props      component properties
 * @param {string} props.icon svg markup
 */
const UpsellIcon = ({ icon }) => (
	<span
		className="ub-pro-block-upsell__icon"
		dangerouslySetInnerHTML={{ __html: icon }}
	/>
);

/**
 * Locked card of a pro block.
 *
 * @param {Object} props          component properties
 * @param {string} props.clientId block client id
 * @param {string} props.name     name of the real pro block
 * @param {Object} props.upsell   upsell data of the pro block
 */
const UpsellEdit = ({ clientId, name, upsell }) => {
	const blockProps = useBlockProps({ className: "ub-pro-block-upsell" });
	const { removeBlock, replaceBlock } = useDispatch("core/block-editor");
	const proUrl = MainStore.select().getAssets("proUrl");

	useEffect(() => {
		if (isPro && getBlockType(name)) {
			replaceBlock(clientId, createBlock(name));
		}
	}, []);

	return (
		<div {...blockProps}>
			<Placeholder
				icon={<UpsellIcon icon={upsell.icon} />}
				label={
					<>
						{upsell.title}
						<span className="ub-pro-block-upsell__badge">
							{__("Pro", "ultimate-blocks")}
						</span>
					</>
				}
				instructions={upsell.desc}
			>
				{upsell.screenshot && (
					<img
						className="ub-pro-block-upsell__screenshot"
						src={upsell.screenshot}
						alt=""
					/>
				)}
				<div className="ub-pro-block-upsell__actions">
					<Button
						__next40pxDefaultSize
						variant="primary"
						href={proUrl}
						target="_blank"
						rel="noreferrer"
					>
						{__("Unlock with Pro", "ultimate-blocks")}
					</Button>
					<Button
						__next40pxDefaultSize
						variant="tertiary"
						onClick={() => removeBlock(clientId)}
					>
						{__("Remove block", "ultimate-blocks")}
					</Button>
				</div>
			</Placeholder>
		</div>
	);
};

const upsells = FrontendDataManager.getDataProperty("proBlockUpsells") ?? {};

for (const [name, upsell] of Object.entries(upsells)) {
	registerBlockType(getUpsellName(name), {
		apiVersion: 3,
		title: upsell.title,
		description: upsell.desc,
		category: "ultimateblocks",
		icon: <UpsellIcon icon={upsell.icon} />,
		keywords: [upsell.label, __("pro", "ultimate-blocks")],
		supports: {
			html: false,
			reusable: false,
			className: false,
			customClassName: false,
			inserter: !isPro,
		},
		edit: (props) => <UpsellEdit {...props} name={name} upsell={upsell} />,
		save: () => null,
	});
}
