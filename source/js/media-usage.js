'use strict';
const $ = jQuery.noConflict();
const BulkScan = require('./BulkScan.js');
const SingleScan = require('./SingleScan.js');


class MediaUsage {
    constructor() {

        this.warning();
        new BulkScan();
        new SingleScan();
        this.deleteLink();

    }


    deleteLink() {

        //runMediaScanner();
        $('.row-actions').css('left','0px');
        $(window).load(function() {

            $('.row-actions').each(function () {
                var url = $(this).find('.edit a').prop('href');

                $(this).find('.delete').addClass('hidden');
                $(this).find('.edit').after('<span class="content-attached"><a data-url="'+url+'"  onclick="return false;" class="checkDependencies aria-button-if-js" style="color:red;" href="">Radera permanent</a></span>  | ');
            });

        });
    }


    warning() {
        $(document).on('click', '.checkDependencies', function (e) {
            var href = $(this).attr('data-url');
            var reg = new RegExp( '[?&]' + 'post' + '=([^&#]*)', 'i' );
            var string = reg.exec(href);
            console.log(string[1]);
            var request = $.ajax({
                url : '/wp-json/wp/v2/posts/'+string[1],
                method: "GET",
                dataType: "json"
            });

            request.done(function( data ) {
                console.log(data);
                //$('#datainsert').html(data[0].content.rendered);
            });

            request.fail(function( jqXHR, textStatus ) {
                console.log('fail')
            });

        });
    }
}

new MediaUsage();
