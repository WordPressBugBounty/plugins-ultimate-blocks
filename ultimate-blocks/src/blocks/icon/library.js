/**
 * Icon library of the Icon block, built as a script of its own
 * ("ultimate-blocks-icon-library") and exposed as
 * window.ultimateBlocks.iconLibrary, the way WordPress exposes its packages on
 * wp.*. The Icon block and Ultimate Blocks Pro import it as
 * "@ultimate-blocks/icon-library"; webpack turns that import into the global
 * and lists the handle as a dependency, so the icon packs load once.
 */
export { default as IconsLibrary } from "./components/icon-library";
export { ultimateIcons } from "./icons";
