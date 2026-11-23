/**
 * WordPress Dependencies
 */
import { __ } from "@wordpress/i18n";
import {
	useBlockEditContext,
	__experimentalSpacingSizesControl as SpacingSizesControl,
} from "@wordpress/block-editor";
import { useSelect, useDispatch } from "@wordpress/data";

function SpacingControl({
	label,
	attrKey,
	minimumCustomValue = 0,
	sides = ["top", "right", "bottom", "left"],
	singleValue = false,
}) {
	const { clientId } = useBlockEditContext();

	const attributes = useSelect(
		(select) => select("core/block-editor").getSelectedBlock().attributes,
	);
	const { updateBlockAttributes } = useDispatch("core/block-editor");
	const setAttributes = (newAttributes) => {
		updateBlockAttributes(clientId, newAttributes);
	};
	//a single value attribute holds one length like "20px" instead of an object of sides,
	//so older saved blocks keep working; a reset stores "" and not undefined, because an
	//undefined attribute falls back to its block.json default and breaks static blocks
	const values = singleValue ? { all: attributes[attrKey] } : attributes[attrKey];
	return (
		//the alignment fix for this control inside a PanelBody is in editor.scss (.spacing-sizes-control)
		<div className="ub-spacing-control">
			<SpacingSizesControl
				minimumCustomValue={minimumCustomValue}
				allowReset={true}
				label={label}
				values={values}
				sides={singleValue ? ["all"] : sides}
				onChange={(newValue) => {
					setAttributes({
						[attrKey]: singleValue ? (newValue?.all ?? "") : newValue,
					});
				}}
			/>
		</div>
	);
}

export default SpacingControl;
