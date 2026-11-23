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
				d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Zm6 6.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm-4 5.25C5 14.68 6.79 13 9 13s4 1.68 4 3.75V17H5v-.25ZM14 8h5v1.5h-5V8Zm0 3h5v1.5h-5V11Zm0 3h3.5v1.5H14V14Z"
				fill="#E11B4C"
			/>
		</svg>
	),
	edit: Edit,
	save: () => null,
	example: {
		attributes: {
			source: "custom",
			customName: "Jane Cooper",
			customRole: "Senior Editor",
			customBio:
				"Jane writes about design systems and the web. She has been building WordPress sites for ten years.",
			customUrl: "https://example.com",
			customSocials: {
				x: "https://x.com",
				linkedin: "https://linkedin.com",
			},
		},
	},
});
