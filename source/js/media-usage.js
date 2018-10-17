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
                if (url != '') {
                    $(this).find('.delete').addClass('hidden');
                    $(this).find('.edit').after('<span class="content-attached"><a data-postType="" data-url="'+url+'"  onclick="return false;" class="checkDependencies aria-button-if-js" style="color:red;" href="">Radera permanent</a></span>  | ');
                }

            });
        });
    }


    warning() {

        $(document).on('click', '.checkDependencies', function (e) {

            var href = $(this).attr('data-url');
            var reg = new RegExp( '[?&]' + 'post' + '=([^&#]*)', 'i' );
            var string = reg.exec(href);
            console.log(href + ' - '+ string[1]);

            var data = {
                'action': 'getMediaPostType',
                'nonce' : hbgmedia.nonce,
                'id': string[1]
            };

            jQuery.post(hbgmedia.url, data, function(response) {
                alert('Bilagan är kopplad till följande: '+response);
            });

        });
    }
}

new MediaUsage();
