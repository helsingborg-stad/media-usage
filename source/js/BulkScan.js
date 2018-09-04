//Avoid Wordpress jQuery conflict
const $ = jQuery.noConflict();

module.exports = class BulkScanner
{
    constructor()
    {
        if (typeof(bulkScanAjaxObject) != 'undefined') {
            this.init();
        }
    }

    init()
    {
        this.queue = bulkScanAjaxObject.attachments;
        this.attachments = bulkScanAjaxObject.attachments.length;

        this.scanChunkSize = bulkScanAjaxObject.limit;
        this.isScanning = false;

        this.jsRunScanClickEvent();
        this.jsStopScanClickEvent();
    }

    jsRunScanClickEvent()
    {
        $(document).on('click', '.js-run-scan', function(e) {
            e.preventDefault();
            $(e.target).hide();
            $('.js-scan-spinner').addClass('is-active');
            $('.js-stop-scan').show();
            this.isScanning = true;
            this.runMediaScanner();
        }.bind(this));
    }

    jsStopScanClickEvent()
    {
        $(document).on('click', '.js-stop-scan', function(e) {
            e.preventDefault();
            this.isScanning = false;
            $(e.target).hide();
            $('.js-scan-spinner').removeClass('is-active');
            $('.js-run-scan').show();
        }.bind(this));
    }

    runMediaScanner()
    {
        if (this.queue.length === 0 || this.isScanning === false) {
            return;
        }

        var attachmentsIdsToScan = this.queue.splice(0, this.scanChunkSize);

        $.ajax({
            url : bulkScanAjaxObject.ajaxUrl,
            type : 'post',
            data : {
                action : 'scanUsageAjaxMethod',
                nonce : bulkScanAjaxObject.nonce,
                attachments: attachmentsIdsToScan,
                queue: this.queue.length
            },
            success : function(response, status) {
                this.updateProgress();
                this.runMediaScanner();
            }.bind(this),
            error : function(jqXHR, status, error) {
            }
        });
    }

    updateProgress()
    {
        //Update scanned count
        if ($('.js-scanned').length > 0) {
            $('.js-scanned').text(this.attachments - this.queue.length);
        }

        //Update Precentage
        if ($('.js-progress').length > 0 && $('.js-progress').text() != this.getScanProgressInPrecentage()) {
            $('.js-progress').text(this.getScanProgressInPrecentage());
        }
    }

    getScanProgressInPrecentage()
    {
        return  Math.round((((this.attachments - this.queue.length) / this.attachments) * 100));
    }
}
