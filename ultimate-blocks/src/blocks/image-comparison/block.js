import { registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import Edit from "./edit";

registerBlockType(metadata, {
	icon: (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6V3H5Zm8 0v18h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-6Zm-8 13 3-4 2 2.5V19H5v-3Zm9.5-8.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM12 1h-1v22h1V1Z"
				fill="#E11B4C"
			/>
		</svg>
	),
	edit: Edit,
	save: () => null,
});
