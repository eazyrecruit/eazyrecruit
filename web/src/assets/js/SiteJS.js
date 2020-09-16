var SiteJS = (function ($) {
    return {
        slideOpen: function (id) {
            $('#'+id).children('div').addClass('open-panel');
            $('.content-move').addClass('pr-410');
            $('.closed-panel').on('click', function () {
                // $('#'+id).children('div').removeClass('open-panel');
                // $('.content-move').removeClass('pr-410');
                SiteJS.slideReset(id);
            });
        },
        slideReset: function(id){
            $('#'+id).children('div').removeClass('open-panel');
            $('.content-move').removeClass('pr-410');
        },
        closeMod: function () {
            $("#myModal").modal('hide')
        },
        // openJobMenu: function () {
        //     $('.jobs-menuList').toggleClass('open');
        // },
        initWys: function (controlId) {
            $('#' + controlId).wysihtml5();
        },
        getWysContent: function (controlId) {
            return $('#' + controlId).data("wysihtml5").editor.getValue();
        },
        setWysContent: function (controlId, content) {
            $('#' + controlId).data("wysihtml5").editor.setValue(content);
        },
        startLoader: function() {
            $('.loader-wrapper').addClass('show');
        },
        stopLoader: function() {
            $('.loader-wrapper').removeClass('show');
        },
         //Authorization popup window code
        oauthpopup: function(url, callback)
        {
            var options = {};
            var y = window.outerHeight / 2 + window.screenY - ( 600 / 2)
            var x = window.outerWidth / 2 + window.screenX - ( 800 / 2)
            options.windowName = options.windowName ||  'ConnectWithOAuth'; // should not include space for IE
            options.windowOptions = options.windowOptions || 'top='+y+',left='+x+',status=0,width=800,height=600';
            callback = callback || function(){ window.location.reload(); };
            var that = this;
            that._oauthWindow = window.open(url, options.windowName, options.windowOptions);
            that._oauthInterval = window.setInterval(function(){
                if (that._oauthWindow.closed) {
                    window.clearInterval(that._oauthInterval);
                    callback();
                }
            }, 200);
        },
    }
})(jQuery);