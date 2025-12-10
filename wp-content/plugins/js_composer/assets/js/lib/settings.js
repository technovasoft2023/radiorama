(function ( $ ) {
    'use strict';
    if ( _.isUndefined( window.vc ) ) {
        window.vc = {};
    }
    window.Vc_settingsModules = Backbone.View.extend( {
        el: '#vc_settings-modules',
        events: {
            'change .module-toggle': 'setModulesValues',
        },

        setModulesValues: function () {
            var modules = {};
            $('.module-toggle').each(function () {
                modules[this.id] = !!this.checked;
            });
            $('#wpb_js_modules').val(JSON.stringify(modules));
        },

    } );
    $(document).ready(function () {
        window.vc.settingModules = new window.Vc_settingsModules ();
        $('.edit-form-info').initializeTooltips('.form-table');
    });
})( window.jQuery );

