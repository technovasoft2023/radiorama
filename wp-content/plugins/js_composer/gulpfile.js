const { series, parallel } = require('gulp')

// CSS Tasks
const buildStyles = require('./gulp/buildStyles.js')
const watchStyles = require('./gulp/watchStyles.js')
const {
	buildCss,
	buildFontLibs,
	buildCssLibs,
	buildModuleCss,
	buildModuleCssMainFile,
	buildCssPackages
} = buildStyles
const {
	watchLess,
	watchFontLibs,
	watchCssLibs,
	watchModuleCssFiles,
	watchModuleCssMainFile
} = watchStyles

// JS Tasks
const buildScripts = require('./gulp/buildScripts.js')
const watchScripts = require('./gulp/watchScripts.js')
const {
	buildJs,
	buildJsPackages,
	buildModuleJsFiles,
	buildModuleJsMainFile,
	buildJsLibs
} = buildScripts
const {
	watchJs,
	watchJsLibs,
	watchModuleJsFiles,
	watchModuleJsMainFile
} = watchScripts

// Banners Tasks
const buildBanner = require('./gulp/buildBanner.js')
const { addJsBanner, addCssBanner } = buildBanner

/**
 * Builds all node packages in assets/lib/vendor/node_modules.
 * Run functions to build JS and CSS in parallel.
 * @param done
 * @return {*}
 */
function buildNodePackages (done) {
	return parallel(buildJsPackages(), buildCssPackages())(done)
}

/**
 * Watch all files for changes.
 * Run all build functions first (to build changes),
 * then run all watch functions.
 * @param done
 */
function watchAll(done) {
	parallel(
		buildJs,
		buildCss,
		buildFontLibs,
		buildJsLibs,
		buildCssLibs,
		buildNodePackages,
		buildModuleCss,
		buildModuleCssMainFile,
		buildModuleJsFiles,
		buildModuleJsMainFile
	)(function() {
		parallel(
			watchJs,
			watchLess,
			watchFontLibs,
			watchJsLibs,
			watchCssLibs,
			watchModuleCssFiles,
			watchModuleCssMainFile,
			watchModuleJsFiles,
			watchModuleJsMainFile
		)(done)
	})
}

exports.build = series(
	buildJs,
	buildCss,
	buildFontLibs,
	buildJsLibs,
	buildCssLibs,
	addJsBanner,
	addCssBanner,
	buildNodePackages,
	buildModuleJsFiles,
	buildModuleJsMainFile,
	buildModuleCss,
	buildModuleCssMainFile
)
exports.watch = watchAll
exports.default = exports.build
