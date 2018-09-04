<?php
namespace MediaUsage\MediaLibrary;

class Edit
{
    public function __construct()
    {
        add_action('add_meta_boxes_attachment', array($this, 'addMetaBox'), 10, 1);
        add_action('MediaUsage/App/enqueueScriptsAndStyles', array($this, 'enableScriptAndStyles'), 8);
        add_action('admin_enqueue_scripts', array($this, 'localizeScriptData'), 10);
        add_action('wp_ajax_outputUsageListAjaxMethod', array($this, 'outputUsageListAjaxMethod'));
    }

    public function addMetaBox()
    {
        add_meta_box(
            'attachment_usage',
            __( 'Attachment usage', 'media-usage'),
            '\MediaUsage\MediaLibrary\Edit::renderAttachmentUsage',
            'attachment',
            'side'
        );
    }

    public function enableScriptAndStyles($boolean)
    {
        if (get_current_screen()->base != 'post' || get_current_screen()->post_type != 'attachment' ) {
            return $boolean;
        }

        return true;
    }

    public function localizeScriptData()
    {
        if (get_current_screen()->base != 'post' || get_current_screen()->post_type != 'attachment' ) {
            return;
        }

        $data = array();
        $data['ajaxUrl'] = admin_url('admin-ajax.php');
        $data['nonce'] = wp_create_nonce('mediaUsageNonce');
        $data['attachment'] =  $_GET['post'];
        wp_localize_script('hbg-media-usage-js', 'singleScanAjaxObject', $data);
    }

    public function outputUsageListAjaxMethod()
    {
        if (!defined('DOING_AJAX') || !DOING_AJAX) {
            return false;
        }

        if (!wp_verify_nonce($_POST['nonce'], 'mediaUsageNonce')) {
            die('Busted!');
        }

        if (!isset($_POST['attachment']) || !$_POST['attachment']) {
            return;
        }

        self::outputUsageList($_POST['attachment']);

        die;
    }

    public static function renderAttachmentUsage()
    {
        if (!isset($_GET['post']) || empty($_GET['post'])) {
            return;
        }

        $output = '';

        ob_start(); ?>

        <div class="js-media-usage-wrapper">
            <?php self::outputUsageList($_GET['post']); ?>
        </div>

        <a href="#" class="dashicons dashicons-image-rotate js-refresh-usage"></a>

        <div class="loader-overlay">
            <div class="spinner is-active"></div>
        </div>
        <?php  ob_end_flush();
    }

    public static function outputUsageList($id, $echo = true)
    {
        //Bail if attachment has not been scanned
        if (!get_post_meta($id, 'media_scanner_last_scan', true)) {
            $message = __('Attachment has not been scanned yet', 'media-usage');
            if ($echo) {
                echo $message;
            }

            return $message;
        }

        $relations = array_map('\MediaUsage\MediaLibrary\Edit::mapRelations', \MediaUsage\Helper\Relations::getRelationsGrouped($id));

        //Bail if has no attachments
        if (0 >= count($relations)) {
            $message = __('No usage found', 'media-usage');
            if ($echo) {
                echo $message;
            }

            return $message;
        }

        ob_start(); ?>

        <ul class="media-usage">
            <?php foreach ($relations as $relation): ?>
                <li class="media-usage__item">
                    <div class="media-usage__left">
                        <?php if (isset($relation['url'])): ?>
                            <a href="<?php echo $relation['url']; ?>"><?php echo $relation['title']; ?></a>
                        <?php else: ?>
                            <span><?php echo $relation['title']; ?></span>
                        <?php endif; ?>
                    </div>
                    <div class="media-usage__right">
                        <?php echo $relation['type'];  ?>
                    </div>
                </li>
            <?php endforeach; ?>
        </ul>

        <?php
        $output = ob_get_contents();
        ob_end_clean();

        if ($echo) {
            echo $output;
        }

        return $output;
    }

    public function mapRelations($relation)
    {
        switch ($relation['type']) {
            case 'post':
                $relation['title'] = get_the_title($relation['id']);
                $relation['url'] = get_edit_post_link($relation['id']);
                $relation['type'] = get_post_type($relation['id']);
            break;
            case 'term':
                $term = get_term($relation['id']);
                $relation['title'] = $term->name;
                $relation['url'] = get_edit_term_link($relation['id']);
                $relation['type'] = $term->taxonomy;
            break;
            case 'option':
                $relation['title'] = $relation['option_name'];
            break;
        }

        return $relation;
    }
}
