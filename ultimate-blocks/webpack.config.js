const defaultConfig = require('@wordpress/scripts/config/webpack.config.js');
const path = require('path');
const IgnoreEmitPlugin = require('ignore-emit-webpack-plugin');
// eslint-disable-next-line import/no-extraneous-dependencies
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// eslint-disable-next-line import/no-extraneous-dependencies
const { DefinePlugin } = require('webpack');
const DevelopmentComponentIgnorePlugin = require('./src/__development/webpack/plugin/DevelopmentComponentIgnorePlugin');

/**
 * The icon library is a script of its own, exposed as
 * window.ultimateBlocks.iconLibrary under the "ultimate-blocks-icon-library"
 * handle. An import of "@ultimate-blocks/icon-library" becomes that global, the
 * way an import of "@wordpress/blocks" becomes wp.blocks.
 */
const ICON_LIBRARY_REQUEST = '@ultimate-blocks/icon-library';
const ICON_LIBRARY_GLOBAL = ['ultimateBlocks', 'iconLibrary'];
const ICON_LIBRARY_HANDLE = 'ultimate-blocks-icon-library';

// The plugin ships inside @wordpress/scripts, so its class is taken from the
// instance the default config already holds.
const defaultDependencyExtraction = defaultConfig.plugins.find(
	(p) => p.constructor.name === 'DependencyExtractionWebpackPlugin'
);
const DependencyExtractionWebpackPlugin = defaultDependencyExtraction.constructor;

// ignore list to mark given components as development specific
const developmentComponentIgnoreList = [
	'ActivateBlockOnStartup',
	'DevelopmentComponent',
];

const customConfig = {
	...defaultConfig,
	entry: {
		blocks: path.resolve(process.cwd(), 'src', 'blocks.js'),
		priority: path.resolve(process.cwd(), 'src', 'priority.js'),
		'ub-admin-settings': path.resolve(
			process.cwd(),
			'admin',
			'js',
			'src',
			'ub-admin-settings.js'
		),
		'setup-wizard': path.resolve(
			process.cwd(),
			'admin',
			'js',
			'src',
			'setup-wizard.js'
		),
		'icon-library': {
			import: path.resolve(
				process.cwd(),
				'src',
				'blocks',
				'icon',
				'library.js'
			),
			library: { name: ICON_LIBRARY_GLOBAL, type: 'window' },
		},
	},
	resolve: {
		...defaultConfig.resolve,
		alias: {
			...defaultConfig.resolve.alias,
			$BlockStores: path.resolve(__dirname, 'src', 'stores'),
			$Inc: path.resolve(__dirname, 'src', 'inc'),
			$Base: path.resolve(__dirname, 'src', 'base'),
			$Library: path.resolve(__dirname, 'library'),
			$Manager: path.resolve(__dirname, 'src', 'inc', 'managers'),
			$Development: path.resolve(__dirname, 'src', '__development'),

			// Admin app aliases, previously declared for Parcel in package.json.
			$Containers: path.resolve(__dirname, 'admin', 'js', 'src', 'containers'),
			$Components: path.resolve(__dirname, 'admin', 'js', 'src', 'components'),
			$Data: path.resolve(__dirname, 'admin', 'js', 'src', 'data'),
			$AdminInc: path.resolve(__dirname, 'admin', 'js', 'src', 'inc'),
			$HOC: path.resolve(__dirname, 'admin', 'js', 'src', 'hoc'),
			$Stores: path.resolve(__dirname, 'admin', 'js', 'src', 'stores'),
			$Styles: path.resolve(__dirname, 'admin', 'css', 'src'),
			$EditorComponents: path.resolve(__dirname, 'src', 'inc', 'components'),

			// Keep the automatic JSX runtime on WordPress' React instance rather
			// than letting webpack inline React's own copy. See the shim for why.
			'react/jsx-runtime': path.resolve(
				__dirname,
				'src',
				'shims',
				'jsx-runtime.js'
			),
			'react/jsx-dev-runtime': path.resolve(
				__dirname,
				'src',
				'shims',
				'jsx-runtime.js'
			),
		},
		extensions: [...defaultConfig.resolve.extensions, '.js'],
	},
	module: {
		...defaultConfig.module,
		rules: [
			...defaultConfig.module.rules,
			// The Custom CSS code editor (ace) checks CSS in a web worker it loads by
			// URL. Imported from the editor, the worker file is copied into
			// dist/ace/ as it is and the import gives its URL.
			{
				test: /ace-builds[\\/]src-noconflict[\\/]worker-[\w-]+\.js$/,
				type: 'asset/resource',
				generator: { filename: 'ace/[name][ext]' },
			},
		],
	},
	plugins: [
		...defaultConfig.plugins.filter(
			(p) =>
				!(
					p instanceof CleanWebpackPlugin ||
					p instanceof DependencyExtractionWebpackPlugin
				)
		),
		new DependencyExtractionWebpackPlugin({
			...defaultDependencyExtraction?.options,
			requestToExternal: (request) =>
				request === ICON_LIBRARY_REQUEST ? ICON_LIBRARY_GLOBAL : undefined,
			requestToHandle: (request) =>
				request === ICON_LIBRARY_REQUEST ? ICON_LIBRARY_HANDLE : undefined,
		}),
		new IgnoreEmitPlugin(['blocks.build.asset.php', /\.map$/]),
		new DefinePlugin({
			UB_ENV: JSON.stringify(defaultConfig.mode),
		}),
		new DevelopmentComponentIgnorePlugin(
			developmentComponentIgnoreList,
			defaultConfig.mode === 'production'
		),
	],
	output: {
		filename: '[name].build.js',
	},
};

module.exports = customConfig;
