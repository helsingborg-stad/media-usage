<?php

/**
 * Plugin Name:       Media Usage
 * Plugin URI:        https://github.com/helsingborg-stad/media-usage
 * Description:       Track the use of attachments across posts, meta and options.
 * Version: 3.0.4
 * Author:            Nikolas Ramstedt, Johan Silvergrund
 * Author URI:        https://github.com/helsingborg-stad
 * License:           MIT
 * License URI:       https://opensource.org/licenses/MIT
 * Text Domain:       media-usage
 * Domain Path:       /languages
 */

 // Protect agains direct file access
if (! defined('WPINC')) {
    die;
}

define('MEDIAUSAGE_PATH', plugin_dir_path(__FILE__));
define('MEDIAUSAGE_URL', plugins_url('', __FILE__));
define('MEDIAUSAGE_TEMPLATE_PATH', MEDIAUSAGE_PATH . 'templates/');


add_action('plugins_loaded', function () {
    load_plugin_textdomain('media-usage', false, plugin_basename(dirname(__FILE__)) . '/languages');
});

// Autoload from plugin
if (file_exists(MEDIAUSAGE_PATH . 'vendor/autoload.php')) {
    require_once MEDIAUSAGE_PATH . 'vendor/autoload.php';
}
require_once MEDIAUSAGE_PATH . 'Public.php';

add_action('plugins_loaded', function () {
    new MediaUsage\App();
});

// Install & Uninstall actions
register_activation_hook(__FILE__, 'MediaTracker\App::checkInstall');
register_uninstall_hook(__FILE__, 'MediaTracker\App::uninstall');
