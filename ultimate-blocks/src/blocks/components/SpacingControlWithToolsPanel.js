/**
 * WordPress Dependencies
 */
import { isEmpty } from "lodash";
import { __ } from "@wordpress/i18n";
import {
	useBlockEditContext,
	__experimentalSpacingSizesControl as SpacingSizesControl,
} from "@wordpress/block-editor";
import { useSelect, useDispatch } from "@wordpress/data";
import {
	BaseControl,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";

function SpacingControlWithToolsPanel({
	label,
	attrKey,
	showByDefault = false,
	minimumCustomValue = 0,
	sides = ["top", "right", "bottom", "left"],
	help = "",
}) {
	const { clientId } = useBlockEditContext();

	const attributes = useSelect((select) =>
		select("core/block-editor").getBlockAttributes(clientId),
	);
	const { updateBlockAttributes } = useDispatch("core/block-editor");
	const setAttributes = (newAttributes) => {
		updateBlockAttributes(clientId, newAttributes);
	};
	const control = (
		<SpacingSizesControl
			minimumCustomValue={minimumCustomValue}
			allowReset={true}
			label={label}
			values={attributes[attrKey]}
			sides={sides}
			onChange={(newValue) => {
				setAttributes({
					[attrKey]: newValue,
				});
			}}
		/>
	);

	return (
		<>
			<ToolsPanelItem
				panelId={clientId}
				isShownByDefault={showByDefault}
				resetAllFilter={() => {
					setAttributes({
						[attrKey]: {},
					});
				}}
				className={"tools-panel-item-spacing"}
				label={label}
				onDeselect={() => setAttributes({ [attrKey]: {} })}
				hasValue={() => !isEmpty(attributes[attrKey])}
			>
				{/* the spacing control has no help of its own, BaseControl prints it the WordPress way */}
				{help ? (
					<BaseControl __nextHasNoMarginBottom help={help}>
						{control}
					</BaseControl>
				) : (
					control
				)}
			</ToolsPanelItem>
		</>
	);
}

export default SpacingControlWithToolsPanel;
