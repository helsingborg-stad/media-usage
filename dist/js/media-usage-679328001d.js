!function(){function n(e,t,a){function i(c,r){if(!t[c]){if(!e[c]){var o="function"==typeof require&&require;if(!r&&o)return o(c,!0);if(s)return s(c,!0);var u=new Error("Cannot find module '"+c+"'");throw u.code="MODULE_NOT_FOUND",u}var l=t[c]={exports:{}};e[c][0].call(l.exports,function(n){var t=e[c][1][n];return i(t||n)},l,l.exports,n,e,t,a)}return t[c].exports}for(var s="function"==typeof require&&require,c=0;c<a.length;c++)i(a[c]);return i}return n}()({1:[function(n,e,t){"use strict";function a(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}var i=function(){function n(n,e){for(var t=0;t<e.length;t++){var a=e[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(n,a.key,a)}}return function(e,t,a){return t&&n(e.prototype,t),a&&n(e,a),e}}(),s=jQuery.noConflict();e.exports=function(){function n(){a(this,n),"undefined"!=typeof bulkScanAjaxObject&&this.init()}return i(n,[{key:"init",value:function(){this.queue=bulkScanAjaxObject.attachments,this.attachments=bulkScanAjaxObject.attachments.length,this.scanChunkSize=bulkScanAjaxObject.limit,this.isScanning=!1,this.jsRunScanClickEvent(),this.jsStopScanClickEvent()}},{key:"jsRunScanClickEvent",value:function(){s(document).on("click",".js-run-scan",function(n){n.preventDefault(),s(n.target).hide(),s(".js-scan-spinner").addClass("is-active"),s(".js-stop-scan").show(),this.isScanning=!0,this.runMediaScanner()}.bind(this))}},{key:"jsStopScanClickEvent",value:function(){s(document).on("click",".js-stop-scan",function(n){n.preventDefault(),this.isScanning=!1,s(n.target).hide(),s(".js-scan-spinner").removeClass("is-active"),s(".js-run-scan").show()}.bind(this))}},{key:"runMediaScanner",value:function(){if(0===this.queue.length||this.isScanning===!1){var n=s(".js-scan-spinner");return void(n.hasClass("is-active")&&(n.removeClass("is-active"),s(".js-stop-scan").hide(),s(".js-run-scan").show()))}var e=this.queue.splice(0,this.scanChunkSize);s.ajax({url:bulkScanAjaxObject.ajaxUrl,type:"post",data:{action:"scanUsageAjaxMethod",nonce:bulkScanAjaxObject.nonce,attachments:e,queue:this.queue.length},success:function(n,e){this.updateProgress(),this.runMediaScanner()}.bind(this),error:function(n,e,t){}})}},{key:"updateProgress",value:function(){s(".js-scanned").length>0&&s(".js-scanned").text(this.attachments-this.queue.length),s(".js-progress").length>0&&s(".js-progress").text()!=this.getScanProgressInPrecentage()&&s(".js-progress").text(this.getScanProgressInPrecentage())}},{key:"getScanProgressInPrecentage",value:function(){return Math.round((this.attachments-this.queue.length)/this.attachments*100)}}]),n}()},{}],2:[function(n,e,t){"use strict";function a(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}var i=function(){function n(n,e){for(var t=0;t<e.length;t++){var a=e[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(n,a.key,a)}}return function(e,t,a){return t&&n(e.prototype,t),a&&n(e,a),e}}(),s=jQuery.noConflict();e.exports=function(){function n(){a(this,n),"undefined"!=typeof singleScanAjaxObject&&this.jsRefreshUsage()}return i(n,[{key:"jsRefreshUsage",value:function(){s(document).on("click",".js-refresh-usage",function(n){n.preventDefault(),s("#attachment_usage").addClass("is-disabled"),this.runMediaScanner()}.bind(this))}},{key:"runMediaScanner",value:function(){s.ajax({url:singleScanAjaxObject.ajaxUrl,type:"post",data:{action:"scanUsageAjaxMethod",nonce:singleScanAjaxObject.nonce,attachments:[singleScanAjaxObject.attachment]},success:function(n,e){this.reRenderUsage()}.bind(this)})}},{key:"reRenderUsage",value:function(){s.ajax({url:singleScanAjaxObject.ajaxUrl,type:"post",data:{action:"outputUsageListAjaxMethod",nonce:singleScanAjaxObject.nonce,attachment:singleScanAjaxObject.attachment},success:function(n,e){s("#attachment_usage").removeClass("is-disabled"),s(".js-media-usage-wrapper").html(n)}.bind(this)})}}]),n}()},{}],3:[function(n,e,t){"use strict";function a(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}var i=function(){function n(n,e){for(var t=0;t<e.length;t++){var a=e[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(n,a.key,a)}}return function(e,t,a){return t&&n(e.prototype,t),a&&n(e,a),e}}(),s=jQuery.noConflict(),c=n("./BulkScan.js"),r=n("./SingleScan.js"),o=function(){function n(){a(this,n),"undefined"!=typeof getPostType&&this.jsRefreshUsage(),this.warning(),this.deleteLink(),new c,new r}return i(n,[{key:"deleteLink",value:function(){s(window).load(function(){var n=!1;s(document).on("click",".attachment-preview",function(e){var t=s(".media-modal-content").find(".setting .name").next("span").find("a").prop("href"),a=s(".media-modal-content").find(".setting .name").next("span").find("a").text();console.log(a),a&&(s(".media-modal-content .actions").find(".delete-attachment").remove(),s(".media-modal-content .actions").append('<a data-url="'+t+'"  onclick="return false;" href="" class="checkDependencies">'+hbgmedia.deleteBtn+"</a>")),n=!0}),n||s(".row-actions").each(function(){var n=s(this).closest("tr").find(".parent.column-parent a").prop("href"),e=s(this).closest("tr").find(".parent.column-parent a").find("strong");e&&(s(this).find(".delete").addClass("hidden"),s(this).find(".edit").after('<span class="content-attached"><a data-url="'+n+'"  onclick="return false;" class="checkDependencies aria-button-if-js" href="">'+hbgmedia.deleteBtn+"</a></span>  | "))})})}},{key:"warning",value:function(){s(document).on("click",".checkDependencies",function(n){var e=new RegExp("[?&]post=([^&#]*)","i"),t=e.exec(s(this).attr("data-url"));if(!t)return showNotice.warn();var a={action:"getMediaPostTitle",nonce:hbgmedia.nonce,id:t[1]};jQuery.post(hbgmedia.url,a,function(n){if(n)var e=confirm(hbgmedia.response+": "+n);if(e)return showNotice.warn()})})}}]),n}();new o},{"./BulkScan.js":1,"./SingleScan.js":2}]},{},[3]);