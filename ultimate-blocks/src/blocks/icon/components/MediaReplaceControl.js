/**
 * WordPress dependencies
 */
import { __ } from "@wordpress/i18n";
import {
	MenuGroup,
	MenuItem,
	ToolbarDropdownMenu,
} from "@wordpress/components";
import { code } from "@wordpress/icons";
import { blockIcon } from "../icons/block-icon";

function IconReplaceControl({ onReset, onLibraryOpen, onCustomInserterOpen }) {
	return (
		//only toolbar items may sit in the block toolbar, a plain DropdownMenu is deprecated since
		//WP 5.6 (console: "Using custom components as toolbar controls is deprecated")
		<ToolbarDropdownMenu
			icon=""
			label={__("Replace", "ultimate-blocks")}
			popoverProps={{
				className: "outermost-ultimate-blocks__replace-popover is-alternate",
			}}
			text={__("Replace", "ultimate-blocks")}
		>
			{({ onClose }) => (
				<>
					<MenuGroup>
						<MenuItem
							onClick={() => {
								onLibraryOpen();
								onClose(true);
							}}
							icon={blockIcon}
						>
							{__("Open Icon Library", "ultimate-blocks")}
						</MenuItem>

						<MenuItem
							onClick={() => {
								onCustomInserterOpen();
								onClose(true);
							}}
							icon={code}
						>
							{__("Change Custom SVG", "ultimate-blocks")}
						</MenuItem>
					</MenuGroup>
					<MenuGroup>
						<MenuItem
							onClick={() => {
								onReset();
								onClose(true);
							}}
						>
							{__("Clear icon", "ultimate-blocks")}
						</MenuItem>
					</MenuGroup>
				</>
			)}
		</ToolbarDropdownMenu>
	);
}
export default IconReplaceControl;
