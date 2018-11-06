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
        // Scan media
        new BulkScan();
        new SingleScan();
    }

    deleteLink() {

        $(window).load(function () {

            let skipNextStep = false;

            $(document).on('click', '.attachment-preview', function (e) {

                let url = $('.media-modal-content').find('.setting .name').next('span').find('a').prop('href');
                let title = $('.media-modal-content').find('.setting .name').next('span').find('a').text();
                let removalID = $('.media-modal-content .attachment-details').attr('data-id');
                let removeUrl = 'post.php?action=delete&post='+removalID+'&_wpnonce='+hbgmedia.rmNonce;

                if (title) {

                    let imgUrl;

                    $('.media-modal-content .filename').each(function( index ) {
                        if(index == 0) {
                            $(this).find('strong').remove();
                            imgUrl = $(this).text().trim();
                        }
                    });

                    $('.media-modal-content .actions .delete-attachment').remove();
                    $('.media-modal-content .actions').append('<a data-imgname="'+imgUrl+'"  data-url="' + url + '"  onclick="return false;" href="'+removeUrl+'" class="checkDependencies">' + hbgmedia.deleteBtn + '</a>');
                }
                skipNextStep = true;
            });

            if (!skipNextStep) {

                $('.row-actions').each(function () {

                    let strong = $(this).closest('tr').find('.parent.column-parent').find('strong');

                    if (strong.length > 0) {
                        $(this).closest('tr').find('.filename span').remove();

                        let url = $(this).closest('tr').find('.parent.column-parent a').prop('href');
                        let imgUrl = $(this).closest('tr').find('.filename').text().trim();
                        let removeUrl = $(this).find('.delete a').attr('href');

                        $(this).find('.delete').addClass('hidden');
                        $(this).find('.edit').after('<span class="content-attached"><a data-imgname="'+imgUrl+'" data-url="' + url + '"  onclick="return false;" class="checkDependencies aria-button-if-js" href="'+removeUrl+'">' + hbgmedia.deleteBtn + '</a></span>  | ');
                    }
                });
            }
        });
    }

    warning() {

        $(document).on('click', '.checkDependencies', function (e) {

            let reg = new RegExp('[?&]' + 'post' + '=([^&#]*)', 'i');
            let stringHref = reg.exec($(this).attr('data-url'));
            let imgName = $(this).attr('data-imgname');

            if (stringHref) {
                let data = {
                    'action': 'getMediaPostTitle',
                    'nonce': hbgmedia.nonce,
                    'id': stringHref[1]
                };

                jQuery.post(hbgmedia.url, data, function (response) {

                    let confirDelete;
                    if (response) {
                        confirDelete = confirm(hbgmedia.response + ': ' + response);
                    }

                    if(confirDelete) {
                        let Removedata = {
                            'action': 'deleteAttachment',
                            'nonce': hbgmedia.nonce,
                            'id': stringHref[1],
                            'post_type': 'attachment',
                            'imgName' : imgName.trim()
                        };
                        jQuery.post(hbgmedia.url, Removedata, function (resp) {
                            location.href = 'upload.php';
                        });
                    }
                });
            }

        });
    }
}

new MediaUsage();
