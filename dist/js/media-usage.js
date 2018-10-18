(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//Avoid Wordpress jQuery conflict
var $ = jQuery.noConflict();

module.exports = function () {
    function BulkScanner() {
        _classCallCheck(this, BulkScanner);

        if (typeof bulkScanAjaxObject != 'undefined') {
            this.init();
        }
    }

    _createClass(BulkScanner, [{
        key: 'init',
        value: function init() {
            this.queue = bulkScanAjaxObject.attachments;
            this.attachments = bulkScanAjaxObject.attachments.length;

            this.scanChunkSize = bulkScanAjaxObject.limit;
            this.isScanning = false;

            this.jsRunScanClickEvent();
            this.jsStopScanClickEvent();
        }
    }, {
        key: 'jsRunScanClickEvent',
        value: function jsRunScanClickEvent() {
            $(document).on('click', '.js-run-scan', function (e) {
                e.preventDefault();
                $(e.target).hide();
                $('.js-scan-spinner').addClass('is-active');
                $('.js-stop-scan').show();
                this.isScanning = true;
                this.runMediaScanner();
            }.bind(this));
        }
    }, {
        key: 'jsStopScanClickEvent',
        value: function jsStopScanClickEvent() {
            $(document).on('click', '.js-stop-scan', function (e) {
                e.preventDefault();
                this.isScanning = false;
                $(e.target).hide();
                $('.js-scan-spinner').removeClass('is-active');
                $('.js-run-scan').show();
            }.bind(this));
        }
    }, {
        key: 'runMediaScanner',
        value: function runMediaScanner() {
            if (this.queue.length === 0 || this.isScanning === false) {
                var spinner = $('.js-scan-spinner');
                if (spinner.hasClass('is-active')) {
                    spinner.removeClass('is-active');
                    $('.js-stop-scan').hide();
                    $('.js-run-scan').show();
                }

                return;
            }

            var attachmentsIdsToScan = this.queue.splice(0, this.scanChunkSize);

            $.ajax({
                url: bulkScanAjaxObject.ajaxUrl,
                type: 'post',
                data: {
                    action: 'scanUsageAjaxMethod',
                    nonce: bulkScanAjaxObject.nonce,
                    attachments: attachmentsIdsToScan,
                    queue: this.queue.length
                },
                success: function (response, status) {
                    this.updateProgress();
                    this.runMediaScanner();
                }.bind(this),
                error: function error(jqXHR, status, _error) {}
            });
        }
    }, {
        key: 'updateProgress',
        value: function updateProgress() {
            //Update scanned count
            if ($('.js-scanned').length > 0) {
                $('.js-scanned').text(this.attachments - this.queue.length);
            }

            //Update Precentage
            if ($('.js-progress').length > 0 && $('.js-progress').text() != this.getScanProgressInPrecentage()) {
                $('.js-progress').text(this.getScanProgressInPrecentage());
            }
        }
    }, {
        key: 'getScanProgressInPrecentage',
        value: function getScanProgressInPrecentage() {
            return Math.round((this.attachments - this.queue.length) / this.attachments * 100);
        }
    }]);

    return BulkScanner;
}();

},{}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//Avoid Wordpress jQuery conflict
var $ = jQuery.noConflict();

module.exports = function () {
    function Scanner() {
        _classCallCheck(this, Scanner);

        if (typeof singleScanAjaxObject != 'undefined') {
            this.jsRefreshUsage();
        }
    }

    _createClass(Scanner, [{
        key: 'jsRefreshUsage',
        value: function jsRefreshUsage() {
            $(document).on('click', '.js-refresh-usage', function (e) {
                e.preventDefault();
                $('#attachment_usage').addClass('is-disabled');
                this.runMediaScanner();
            }.bind(this));
        }
    }, {
        key: 'runMediaScanner',
        value: function runMediaScanner() {
            $.ajax({
                url: singleScanAjaxObject.ajaxUrl,
                type: 'post',
                data: {
                    action: 'scanUsageAjaxMethod',
                    nonce: singleScanAjaxObject.nonce,
                    attachments: [singleScanAjaxObject.attachment]
                },
                success: function (response, status) {
                    this.reRenderUsage();
                }.bind(this)
            });
        }
    }, {
        key: 'reRenderUsage',
        value: function reRenderUsage() {
            $.ajax({
                url: singleScanAjaxObject.ajaxUrl,
                type: 'post',
                data: {
                    action: 'outputUsageListAjaxMethod',
                    nonce: singleScanAjaxObject.nonce,
                    attachment: singleScanAjaxObject.attachment
                },
                success: function (response, status) {
                    $('#attachment_usage').removeClass('is-disabled');
                    $('.js-media-usage-wrapper').html(response);
                }.bind(this)
            });
        }
    }]);

    return Scanner;
}();

},{}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = jQuery.noConflict();
var BulkScan = require('./BulkScan.js');
var SingleScan = require('./SingleScan.js');

var MediaUsage = function () {
    function MediaUsage() {
        _classCallCheck(this, MediaUsage);

        if (typeof getPostType != 'undefined') {
            this.jsRefreshUsage();
        }
        // Warn user when deleting media in library
        this.warning();
        this.deleteLink();

        // Scan media
        new BulkScan();
        new SingleScan();
    }

    _createClass(MediaUsage, [{
        key: 'deleteLink',
        value: function deleteLink() {

            $(window).load(function () {

                var skipNextStep = false;

                $(document).on('click', '.attachment-preview', function (e) {
                    var url = $('.media-modal-content').find('.setting .name').next('span').find('a').prop('href');
                    var title = $('.media-modal-content').find('.setting .name').next('span').find('a').text();
                    if (title) {
                        $('.media-modal-content .actions').find('.delete-attachment').remove();
                        $('.media-modal-content .actions').append('<a data-url="' + url + '"  onclick="return false;" href="" class="checkDependencies">' + hbgmedia.deleteBtn + '</a>');
                    }
                    skipNextStep = true;
                });

                if (!skipNextStep) {
                    $('.row-actions').each(function () {
                        var url = $(this).closest('tr').find('.parent.column-parent a').prop('href');
                        var strong = $(this).closest('tr').find('.parent.column-parent a').find('strong');
                        if (strong) {
                            $(this).find('.delete').addClass('hidden');
                            $(this).find('.edit').after('<span class="content-attached"><a data-url="' + url + '"  onclick="return false;" class="checkDependencies aria-button-if-js" href="">' + hbgmedia.deleteBtn + '</a></span>  | ');
                        }
                    });
                }
            });
        }
    }, {
        key: 'warning',
        value: function warning() {

            $(document).on('click', '.checkDependencies', function (e) {
                var reg = new RegExp('[?&]' + 'post' + '=([^&#]*)', 'i');
                var stringHref = reg.exec($(this).attr('data-url'));

                if (stringHref) {
                    var data = {
                        'action': 'getMediaPostTitle',
                        'nonce': hbgmedia.nonce,
                        'id': stringHref[1]
                    };

                    jQuery.post(hbgmedia.url, data, function (response) {
                        if (response) {
                            var confirmResponse = confirm(hbgmedia.response + ': ' + response);
                        }
                        if (confirmResponse) {
                            return showNotice.warn();
                        }
                    });
                } else {
                    return showNotice.warn();
                }
            });
        }
    }]);

    return MediaUsage;
}();

new MediaUsage();

},{"./BulkScan.js":1,"./SingleScan.js":2}]},{},[3]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtZWRpYS11c2FnZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpKHsxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuLy9Bdm9pZCBXb3JkcHJlc3MgalF1ZXJ5IGNvbmZsaWN0XG52YXIgJCA9IGpRdWVyeS5ub0NvbmZsaWN0KCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEJ1bGtTY2FubmVyKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQnVsa1NjYW5uZXIpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgYnVsa1NjYW5BamF4T2JqZWN0ICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhCdWxrU2Nhbm5lciwgW3tcbiAgICAgICAga2V5OiAnaW5pdCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICAgICAgdGhpcy5xdWV1ZSA9IGJ1bGtTY2FuQWpheE9iamVjdC5hdHRhY2htZW50cztcbiAgICAgICAgICAgIHRoaXMuYXR0YWNobWVudHMgPSBidWxrU2NhbkFqYXhPYmplY3QuYXR0YWNobWVudHMubGVuZ3RoO1xuXG4gICAgICAgICAgICB0aGlzLnNjYW5DaHVua1NpemUgPSBidWxrU2NhbkFqYXhPYmplY3QubGltaXQ7XG4gICAgICAgICAgICB0aGlzLmlzU2Nhbm5pbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgdGhpcy5qc1J1blNjYW5DbGlja0V2ZW50KCk7XG4gICAgICAgICAgICB0aGlzLmpzU3RvcFNjYW5DbGlja0V2ZW50KCk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2pzUnVuU2NhbkNsaWNrRXZlbnQnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24ganNSdW5TY2FuQ2xpY2tFdmVudCgpIHtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuanMtcnVuLXNjYW4nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAkKGUudGFyZ2V0KS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjYW4tc3Bpbm5lcicpLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAkKCcuanMtc3RvcC1zY2FuJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNTY2FubmluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5ydW5NZWRpYVNjYW5uZXIoKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ2pzU3RvcFNjYW5DbGlja0V2ZW50JyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGpzU3RvcFNjYW5DbGlja0V2ZW50KCkge1xuICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5qcy1zdG9wLXNjYW4nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2Nhbm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAkKGUudGFyZ2V0KS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgJCgnLmpzLXNjYW4tc3Bpbm5lcicpLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAkKCcuanMtcnVuLXNjYW4nKS5zaG93KCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdydW5NZWRpYVNjYW5uZXInLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcnVuTWVkaWFTY2FubmVyKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucXVldWUubGVuZ3RoID09PSAwIHx8IHRoaXMuaXNTY2FubmluZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3Bpbm5lciA9ICQoJy5qcy1zY2FuLXNwaW5uZXInKTtcbiAgICAgICAgICAgICAgICBpZiAoc3Bpbm5lci5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgc3Bpbm5lci5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgICQoJy5qcy1zdG9wLXNjYW4nKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICQoJy5qcy1ydW4tc2NhbicpLnNob3coKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBhdHRhY2htZW50c0lkc1RvU2NhbiA9IHRoaXMucXVldWUuc3BsaWNlKDAsIHRoaXMuc2NhbkNodW5rU2l6ZSk7XG5cbiAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgdXJsOiBidWxrU2NhbkFqYXhPYmplY3QuYWpheFVybCxcbiAgICAgICAgICAgICAgICB0eXBlOiAncG9zdCcsXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdzY2FuVXNhZ2VBamF4TWV0aG9kJyxcbiAgICAgICAgICAgICAgICAgICAgbm9uY2U6IGJ1bGtTY2FuQWpheE9iamVjdC5ub25jZSxcbiAgICAgICAgICAgICAgICAgICAgYXR0YWNobWVudHM6IGF0dGFjaG1lbnRzSWRzVG9TY2FuLFxuICAgICAgICAgICAgICAgICAgICBxdWV1ZTogdGhpcy5xdWV1ZS5sZW5ndGhcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSwgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUHJvZ3Jlc3MoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ydW5NZWRpYVNjYW5uZXIoKTtcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIGVycm9yKGpxWEhSLCBzdGF0dXMsIF9lcnJvcikge31cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICd1cGRhdGVQcm9ncmVzcycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVQcm9ncmVzcygpIHtcbiAgICAgICAgICAgIC8vVXBkYXRlIHNjYW5uZWQgY291bnRcbiAgICAgICAgICAgIGlmICgkKCcuanMtc2Nhbm5lZCcpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAkKCcuanMtc2Nhbm5lZCcpLnRleHQodGhpcy5hdHRhY2htZW50cyAtIHRoaXMucXVldWUubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9VcGRhdGUgUHJlY2VudGFnZVxuICAgICAgICAgICAgaWYgKCQoJy5qcy1wcm9ncmVzcycpLmxlbmd0aCA+IDAgJiYgJCgnLmpzLXByb2dyZXNzJykudGV4dCgpICE9IHRoaXMuZ2V0U2NhblByb2dyZXNzSW5QcmVjZW50YWdlKCkpIHtcbiAgICAgICAgICAgICAgICAkKCcuanMtcHJvZ3Jlc3MnKS50ZXh0KHRoaXMuZ2V0U2NhblByb2dyZXNzSW5QcmVjZW50YWdlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdnZXRTY2FuUHJvZ3Jlc3NJblByZWNlbnRhZ2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0U2NhblByb2dyZXNzSW5QcmVjZW50YWdlKCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGgucm91bmQoKHRoaXMuYXR0YWNobWVudHMgLSB0aGlzLnF1ZXVlLmxlbmd0aCkgLyB0aGlzLmF0dGFjaG1lbnRzICogMTAwKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBCdWxrU2Nhbm5lcjtcbn0oKTtcblxufSx7fV0sMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8vQXZvaWQgV29yZHByZXNzIGpRdWVyeSBjb25mbGljdFxudmFyICQgPSBqUXVlcnkubm9Db25mbGljdCgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTY2FubmVyKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2Nhbm5lcik7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBzaW5nbGVTY2FuQWpheE9iamVjdCAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhpcy5qc1JlZnJlc2hVc2FnZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFNjYW5uZXIsIFt7XG4gICAgICAgIGtleTogJ2pzUmVmcmVzaFVzYWdlJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGpzUmVmcmVzaFVzYWdlKCkge1xuICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5qcy1yZWZyZXNoLXVzYWdlJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgJCgnI2F0dGFjaG1lbnRfdXNhZ2UnKS5hZGRDbGFzcygnaXMtZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJ1bk1lZGlhU2Nhbm5lcigpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncnVuTWVkaWFTY2FubmVyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJ1bk1lZGlhU2Nhbm5lcigpIHtcbiAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgdXJsOiBzaW5nbGVTY2FuQWpheE9iamVjdC5hamF4VXJsLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdwb3N0JyxcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3NjYW5Vc2FnZUFqYXhNZXRob2QnLFxuICAgICAgICAgICAgICAgICAgICBub25jZTogc2luZ2xlU2NhbkFqYXhPYmplY3Qubm9uY2UsXG4gICAgICAgICAgICAgICAgICAgIGF0dGFjaG1lbnRzOiBbc2luZ2xlU2NhbkFqYXhPYmplY3QuYXR0YWNobWVudF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSwgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVSZW5kZXJVc2FnZSgpO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JlUmVuZGVyVXNhZ2UnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gcmVSZW5kZXJVc2FnZSgpIHtcbiAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgdXJsOiBzaW5nbGVTY2FuQWpheE9iamVjdC5hamF4VXJsLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdwb3N0JyxcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ291dHB1dFVzYWdlTGlzdEFqYXhNZXRob2QnLFxuICAgICAgICAgICAgICAgICAgICBub25jZTogc2luZ2xlU2NhbkFqYXhPYmplY3Qubm9uY2UsXG4gICAgICAgICAgICAgICAgICAgIGF0dGFjaG1lbnQ6IHNpbmdsZVNjYW5BamF4T2JqZWN0LmF0dGFjaG1lbnRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSwgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgICQoJyNhdHRhY2htZW50X3VzYWdlJykucmVtb3ZlQ2xhc3MoJ2lzLWRpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICQoJy5qcy1tZWRpYS11c2FnZS13cmFwcGVyJykuaHRtbChyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBTY2FubmVyO1xufSgpO1xuXG59LHt9XSwzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyICQgPSBqUXVlcnkubm9Db25mbGljdCgpO1xudmFyIEJ1bGtTY2FuID0gcmVxdWlyZSgnLi9CdWxrU2Nhbi5qcycpO1xudmFyIFNpbmdsZVNjYW4gPSByZXF1aXJlKCcuL1NpbmdsZVNjYW4uanMnKTtcblxudmFyIE1lZGlhVXNhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTWVkaWFVc2FnZSgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE1lZGlhVXNhZ2UpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgZ2V0UG9zdFR5cGUgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRoaXMuanNSZWZyZXNoVXNhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBXYXJuIHVzZXIgd2hlbiBkZWxldGluZyBtZWRpYSBpbiBsaWJyYXJ5XG4gICAgICAgIHRoaXMud2FybmluZygpO1xuICAgICAgICB0aGlzLmRlbGV0ZUxpbmsoKTtcblxuICAgICAgICAvLyBTY2FuIG1lZGlhXG4gICAgICAgIG5ldyBCdWxrU2NhbigpO1xuICAgICAgICBuZXcgU2luZ2xlU2NhbigpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhNZWRpYVVzYWdlLCBbe1xuICAgICAgICBrZXk6ICdkZWxldGVMaW5rJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGRlbGV0ZUxpbmsoKSB7XG5cbiAgICAgICAgICAgICQod2luZG93KS5sb2FkKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgIHZhciBza2lwTmV4dFN0ZXAgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuYXR0YWNobWVudC1wcmV2aWV3JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHVybCA9ICQoJy5tZWRpYS1tb2RhbC1jb250ZW50JykuZmluZCgnLnNldHRpbmcgLm5hbWUnKS5uZXh0KCdzcGFuJykuZmluZCgnYScpLnByb3AoJ2hyZWYnKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpdGxlID0gJCgnLm1lZGlhLW1vZGFsLWNvbnRlbnQnKS5maW5kKCcuc2V0dGluZyAubmFtZScpLm5leHQoJ3NwYW4nKS5maW5kKCdhJykudGV4dCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGl0bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5tZWRpYS1tb2RhbC1jb250ZW50IC5hY3Rpb25zJykuZmluZCgnLmRlbGV0ZS1hdHRhY2htZW50JykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcubWVkaWEtbW9kYWwtY29udGVudCAuYWN0aW9ucycpLmFwcGVuZCgnPGEgZGF0YS11cmw9XCInICsgdXJsICsgJ1wiICBvbmNsaWNrPVwicmV0dXJuIGZhbHNlO1wiIGhyZWY9XCJcIiBjbGFzcz1cImNoZWNrRGVwZW5kZW5jaWVzXCI+JyArIGhiZ21lZGlhLmRlbGV0ZUJ0biArICc8L2E+Jyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2tpcE5leHRTdGVwID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmICghc2tpcE5leHRTdGVwKSB7XG4gICAgICAgICAgICAgICAgICAgICQoJy5yb3ctYWN0aW9ucycpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVybCA9ICQodGhpcykuY2xvc2VzdCgndHInKS5maW5kKCcucGFyZW50LmNvbHVtbi1wYXJlbnQgYScpLnByb3AoJ2hyZWYnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdHJvbmcgPSAkKHRoaXMpLmNsb3Nlc3QoJ3RyJykuZmluZCgnLnBhcmVudC5jb2x1bW4tcGFyZW50IGEnKS5maW5kKCdzdHJvbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdHJvbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmZpbmQoJy5kZWxldGUnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5maW5kKCcuZWRpdCcpLmFmdGVyKCc8c3BhbiBjbGFzcz1cImNvbnRlbnQtYXR0YWNoZWRcIj48YSBkYXRhLXVybD1cIicgKyB1cmwgKyAnXCIgIG9uY2xpY2s9XCJyZXR1cm4gZmFsc2U7XCIgY2xhc3M9XCJjaGVja0RlcGVuZGVuY2llcyBhcmlhLWJ1dHRvbi1pZi1qc1wiIGhyZWY9XCJcIj4nICsgaGJnbWVkaWEuZGVsZXRlQnRuICsgJzwvYT48L3NwYW4+ICB8ICcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAnd2FybmluZycsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB3YXJuaW5nKCkge1xuXG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmNoZWNrRGVwZW5kZW5jaWVzJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVnID0gbmV3IFJlZ0V4cCgnWz8mXScgKyAncG9zdCcgKyAnPShbXiYjXSopJywgJ2knKTtcbiAgICAgICAgICAgICAgICB2YXIgc3RyaW5nSHJlZiA9IHJlZy5leGVjKCQodGhpcykuYXR0cignZGF0YS11cmwnKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoc3RyaW5nSHJlZikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdhY3Rpb24nOiAnZ2V0TWVkaWFQb3N0VGl0bGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ25vbmNlJzogaGJnbWVkaWEubm9uY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaWQnOiBzdHJpbmdIcmVmWzFdXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5LnBvc3QoaGJnbWVkaWEudXJsLCBkYXRhLCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb25maXJtUmVzcG9uc2UgPSBjb25maXJtKGhiZ21lZGlhLnJlc3BvbnNlICsgJzogJyArIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25maXJtUmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2hvd05vdGljZS53YXJuKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzaG93Tm90aWNlLndhcm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBNZWRpYVVzYWdlO1xufSgpO1xuXG5uZXcgTWVkaWFVc2FnZSgpO1xuXG59LHtcIi4vQnVsa1NjYW4uanNcIjoxLFwiLi9TaW5nbGVTY2FuLmpzXCI6Mn1dfSx7fSxbM10pO1xuIl0sImZpbGUiOiJtZWRpYS11c2FnZS5qcyJ9
