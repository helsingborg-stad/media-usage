//Avoid Wordpress jQuery conflict
const $ = jQuery.noConflict();

module.exports = class Scanner
{
    constructor()
    {
        if (typeof(singleScanAjaxObject) != 'undefined') {
            this.jsRefreshUsage();
        }
    }

    jsRefreshUsage()
    {
        $(document).on('click', '.js-refresh-usage', function(e) {
            e.preventDefault();
            $('#attachment_usage').addClass('is-disabled');
            this.runMediaScanner();
        }.bind(this));
    }

    runMediaScanner()
    {
        $.ajax({
            url : singleScanAjaxObject.ajaxUrl,
            type : 'post',
            data : {
                action : 'scanUsageAjaxMethod',
                nonce : singleScanAjaxObject.nonce,
                attachments: [singleScanAjaxObject.attachment]
            },
            success : function(response, status) {
                this.reRenderUsage();
            }.bind(this),
        });
    }

    reRenderUsage()
    {
        $.ajax({
            url : singleScanAjaxObject.ajaxUrl,
            type : 'post',
            data : {
                action : 'outputUsageListAjaxMethod',
                nonce : singleScanAjaxObject.nonce,
                attachment: singleScanAjaxObject.attachment
            },
            success : function(response, status) {
                $('#attachment_usage').removeClass('is-disabled');
                $('.js-media-usage-wrapper').html(response);
            }.bind(this),
        });
    }
}
