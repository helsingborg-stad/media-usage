!function(){function n(e,t,a){function s(c,r){if(!t[c]){if(!e[c]){var u="function"==typeof require&&require;if(!r&&u)return u(c,!0);if(i)return i(c,!0);var o=new Error("Cannot find module '"+c+"'");throw o.code="MODULE_NOT_FOUND",o}var l=t[c]={exports:{}};e[c][0].call(l.exports,function(n){var t=e[c][1][n];return s(t||n)},l,l.exports,n,e,t,a)}return t[c].exports}for(var i="function"==typeof require&&require,c=0;c<a.length;c++)s(a[c]);return s}return n}()({1:[function(n,e,t){"use strict";function a(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}var s=function(){function n(n,e){for(var t=0;t<e.length;t++){var a=e[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(n,a.key,a)}}return function(e,t,a){return t&&n(e.prototype,t),a&&n(e,a),e}}(),i=jQuery.noConflict();e.exports=function(){function n(){a(this,n),"undefined"!=typeof bulkScanAjaxObject&&this.init()}return s(n,[{key:"init",value:function(){this.queue=bulkScanAjaxObject.attachments,this.attachments=bulkScanAjaxObject.attachments.length,this.scanChunkSize=bulkScanAjaxObject.limit,this.isScanning=!1,this.jsRunScanClickEvent(),this.jsStopScanClickEvent()}},{key:"jsRunScanClickEvent",value:function(){i(document).on("click",".js-run-scan",function(n){n.preventDefault(),i(n.target).hide(),i(".js-scan-spinner").addClass("is-active"),i(".js-stop-scan").show(),this.isScanning=!0,this.runMediaScanner()}.bind(this))}},{key:"jsStopScanClickEvent",value:function(){i(document).on("click",".js-stop-scan",function(n){n.preventDefault(),this.isScanning=!1,i(n.target).hide(),i(".js-scan-spinner").removeClass("is-active"),i(".js-run-scan").show()}.bind(this))}},{key:"runMediaScanner",value:function(){if(0===this.queue.length||this.isScanning===!1){var n=i(".js-scan-spinner");return void(n.hasClass("is-active")&&(n.removeClass("is-active"),i(".js-stop-scan").hide(),i(".js-run-scan").show()))}var e=this.queue.splice(0,this.scanChunkSize);i.ajax({url:bulkScanAjaxObject.ajaxUrl,type:"post",data:{action:"scanUsageAjaxMethod",nonce:bulkScanAjaxObject.nonce,attachments:e,queue:this.queue.length},success:function(n,e){this.updateProgress(),this.runMediaScanner()}.bind(this),error:function(n,e,t){}})}},{key:"updateProgress",value:function(){i(".js-scanned").length>0&&i(".js-scanned").text(this.attachments-this.queue.length),i(".js-progress").length>0&&i(".js-progress").text()!=this.getScanProgressInPrecentage()&&i(".js-progress").text(this.getScanProgressInPrecentage())}},{key:"getScanProgressInPrecentage",value:function(){return Math.round((this.attachments-this.queue.length)/this.attachments*100)}}]),n}()},{}],2:[function(n,e,t){"use strict";function a(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}var s=function(){function n(n,e){for(var t=0;t<e.length;t++){var a=e[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(n,a.key,a)}}return function(e,t,a){return t&&n(e.prototype,t),a&&n(e,a),e}}(),i=jQuery.noConflict();e.exports=function(){function n(){a(this,n),"undefined"!=typeof singleScanAjaxObject&&this.jsRefreshUsage()}return s(n,[{key:"jsRefreshUsage",value:function(){i(document).on("click",".js-refresh-usage",function(n){n.preventDefault(),i("#attachment_usage").addClass("is-disabled"),this.runMediaScanner()}.bind(this))}},{key:"runMediaScanner",value:function(){i.ajax({url:singleScanAjaxObject.ajaxUrl,type:"post",data:{action:"scanUsageAjaxMethod",nonce:singleScanAjaxObject.nonce,attachments:[singleScanAjaxObject.attachment]},success:function(n,e){this.reRenderUsage()}.bind(this)})}},{key:"reRenderUsage",value:function(){i.ajax({url:singleScanAjaxObject.ajaxUrl,type:"post",data:{action:"outputUsageListAjaxMethod",nonce:singleScanAjaxObject.nonce,attachment:singleScanAjaxObject.attachment},success:function(n,e){i("#attachment_usage").removeClass("is-disabled"),i(".js-media-usage-wrapper").html(n)}.bind(this)})}}]),n}()},{}],3:[function(n,e,t){"use strict";function a(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}var s=n("./BulkScan.js"),i=n("./SingleScan.js"),c=function r(){a(this,r),new s,new i};new c},{"./BulkScan.js":1,"./SingleScan.js":2}]},{},[3]);