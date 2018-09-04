<?php
namespace MediaUsage\MediaLibrary;

class BulkScan
{
    public static $optionsPage = 'Bulk scan';
    public function __construct()
    {
        add_action('MediaUsage/App/enqueueScriptsAndStyles', array($this, 'enableScriptAndStyles'));
        add_action('admin_enqueue_scripts', array($this, 'localizeScriptData'), 10);
        add_action('acf/init', array($this, 'createOptionsPage'));
        add_action('admin_init', array($this, 'createMetaBox'), 10, 1);
    }

    public function createMetaBox()
    {
        if (!self::isBulkScanPage()) {
            return;
        }

        add_meta_box(
            'media-scanner',
            __( 'Bulk Scanner', 'textdomain' ),
            '\MediaUsage\MediaLibrary\BulkScan::renderBulkScanner',
            'acf_options_page',
            'normal'
        );
    }

    public function createOptionsPage()
    {
        if (!function_exists('acf_add_options_page')) {
            return;
        }

        acf_add_options_sub_page(array(
            'page_title'    => self::$optionsPage,
            'menu_title'    => self::$optionsPage,
            'parent_slug'   => 'upload.php',
        ));
    }

    public function localizeScriptData()
    {
        if (!self::isBulkScanPage()) {
            return;
        }

        $data = array();
        $data['ajaxUrl'] = admin_url('admin-ajax.php');
        $data['nonce'] = wp_create_nonce('mediaUsageNonce');
        $data['limit'] = 64;
        $data['attachments'] =  \MediaUsage\Helper\Attachment::getAttachmentIds();
        wp_localize_script('hbg-media-usage-js', 'bulkScanAjaxObject', $data);
    }

    public function enableScriptAndStyles($boolean)
    {
        if (!self::isBulkScanPage()) {
            return $boolean;
        }

        return true;
    }

    public static function renderBulkScanner()
    {
        $output = array();

        $attachments = \MediaUsage\Helper\Attachment::getAttachmentIds();
        $queue = \MediaUsage\Helper\Attachment::getAttachmentIds();
        $scanned = count($attachments) - count($queue);
        $progress = round(($scanned / count($attachments)) * 100);

        $output[] = '<div class="media-scanner">';
        $output[] = '<b>' . __('Scanned attachments', 'media-usage') . '</b>: <span class="scanned js-scanned">' . $scanned . '</span> of ';
        $output[] = '<span class="total">' . count($attachments) . '</span>';
        $output[] = '<span class="scan-progress js-progress">' . $progress . '</span>';
        $output[] = '</div>';

        $output[] = '<div>';
        $output[] = '<input class="button-primary js-run-scan" type="submit" name="Example" value="' . __('Run scan', 'media-usage') . '"/>';
        $output[] = '<input class="button-primary js-stop-scan" type="submit" name="Example" style="display: none;" value="' . __('Stop scan', 'media-usage') . '"/>';
        $output[] = '<div class="spinner js-scan-spinner"></div>';
        $output[] = '</div>';
        echo implode('', $output);
    }

    public static function isBulkScanPage()
    {
        if (!is_admin()) {
            return false;
        }

        if (!isset($_GET['page']) || $_GET['page'] !== 'acf-options-' . sanitize_title(self::$optionsPage)) {
            return false;
        }

        return true;
    }
}
