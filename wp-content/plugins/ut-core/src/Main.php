<?php
/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * Also maintains the unique identifier of this plugin as well as the current
 * version of the plugin.
 *
 * @since      1.0.0
 *
 * @package    UTCore
 *
 */

namespace UTCore;


class Main {
    /**
     * The loader that's responsible for maintaining and registering all hooks that power
     * the plugin.
     *
     * @since    1.0.0
     *
     * @var UTCore\utils\Loader maintains and registers all hooks for the plugin
     */
    protected $loader;

    /**
     * The unique identifier of this plugin.
     *
     * @since    1.0.0
     *
     * @var string the string used to uniquely identify this plugin
     */
    protected $plugin_name;

    /**
     * The current version of the plugin.
     *
     * @since    1.0.0
     *
     * @var string the current version of the plugin
     */
    protected $version;

    /**
     * Define the core functionality of the plugin.
     *
     * Set the plugin name and the plugin version that can be used throughout the plugin.
     * Load the dependencies, define the locale, and set the hooks for the admin area and
     * the public-facing side of the site.
     *
     * @since    1.0.0
     */
    public function __construct()
    {
        $this->plugin_name = 'ut-core';
        $this->version = '1.0.0';
        $this->loader = new utils\Loader();
        $this->setLocale();
        $this->defineAdminHooks();
        $this->definePublicHooks();
    }

    /**
     * Define the locale for this plugin for internationalization.
     *
     * Uses the utils\Internationalization class in order to set the domain and to register the hook
     * with WordPress.
     *
     * @since    1.0.0
     */
    private function setLocale()
    {
        $plugin_i18n = new utils\Internationalization();

        $this->loader->addAction( 'plugins_loaded', $plugin_i18n, 'loadPluginTextdomain' );
    }

    /**
     * Register all of the hooks related to the admin area functionality
     * of the plugin.
     *
     * @since    1.0.0
     */
    private function defineAdminHooks()
    {
        $images = new admin\Images();
        $plugin_admin = new admin\Controller( $this->getUTCore(), $this->getVersion() );
        $this->loader->addAction( 'admin_enqueue_scripts', $images, 'enqueue_assets' );
        $this->loader->addAction( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_styles' );
        $this->loader->addAction( 'wp_ajax_ut_clean_processed_images', $images, 'clean_proccesed_images' );
        $this->loader->addAction( 'wp_ajax_ut_count_attachments', $images, 'count_attachments' );
        $this->loader->addFilter( 'user_contactmethods', $plugin_admin, 'user_contact_methods', 11, 1 );
        $this->loader->addFilter( 'upload_mimes', $plugin_admin, 'upload_mimes' );
        $this->loader->addAction( 'wp_ajax_ut_upload_font', $plugin_admin, 'ajax_upload_fonts' );
        $this->loader->addAction( 'admin_menu', $plugin_admin, 'x_admin_page' );
        $this->loader->addAction( 'admin_init', $plugin_admin, 'x_settings' );
    }

    /**
     * Register all of the hooks related to the public-facing functionality
     * of the plugin.
     *
     * @since    1.0.0
     */
    private function definePublicHooks()
    {
        $plugin_public = new front\Controller( $this->getUTCore(), $this->getVersion() );
        $this->loader->addAction( 'widgets_init', $plugin_public, 'register_widgets' );
    }
    /**
     * Run the loader to execute all of the hooks with WordPress.
     *
     * @since    1.0.0
     */
    public function run()
    {
        $this->loader->run();
    }

    /**
     * The name of the plugin used to uniquely identify it within the context of
     * WordPress and to define internationalization functionality.
     *
     * @since     1.0.0
     *
     * @return string the name of the plugin
     */
    public function getUTCore()
    {
        return $this->plugin_name;
    }

    /**
     * The reference to the class that orchestrates the hooks with the plugin.
     *
     * @since     1.0.0
     *
     * @return UTCore\utils\Loader orchestrates the hooks of the plugin
     */
    public function getLoader()
    {
        return $this->loader;
    }

    /**
     * Retrieve the version number of the plugin.
     *
     * @since     1.0.0
     *
     * @return string the version number of the plugin
     */
    public function getVersion()
    {
        return $this->version;
    }
}