/**
 * WordPress Dependencies
 */
import { useDispatch, useSelect } from "@wordpress/data";
import { useBlockEditContext } from "@wordpress/block-editor";
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";

/**
 *
 * @param {string} label - Group control label
 * @param {Array} options - Group control available options
 * @param {string} attributeKey - Attribute key
 * @param {boolean} [isBlock=false] - Toggle group control prop
 * @param {boolean} [isAdaptiveWidth=false] - Toggle group control prop
 * @param {string|number} [value] - Value, for a control that is not one attribute
 * @param {Function} [onChange] - Change handler that goes with value; without it the control sets attributeKey
 * @param {boolean} [hideLabelFromVision=false] - Keep the label for screen readers only
 * @param {string} [className] - Extra class for the control
 */
function CustomToggleGroupControl({
	label,
	options,
	attributeKey,
	isBlock = false,
	isAdaptiveWidth = false,
	value: controlledValue,
	onChange: controlledOnChange,
	hideLabelFromVision = false,
	className,
}) {
	const { clientId } = useBlockEditContext();
	const { updateBlockAttributes } = useDispatch("core/block-editor");

	const attributes = useSelect((select) => {
		return select("core/block-editor").getBlockAttributes(clientId);
	});
	const setAttributes = (newAttributes) =>
		updateBlockAttributes(clientId, newAttributes);

	return (
		<ToggleGroupControl
			label={label}
			isBlock={isBlock}
			isAdaptiveWidth={isAdaptiveWidth}
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			className={className}
			hideLabelFromVision={hideLabelFromVision}
			//a control that does not map to one attribute (component state, a store, an item of
			//an array attribute) passes value and onChange; the others name their attribute
			value={controlledOnChange ? controlledValue : attributes?.[attributeKey]}
			onChange={(newValue) => {
				if (controlledOnChange) {
					controlledOnChange(newValue);
					return;
				}
				setAttributes({
					[attributeKey]: newValue,
				});
			}}
		>
			{options.map(({ value, icon = null, label }) => {
				return icon ? (
					<ToggleGroupControlOptionIcon
						key={value}
						value={value}
						icon={icon}
						label={label}
					/>
				) : (
					<ToggleGroupControlOption key={value} value={value} label={label} />
				);
			})}
		</ToggleGroupControl>
	);
}

export default CustomToggleGroupControl;
