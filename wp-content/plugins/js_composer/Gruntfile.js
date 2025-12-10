module.exports = function ( grunt ) {
	var globalOptions = {
		browsers: [
			'>1%',
			'not dead'
		],
		less: {
			srcPath: 'assets/less/',
			srcFiles: [
				'<%= pkg.systemName %>.less',
				'<%= pkg.systemName %>_tta.less',
				'<%= pkg.systemName %>_settings.less',
				'<%= pkg.systemName %>_frontend_editor_iframe.less',
				'<%= pkg.systemName %>_frontend_editor.less',
				'<%= pkg.systemName %>_backend_editor.less'
			],
			destPath: 'assets/css/'
		},
		js: {
			srcPath: 'assets/js/',
			destPath: 'assets/js/dist/'
		},
		libPath: 'assets/lib/'
	};
	var uglifyList = [
		{
			dest: '<%= go.js.destPath %>settings.min.js',
			src: [
				'<%= go.js.srcPath %>lib/template.js',
				'<%= go.js.srcPath %>editors/post-settings-editor.js',
				'<%= go.js.srcPath %>lib/vc-roles-tab.js',
				'<%= go.js.srcPath %>lib/vc_less.js',
				'<%= go.js.srcPath %>backend/composer-automapper.js',
				'<%= go.js.srcPath %>backend/composer-settings-page.js',
				'<%= go.js.srcPath %>lib/messages.js',
				'<%= go.js.srcPath %>lib/ai/ai-modal.js',
				'<%= go.js.srcPath %>lib/ai/ai-form-view.js'
			]
		},
		{
			dest: '<%= go.js.destPath %>backend-actions.min.js',
			src: [
				'<%= go.js.srcPath %>lib/events.js',
				'<%= go.js.srcPath %>backend/backend-access-policy.js',
				'<%= go.js.srcPath %>backend/backend-access-actions.js'
			]
		},
		{
			dest: '<%= go.js.destPath %>backend.min.js',
			src: [
				'<%= go.js.srcPath %>lib/template.js',
				'<%= go.js.srcPath %>editors/post-settings-editor.js',
				'<%= go.js.srcPath %>editors/ui/vc_ui-extend-backbone.js',
				'<%= go.js.srcPath %>lib/seo/utils.js',
				'<%= go.js.srcPath %>lib/seo/storage.js',
				'<%= go.js.srcPath %>lib/seo/checks.js',
				'<%= go.js.srcPath %>editors/panels.js',
				'<%= go.js.srcPath %>editors/ui/vc_ui-tabs-line.js',
				'<%= go.js.srcPath %>editors/helpers/scrollToElement.js',
				'<%= go.js.srcPath %>editors/ui/helpers/vc_ui-helper-ajax.js',
				'<%= go.js.srcPath %>editors/ui/helpers/vc_ui-helper-prompts.js',
				'<%= go.js.srcPath %>editors/ui/helpers/vc_ui-helper-panel-view-draggable.js',
				'<%= go.js.srcPath %>editors/ui/helpers/vc_ui-helper-panel-view-resizable.js',
				'<%= go.js.srcPath %>editors/ui/helpers/vc_ui-helper-templates-panel-search.js',
				'<%= go.js.srcPath %>editors/ui/helpers/vc_ui-helper-panel-view-header-footer.js',
				'<%= go.js.srcPath %>editors/ui/helpers/vc_ui-helper-panel-settings-post-custom-layout.js',
				'<%= go.js.srcPath %>editors/ui/vc_ui-panel-template-window.js',
				'<%= go.js.srcPath %>editors/ui/vc_ui-panel-add-element.js',
				'<%= go.js.srcPath %>editors/ui/edit-element/vc_ui-extend-presets.js',
				'<%= go.js.srcPath %>editors/ui/edit-element/vc_ui-extend-templates.js',
				'<%= go.js.srcPath %>editors/ui/edit-element/vc_ui-panel-edit-element.js',
				'<%= go.js.srcPath %>editors/ui/templates/vc_ui-templates.js',
				'<%= go.js.srcPath %>editors/ui/vc_ui-panel-post-settings.js',
				'<%= go.js.srcPath %>editors/ui/vc_ui-panel-row-layout.js',
				'<%= go.js.srcPath %>editors/ui/vc_ui-panel-preset-settings.js',
				'<%= go.js.srcPath %>editors/ui/vc_ui-panel-seo-settings.js',
				'<%= go.js.srcPath %>editors/ui/partials/seo-analysis-view.js',
				'<%= go.js.srcPath %>backend/composer-tools.js',
				'<%= go.js.srcPath %>params/composer-atts.js',
				'<%= go.js.srcPath %>backend/composer-storage.js',
				'<%= go.js.srcPath %>backend/composer-models.js',
				'<%= go.js.srcPath %>backend/backend-shortcodes-core.js',
				'<%= go.js.srcPath %>lib/messages.js',
				'<%= go.js.srcPath %>backend/composer-view.js',
				'<%= go.js.srcPath %>backend/composer-custom-views.js',
				'<%= go.js.srcPath %>backend/media-editor.js',
				'<%= go.js.srcPath %>lib/vc-pointers/vc-pointer-message.js',
				'<%= go.js.srcPath %>lib/vc-pointers/vc-pointers-controller.js',
				'<%= go.js.srcPath %>lib/vc-pointers/pointers.js',
				'<%= go.js.srcPath %>lib/undoredo/undoredo.js',
				'<%= go.js.srcPath %>lib/undoredo/undoredo-ui-backend.js',
				'<%= go.js.srcPath %>lib/copy-paste.js',
				'<%= go.js.srcPath %>lib/ai/ai-modal.js',
				'<%= go.js.srcPath %>lib/ai/ai-form-view.js',
				'<%= go.js.srcPath %>lib/promo-popup.js',
			]
		},
		{
			dest: '<%= go.js.destPath %>grid-builder.min.js',
			src: [
				'<%= go.js.srcPath %>params/vc_grid_item/grid-builder-access-actions.js',
				'<%= go.js.srcPath %>params/vc_grid_item/editor.js',
			]
		},
		{
			dest: '<%= go.js.destPath %>frontend-editor.min.js',
			src: [
				'<%= go.js.srcPath %>lib/template.js',
				'<%= go.js.srcPath %>editors/ui/vc_ui-tabs-line.js',
				'<%= go.js.srcPath %>lib/events.js',
				'<%= go.js.srcPath %>frontend_editor/editors/ui/vc_ui-tabs-line.js',
				'<%= go.js.srcPath %>frontend_editor/editors/post-settings-editor.js',
				'<%= go.js.srcPath %>frontend_editor/editors/ui/vc_ui-extend-backbone.js',
				'<%= go.js.srcPath %>backend/composer-tools.js',
				'<%= go.js.srcPath %>backend/media-editor.js',
				'<%= go.js.srcPath %>params/composer-atts.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes_builder.js',
				'<%= go.js.srcPath %>frontend_editor/models.js',
				'<%= go.js.srcPath %>lib/seo/utils.js',
				'<%= go.js.srcPath %>lib/seo/storage.js',
				'<%= go.js.srcPath %>lib/seo/checks.js',
				'<%= go.js.srcPath %>frontend_editor/editors/panels.js',
				'<%= go.js.srcPath %>frontend_editor/editors/helpers/scrollToElement.js',
				'<%= go.js.srcPath %>frontend_editor/editors/ui/helpers/vc_ui-helper-ajax.js',
				'<%= go.js.srcPath %>frontend_editor/editors/ui/helpers/vc_ui-helper-prompts.js',
				'<%= go.js.srcPath %>frontend_editor/editors/ui/helpers/vc_ui-helper-panel-view-header-footer.js',
				'<%= go.js.srcPath %>frontend_editor/editors/ui/helpers/vc_ui-helper-panel-settings-post-custom-layout.js',
				'<%= go.js.srcPath %>frontend_editor/editors/ui/helpers/vc_ui-helper-templates-panel-search.js',
				'<%= go.js.srcPath %>frontend_editor/editors/ui/helpers/vc_ui-helper-panel-view-resizable.js',
				'<%= go.js.srcPath %>frontend_editor/editors/ui/helpers/vc_ui-helper-panel-view-draggable.js',
				'<%= go.js.srcPath %>frontend_editor/editors/ui/vc_ui-panel-template-window.js',
				'<%= go.js.srcPath %>frontend_editor/editors/ui/vc_ui-panel-add-element.js',
				'<%= go.js.srcPath %>frontend_editor/editors/ui/edit-element/vc_ui-extend-presets.js',
				'<%= go.js.srcPath %>frontend_editor/editors/ui/edit-element/vc_ui-extend-templates.js',
				'<%= go.js.srcPath %>frontend_editor/editors/ui/edit-element/vc_ui-panel-edit-element.js',
				'<%= go.js.srcPath %>frontend_editor/editors/ui/templates/vc_ui-templates.js',
				'<%= go.js.srcPath %>frontend_editor/editors/ui/vc_ui-panel-post-settings.js',
				'<%= go.js.srcPath %>frontend_editor/editors/ui/vc_ui-panel-row-layout.js',
				'<%= go.js.srcPath %>frontend_editor/editors/ui/vc_ui-panel-preset-settings.js',
				'<%= go.js.srcPath %>frontend_editor/editors/ui/vc_ui-panel-seo-settings.js',
				'<%= go.js.srcPath %>frontend_editor/editors/ui/partials/seo-analysis-view.js',
				'<%= go.js.srcPath %>lib/messages.js',
				'<%= go.js.srcPath %>frontend_editor/frontend_editor.js',
				'<%= go.js.srcPath %>frontend_editor/custom_views.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/containers/container.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/containers/container_with_parent.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/containers/vc_section.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/containers/vc_row.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/containers/vc_column.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/containers/vc_row_inner.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/containers/vc_column_inner.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/content/vc_column_text.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/charts/vc_pie.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/charts/vc_round_chart.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/charts/vc_line_chart.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/images/vc_single_image.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/images/vc_images_carousel.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/images/vc_gallery.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/content/vc_posts_slider.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/content/vc_toggle.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/content/vc_raw_js.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/grids/vc_basic_grid.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/grids/vc_masonry_grid.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/grids/vc_media_grid.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/grids/vc_masonry_media_grid.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/tta/vc_tta_accordion.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/tta/vc_tta_tabs.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/tta/vc_tta_tour.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/tta/vc_tta_toggle.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/tta/vc_tta_pageable.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/tta/vc_tta_section.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/tta/vc_tta_toggle_section.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/tta/tta_events.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/deprecated/vc_carousel.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/deprecated/tabs/vc_tabs.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/deprecated/tabs/vc_tour.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/deprecated/tabs/vc_tab.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/deprecated/tabs/vc_accordion.js',
				'<%= go.js.srcPath %>frontend_editor/shortcodes/deprecated/tabs/vc_accordion_tab.js',
				'<%= go.js.srcPath %>frontend_editor/build.js',
				'<%= go.js.srcPath %>lib/vc-pointers/vc-pointer-message.js',
				'<%= go.js.srcPath %>lib/vc-pointers/vc-pointers-controller.js',
				'<%= go.js.srcPath %>lib/vc-pointers/pointers.js',
				'<%= go.js.srcPath %>lib/undoredo/undoredo.js',
				'<%= go.js.srcPath %>lib/undoredo/undoredo-ui.js',
				'<%= go.js.srcPath %>lib/copy-paste.js',
				'<%= go.js.srcPath %>lib/ai/ai-modal.js',
				'<%= go.js.srcPath %>lib/ai/ai-form-view.js',
				'<%= go.js.srcPath %>lib/promo-popup.js',
			]
		},
		{
			dest: '<%= go.js.destPath %>page_editable.min.js',
			src: [
				'<%= go.js.srcPath %>frontend_editor/vc_page_editable.js',
				'<%= go.js.srcPath %>lib/vc-pointers/vc-pointer-message.js'
			]
		},
		{
			dest: '<%= go.js.destPath %>edit-form.min.js',
			src: [
				'<%= go.js.srcPath %>params/column_offset.js',
				'<%= go.js.srcPath %>params/css_editor.js',
				'<%= go.js.srcPath %>params/params_preset.js',
				'<%= go.js.srcPath %>params/all.js',
				'<%= go.js.srcPath %>params/vc_grid_item/param.js'
			]
		},
		{
			dest: '<%= go.js.destPath %>js_composer_front.min.js',
			src: [
				'<%= go.js.srcPath %>js_composer_front.js'
			]
		},
		{
			dest: '<%= go.js.destPath %>vc_grid.min.js',
			src: [
				'<%= go.js.srcPath %>components/vc_grid_style_all.js',
				'<%= go.js.srcPath %>components/vc_grid_style_load_more.js',
				'<%= go.js.srcPath %>components/vc_grid_style_lazy.js',
				'<%= go.js.srcPath %>components/vc_grid_style_pagination.js',
				'<%= go.js.srcPath %>components/vc_grid_style_all_masonry.js',
				'<%= go.js.srcPath %>components/vc_grid_style_lazy_masonry.js',
				'<%= go.js.srcPath %>components/vc_grid_style_load_more_masonry.js',
				'<%= go.js.srcPath %>components/vc_grid.js'
			]
		},
	];
	// Project configuration.
	grunt.initConfig( {
		// Task configuration.
		pkg: grunt.file.readJSON( 'package.json' ),
		go: globalOptions,

		// License banner text
		banner: '/*!\n' +
			' * <%= pkg.nativeName %> v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
			' * Copyright 2011-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
			' * License: Commercial. More details: <%= pkg.license %>\n' +
			' */\n',

		// License banner config
		// WARNING:
		// This task simply adds the banner to the head of the files that are specified,
		// it makes no attempt to see if a banner already exists and it is up to you
		// to ensure that the file should not already contain a banner.
		// So run this task to only to add banners to production-ready code.
		usebanner: {
			css: {
				options: {
					position: 'top',
					banner: '<%= banner %>',
					linebreak: true
				},
				files: {
					src: [
						'assets/css/*.css'
					]
				}
			},
			js: {
				options: {
					position: 'top',
					banner: '<%= banner %>\n' +
						'// jscs:disable\n' +
						'// jshint ignore: start\n',
					linebreak: true
				},
				files: {
					src: [
						'assets/**/*.min.js',
						'assets/lib/bower/**/*.js',
						'!assets/lib/owl-carousel2-dist/owl.carousel.min.js',
						'!assets/lib/chart-js-dist/chart.min.js',
						'!assets/lib/lightbox2/dist/js/lightbox.min.js',
						'!assets/lib/php.default/php.default.min.js',
						'!assets/lib/vc_waypoints/vc-waypoints.min.js'
					]
				}
			}
		},

		// Compile LESS files to CSS.
		less: {
			main: {
				options: {
					sourceMap: true,
					outputSourceFiles: true
				},
				files: [
					{
						expand: true,           // Enable dynamic expansion.
						cwd: globalOptions.less.srcPath,    // Src matches are relative to this path.
						src: globalOptions.less.srcFiles,   // Actual pattern(s) to match.
						dest: globalOptions.less.destPath,  // Destination path prefix.
						ext: '.min.css',            // Dest filepaths will have this extension.
						extDot: 'first'         // Extensions in filenames begin after the first dot
					},
					{
						'assets/lib/vc_carousel/css/vc_carousel.css': 'assets/lib/vc_carousel/less/vc_carousel.less'
					},
					{
						'assets/css/ui-custom-theme/jquery-ui-less.custom.min.css': 'assets/css/ui-custom-theme/less/jquery-ui-less.custom.less'
					}
				]
			},
			noMap: {
				options: {
					sourceMap: false,
					outputSourceFiles: false
				},
				files: [
					{
						expand: true,           // Enable dynamic expansion.
						cwd: globalOptions.less.srcPath,    // Src matches are relative to this path.
						src: globalOptions.less.srcFiles,   // Actual pattern(s) to match.
						dest: globalOptions.less.destPath,  // Destination path prefix.
						ext: '.min.css',            // Dest filepaths will have this extension.
						extDot: 'first'         // Extensions in filenames begin after the first dot
					},
					{
						'assets/lib/vc_carousel/css/vc_carousel.css': 'assets/lib/vc_carousel/less/vc_carousel.less'
					},
					{
						'assets/css/ui-custom-theme/jquery-ui-less.custom.min.css': 'assets/css/ui-custom-theme/less/jquery-ui-less.custom.less'
					}
				]
			}
		},

		// Add vendor prefixes on css rules
		postcss: {
			vcEditors: {
				options: {
					map: false,
					processors: [
						require( 'autoprefixer' )( { remove:true, overrideBrowserslist: globalOptions.browsers } )
					]
				},
				files: [
					{
						expand: true,
						cwd: globalOptions.less.destPath,
						src: [
							'*.min.css',
							//'!js_composer.min.css'
						],
						dest: globalOptions.less.destPath,
						ext: '.min.css'
					},
					{
						'assets/css/lib/isotope.css': 'assets/css/lib/isotope.css'
					},
					{
						'assets/css/lib/typicons/src/font/typicons.css': 'assets/css/lib/typicons/src/font/typicons.css'
					},
					{
						'assets/css/lib/vc-entypo/vc_entypo.css': 'assets/css/lib/vc-entypo/vc_entypo.css'
					},
					{
						'assets/css/lib/vc-linecons/vc_linecons_icons.css': 'assets/css/lib/vc-linecons/vc_linecons_icons.css'
					},
					{
						'assets/css/lib/vc-open-iconic/vc_openiconic.css': 'assets/css/lib/vc-open-iconic/vc_openiconic.css'
					},
					{
						'assets/css/ui-custom-theme/jquery-ui-less.custom.min.css': 'assets/css/ui-custom-theme/jquery-ui-less.custom.min.css'
					},
					{
						'assets/css/lib/monosocialiconsfont/monosocialiconsfont.css': 'assets/css/lib/monosocialiconsfont/monosocialiconsfont.css'
					},
					{
						'assets/css/lib/vc-material/vc_material.css': 'assets/css/lib/vc-material/vc_material.css'
					}
				]
			},
			lib: {
				options: {
					processors: [
						require( 'autoprefixer' )( { remove: true, overrideBrowserslist: globalOptions.browsers } )
					],
					map: false
				},
				files: [
					{
						expand: true,
						cwd: globalOptions.libPath,
						src: [
							'**/*.css',
							'!**/*.min.css',
							'!**/examples/*',
							'!**/demo/*',
							'!**/kitchen-sink/*',
							'!**/animate-css/source/*',
						],
						dest: globalOptions.libPath,
						ext: '.css'
					}
				]
			}
		},

		// Css min
		cssmin: {
			main: {
				files: [
					{
						expand: true,
						cwd: globalOptions.less.destPath,
						src: [ '*.min.css' ],
						dest: globalOptions.less.destPath,
						ext: '.min.css'
					}
				]
			},
			lib: {
				files: [
					{
						expand: true,
						cwd: globalOptions.libPath,
						src: [
							'**/*.css',
							'!**/*.min.css'
						],
						dest: globalOptions.libPath,
						ext: '.min.css'
					},
					{
						'assets/css/lib/isotope.min.css': 'assets/css/lib/isotope.css'
					},
					{
						'assets/css/lib/typicons/src/font/typicons.min.css': 'assets/css/lib/typicons/src/font/typicons.css'
					},
					{
						'assets/css/lib/vc-entypo/vc_entypo.min.css': 'assets/css/lib/vc-entypo/vc_entypo.css'
					},
					{
						'assets/css/lib/vc-linecons/vc_linecons_icons.min.css': 'assets/css/lib/vc-linecons/vc_linecons_icons.css'
					},
					{
						'assets/css/lib/vc-open-iconic/vc_openiconic.min.css': 'assets/css/lib/vc-open-iconic/vc_openiconic.css'
					},
					{
						'assets/css/ui-custom-theme/jquery-ui-less.custom.min.css': 'assets/css/ui-custom-theme/jquery-ui-less.custom.min.css'
					},
					{
						'assets/css/lib/monosocialiconsfont/monosocialiconsfont.min.css': 'assets/css/lib/monosocialiconsfont/monosocialiconsfont.css'
					},
					{
						'assets/css/lib/vc-material/vc_material.min.css': 'assets/css/lib/vc-material/vc_material.css'
					}
				]
			}
		},

		lesslint: {
			main: {
				files: [
					{
						expand: true,           // Enable dynamic expansion.
						cwd: globalOptions.less.srcPath,    // Src matches are relative to this path.
						src: globalOptions.less.srcFiles   // Actual pattern(s) to match.
					}
				]
			}
		},

		uglify: {
			options: {
				sourceMap: true,
				mangle: false,
				compress: true,
				beautify: false
			},
			main: {
				options: {
					compress: false,
					beautify: true
				},
				files: uglifyList
			},
			prod: {
				options: {
					sourceMap: false
				},
				files: uglifyList
			},
			lib: {
				options: {
					sourceMap: false
				},
				files: [
					{
						expand: true,
						cwd: '<%= go.libPath %>bower/bootstrap3/js/',
						src: [
							'**/*.js',
							'!**/*.min.js'
						],
						dest: '<%= go.libPath %>bower/bootstrap3/js/',
						ext: '.min.js'
					},
					{
						src: '<%= go.libPath %>bower/jquery-ui-tabs-rotate/jquery-ui-tabs-rotate.js',
						dest: '<%= go.libPath %>bower/jquery-ui-tabs-rotate/jquery-ui-tabs-rotate.min.js'
					},
					{
						expand: true,
						cwd: '<%= go.libPath %>bower/json-js/',
						src: [
							'**/*.js',
							'!**/*.min.js'
						],
						dest: '<%= go.libPath %>bower/json-js/',
						ext: '.min.js'
					},
					{
						src: '<%= go.libPath %>prettyphoto/js/jquery.prettyPhoto.js',
						dest: '<%= go.libPath %>prettyphoto/js/jquery.prettyPhoto.min.js'
					},
					{
						src: '<%= go.libPath %>bower/progress-circle/ProgressCircle.js',
						dest: '<%= go.libPath %>bower/progress-circle/ProgressCircle.min.js'
					},
					{
						src: '<%= go.libPath %>vc_chart/jquery.vc_chart.js',
						dest: '<%= go.libPath %>vc_chart/jquery.vc_chart.min.js'
					},
					{
						src: '<%= go.libPath %>vc_carousel/js/transition.js',
						dest: '<%= go.libPath %>vc_carousel/js/transition.min.js'
					},
					{
						src: '<%= go.libPath %>vc_carousel/js/vc_carousel.js',
						dest: '<%= go.libPath %>vc_carousel/js/vc_carousel.min.js'
					},
					{
						src: '<%= go.libPath %>vc_line_chart/vc_line_chart.js',
						dest: '<%= go.libPath %>vc_line_chart/vc_line_chart.min.js'
					},
					{
						src: '<%= go.libPath %>vc_round_chart/vc_round_chart.js',
						dest: '<%= go.libPath %>vc_round_chart/vc_round_chart.min.js'
					},
					{
						src: '<%= go.libPath %>vc-tta-autoplay/vc-tta-autoplay.js',
						dest: '<%= go.libPath %>vc-tta-autoplay/vc-tta-autoplay.min.js'
					},
					{
						src: '<%= go.libPath %>flexslider/jquery.flexslider.js',
						dest: '<%= go.libPath %>flexslider/jquery.flexslider.min.js'
					},
					{
						src: '<%= go.libPath %>vc_tabs/vc-tabs.js',
						dest: '<%= go.libPath %>vc_tabs/vc-tabs.min.js'
					},
					{
						src: '<%= go.libPath %>vc_image_zoom/vc_image_zoom.js',
						dest: '<%= go.libPath %>vc_image_zoom/vc_image_zoom.min.js'
					},
					{
						src: '<%= go.libPath %>vc_accordion/vc-accordion.js',
						dest: '<%= go.libPath %>vc_accordion/vc-accordion.min.js'
					}
				]
			}
		},

		// Run predefined tasks whenever watched file changed or deleted
		watch: {
			css: {
				options: {
					atBegin: true
				},
				files: [ 'assets/less/**/*.less' ],
				tasks: [
					'build-css',
					'postcss:lib'
				]
			},
			js: {
				options: {
					atBegin: true
				},
				files: [
					'assets/js/**/*.js',
					'!assets/js/dist/*.js'
				],
				tasks: [
					'build-js'
				]
			}
		}
	} );

	// These plugins provide necessary tasks.
	require( 'load-grunt-tasks' )( grunt );
	grunt.loadNpmTasks( 'grunt-composer' );

	// Common
	grunt.registerTask( 'prepare-lib',
		[
			'uglify:lib',
			'postcss:lib',
			'cssmin:lib'
		] );

	// Other
	grunt.registerTask( 'less-lint', [ 'recess:less' ] );

	// Dev
	grunt.registerTask( 'build-css',
		[
			'less:noMap',
			'postcss:vcEditors'
		] );
	grunt.registerTask( 'build-js',
		[
			'uglify:main'
		] );
	grunt.registerTask( 'build',
		[
			'build-css',
			'build-js',
			'prepare-lib',
			'usebanner'
		] );

	// Prod
	grunt.registerTask( 'build-css-prod',
		[
			'build-css',
			'cssmin:main'
		] );
	grunt.registerTask( 'build-js-prod',
		[
			'uglify:prod'
		] );
	grunt.registerTask( 'build-prod',
		[
			'build-css-prod',
			'build-js-prod',
			'prepare-lib',
			'usebanner'
		] );

	// Default task.
	grunt.registerTask( 'default', [ 'build' ] );
};
