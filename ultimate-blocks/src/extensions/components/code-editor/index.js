import AceEditor from "react-ace";
// import "brace/mode/css";
// import "brace/mode/javascript";
// import "brace/snippets/css";
// import "brace/snippets/javascript";
// import "brace/snippets/text";
// import "brace/ext/language_tools";
// import "brace/theme/monokai";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/theme-solarized_light";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-snippets";
import "ace-builds/src-noconflict/snippets/css";
import ace from "ace-builds/src-noconflict/ace";
import cssWorkerUrl from "ace-builds/src-noconflict/worker-css.js";

//ace checks the CSS in a web worker that it looks for next to this script, in
//dist/, where the build did not put it (console: "Failed to execute 'importScripts'
//... worker-css.js failed to load"); the build now copies it to dist/ace/ (see
//webpack.config.js) and ace is told where it is
ace.config.setModuleUrl("ace/mode/css_worker", cssWorkerUrl);

function CodeEditor(props) {
	return (
		<div style={{ height: 400 }} className="ub-code-editor-component">
			<AceEditor
				theme="solarized_light"
				onLoad={(editor) => {
					editor.renderer.setScrollMargin(16, 16, 16, 16);
				}}
				fontSize={12}
				showPrintMargin
				showGutter={true}
				highlightActiveLine={true}
				width="100%"
				height="100%"
				setOptions={{
					enableBasicAutocompletion: true,
					enableLiveAutocompletion: true,
					enableSnippets: true,
					showLineNumbers: true,
					printMargin: false,
					tabSize: 2,
				}}
				editorProps={{
					$blockScrolling: Infinity,
				}}
				{...props}
			/>
		</div>
	);
}

export default CodeEditor;
