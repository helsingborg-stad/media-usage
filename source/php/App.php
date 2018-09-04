<?php

namespace MediaUsage;

class App
{
    public function __construct()
    {
        add_action('admin_enqueue_scripts', array($this, 'enqueueStyles'));
        add_action('admin_enqueue_scripts', array($this, 'enqueueScripts'));
    }

    /**
     * Enqueue required style
     * @return void
     */
    public function enqueueStyles()
    {
        wp_register_style('cache-bust-plugin-css', MEDIAUSAGE_URL . '/dist/' . \MediaUsage\Helper\CacheBust::name('css/media-usage.css'));
    }

    /**
     * Enqueue required scripts
     * @return void
     */
    public function enqueueScripts()
    {
        wp_register_script('cache-bust-plugin-js', MEDIAUSAGE_URL . '/dist/' . \MediaUsage\Helper\CacheBust::name('js/media-usage.js'));
    }
}
