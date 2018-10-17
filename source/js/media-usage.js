'use strict';
const $ = jQuery.noConflict();
const BulkScan = require('./BulkScan.js');
const SingleScan = require('./SingleScan.js');


class MediaUsage {

    constructor() {
        if (typeof(getPostType) != 'undefined') {
            this.jsRefreshUsage();
        }
        // Warn user when deleting media in library
        this.warning();
        this.deleteLink();

        // Scar media
        new BulkScan();
        new SingleScan();


    }


    deleteLink() {

        $(window).load(function() {

            $('.row-actions').each(function () {
                var url = $(this).closest('tr').find('.parent.column-parent a').prop('href');
                var strong = $(this).closest('tr').find('.parent.column-parent a').find('strong');
                if (strong) {
                    $(this).find('.delete').addClass('hidden');
                    $(this).find('.edit').after('<span class="content-attached"><a data-postType="" data-url="'+url+'"  onclick="return false;" class="checkDependencies aria-button-if-js" href="">Radera permanent</a></span>  | ');
                }
            });
        });
    }

    warning() {

        $(document).on('click', '.checkDependencies', function (e) {
            var reg = new RegExp( '[?&]' + 'post' + '=([^&#]*)', 'i' );
            var stringHref = reg.exec($(this).attr('data-url'));

            if (stringHref){
                var data = {
                    'action': 'getMediaPostType',
                    'nonce' : hbgmedia.nonce,
                    'id': stringHref[1]
                };

                jQuery.post(hbgmedia.url, data, function(response) {
                    if (response) {
                        var confirmResponse = confirm(hbgmedia.response + ': '+response);
                    }
                    if (confirmResponse) {
                        return showNotice.warn();
                    };
                });
            }
            else {
                return showNotice.warn();
            }
        });
    }
}

new MediaUsage();
