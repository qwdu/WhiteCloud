
function mk_up_item (name, size, isdir) {
    var icon = '<div class="pull-left" style="padding:0;margin:0;"><img width=20 src="' + fileicon.get_icon(name, isdir) + '"/></div>';

    return '<div class="pull-right upcancel" done=0><span class="glyphicon glyphicon-remove"></span></div>' +
        '<div class="pull-right lipercent" style="width:50px;">-</div>' +
        '<div class="pull-right lisize" style="margin-right:20px; width:80px;">' + fileutil.format_size(size) + '</div>' +
        '<div class="pull-right licount hide" style="width:100px;"></div>' +
        icon + 
        '<div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + name + '</div>' +
        '<div class="clearfix"></div>';
}

function create_plupload() {
    var rateIntervalId = null;
    var currentFileId;

    var uploader = new plupload.Uploader({
        runtimes : 'html5,gears,browserplus,flash',
        browse_button : 'pickfiles',
        container : 'uploaderbox',
        max_file_size: '2048mb',
        chunk_size: '4mb',
        multipart_params : {savepath: ""},
        url : '/upload',
        flash_swf_url : 'https://cdn.bootcss.com/plupload/1.5.8/plupload.flash.swf'
    });

    uploader.init();

    function bitrate_timer() {
        if (uploader.total.bytesPerSec > 0 ) fileui.uploading = true;
        else fileui.uploading = false;

        var rest = uploader.total.size - uploader.total.loaded;
        var rest_s = Math.ceil(rest / uploader.total.bytesPerSec);
        var rs = "";
        if (rest_s < 2) {
            rs = "";
        } else if (rest_s < 60) {
            rs = " &nbsp;&nbsp;left " + rest_s + ' sec';
        } else {
            rs = " &nbsp;&nbsp;left " + Math.floor(rest_s/60) + ' min';
        }

        $('#uploaderbox .speed').html(fileutil.format_size(uploader.total.bytesPerSec) + "/s" + rs);

        if(rest == 0) {
            clearInterval(rateIntervalId);
            rateIntervalId = null;
            fileui.uploading = false;
            fileobject.reload_files();
        }
    }

    uploader.bind('FilesAdded', function(up, files) {
        $.each(files, function(i, file) {
            $('<li>', {'id':file.id}).append(mk_up_item(file.name, file.size, false)).data("savepath", fileobject.path).appendTo('#uploaderbox .uploadlist');
        });

		up.settings.multipart_params.savepath = fileobject.path;
        up.refresh();
        up.start();

        if (fileui.uploader_divshow == false) {
            $("#uploaderbox").slideDown();
            fileui.uploader_divshow = true;
        }

        if (null == rateIntervalId) {
            rateIntervalId = setInterval(bitrate_timer, 500);
        }
    });

    uploader.bind('UploadFile', function(up, file) {
        currentFileId = file.id;
        up.settings.multipart_params.savepath = $('#' + file.id).data("savepath");
        up.refresh();

        {
            var count = $("#uploaderbox .uploadlist li").length;
            if (count <= 7) return ;

            var i = $('#' + file.id).index();
            if (i < 7) return ;

            var offset = Math.ceil( ((i-3) / count) * $('#uploaderbox uploadlist')[0].scrollHeight );
            $('#uploaderbox uploadlist').animate({scrollTop:offset+"px"});
        }
    });

    uploader.bind('UploadProgress', function(up, file) {
        $('#' + file.id + ' .lipercent').html(file.percent + "%");
        $('#uploaderbox .uploadprogress .bar').css('width', up.total.percent+ '%');
    });

    uploader.bind('FileUploaded', function(up, file, ret) {
        $('#' + file.id + ' .lipercent').css("color", "green");
        $('#' + file.id + ' .lipercent').html("done");
        $('#' + file.id + ' .upcancel').attr("done", 1);
        $('#' + file.id + ' .upcancel').html('<span class="glyphicon glyphicon-ok text-success"></span>');

        if ( $('#' + file.id).data("savepath") == fileobject.path ) {
            fileobject.reload_files();
        }
    });

    uploader.bind('UploadComplete', function(up, files) {
        up.splice();
        clearInterval(rateIntervalId);
        rateIntervalId = null;
        $("#uploaderbox").slideUp();
        fileui.uploader_divshow = false;
        fileui.uploading = false;

        $('#uploaderbox .speed').html("");
    });

    $('#uploaderbox .uploadlist').delegate('.upcancel', 'click', function() {
        var id = $(this).parent().attr("id");
        var done = $(this).attr("done");
        if (1 == done) {
            $(this).parent().remove();
        } else {
            if (currentFileId == id) {
                uploader.stop();
                uploader.removeFile(uploader.getFile(id));
                uploader.refresh();
                uploader.start();
                $(this).parent().remove();
            } else {
                uploader.removeFile(uploader.getFile(id));
                uploader.refresh();
                $(this).parent().remove();
            }
        }
    });
}

