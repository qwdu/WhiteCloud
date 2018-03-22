
var fileapi = {
    list: function(path, onlydir, callback) {
        var postData = {method:"file.listdir", params:{path:path, onlydir:onlydir}};
        jpost('/api', postData, callback);
    },

    del: function(paths, callback) {
        var postData = {method:"file.remove", params:{path:paths}};
        jpost('/api', postData, callback);
    },

    move: function(todir, patharr, callback) {
        var postData = {method:"file.move", params:{todir:todir, path:patharr}};
        jpost('/api', postData, callback);
    },

    rename: function(path, newname, callback) {
        var postData = {method:"file.rename", params:{path:path, newname:newname}};
        jpost('/api', postData, callback);
    },

    mkdir: function(path, newname, callback) {
        var postData = {method:"file.mkdir", params:{path:path, newname:newname}};
        jpost('/api', postData, callback);
    },
};

var fileutil = {
    file_ext: function(name) {
        var len = name.length - name.lastIndexOf(".") - 1;
        var ext = name.substr(name.lastIndexOf(".") + 1, len);
        return ext.toLowerCase();
    },

    format_time: function (unixtm) {
        function pad(n){return (n<10 ? '0'+n : n);}
        var d = new Date(unixtm * 1000);
        return pad(d.getMonth()+1)+'-'
            + pad(d.getDate())+' '
            + pad(d.getHours())+':'
            + pad(d.getMinutes());
    },

    format_size: function (size) {
        function round(num, precision) {
            return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
        }

        var boundary = Math.pow(1024, 4);

        // TB
        if (size > boundary) {
            return round(size / boundary, 2) + "T";
        }

        // GB
        if (size > (boundary/=1024)) {
            return round(size / boundary, 2) + "G";
        }

        // MB
        if (size > (boundary/=1024)) {
            return round(size / boundary, 2) + "M";
        }

        // KB
        if (size > 1024) {
            return Math.round(size / 1024) + "K";
        }

        return size + "B";
    },

    dirname: function (path) {
        var pi = path.lastIndexOf("/");
        if (pi <= 0) return "/";

        if ((path.lastIndexOf("/") + 1) == path.length) {
            var tmp = path.substr(0, path.lastIndexOf("/"));
            pi = tmp.lastIndexOf("/");
            if (pi <= 0) return "/";
            return tmp.substr(0, tmp.lastIndexOf("/"));
        }
        return path.substr(0, path.lastIndexOf("/"));
    },

    basename: function (path) {
        var start = path.lastIndexOf("/") + 1;
        var size  = path.length - start;
        return path.substr(start, size);
    },

    clearString: function (s) { 
        var pattern = new RegExp("[\\\*|:<>\"/?]");
        var rs = ""; 
        for (var i = 0; i < s.length; i++) { 
            rs = rs+s.substr(i, 1).replace(pattern, ''); 
        } 
        return rs;
    },

    myescape: function(s) {
        s = s.replace(/%/g, "%25");
        return s;
    },
};

var fileicon = {
    icontable: {
        txt: "txt.png",
        doc: "word.png",
        docx: "word.png",
        xls: "xls.png",
        xlsx: "xls.png",
        ppt: "ppt.png",
        pptx: "ppt.png",
        pdf: "pdf.png",
        jpg: "pic.png",
        png: "pic.png",
        bmp: "pic.png",
        jpeg: "pic.png",  
        gif: "pic.png",  
        mp3: "audio.png",
        ogg: "audio.png",
        wav: "audio.png",
        wma: "audio.png",
        flac: "audio.png",
        m4a: "audio.png",
        avi: "video.png",
        mp4: "video.png",
        flv: "video.png",
        rmvb: "video.png",
        mkv: "video.png",
        mov: "video.png",
        wmv: "video.png",
        zip: "zip.png",
        rar: "zip.png",
        tgz: "zip.png",
        bz: "zip.png",
        bz2: "zip.png",
        gz: "zip.png",
        "7z": "zip.png",
        exe: "bin.png",
        msi: "bin.png",
        torrent: "torrent.png",
        apk: "android.png"
    },

    get_icon: function(name, isdir)
    {
        if (isdir)
            return "fileicon/folder.png";
        else {
            var ext = fileutil.file_ext(name);
            if (this.icontable[ext] == null)
                return "fileicon/file.png";
            else 
                return "fileicon/" + this.icontable[ext];
        }
    }
};

var fileobject = {
    files: null,
    path: "/",
    total: 0,
    pages: 1,
    page: 0,
    perpage: 100,
    loading: false,

    show_files: function (start, end)
    {
        fileui.show_files(start, end);
        fileobject.loading = false;
    },

    reshow_files: function() {
        fileobject.page = 0;
        if (fileobject.total > 1000) {
            fileobject.show_files(0, fileobject.perpage);
        } else {
            fileobject.show_files(0, fileobject.total);
        }
    },

    get_files_path: function (path)
    {
        fileapi.list(path, false, function(retobj){
            if (retobj.result == false) {
                return ;
            }
            fileobject.files = retobj.files;
            if (retobj.page)  fileobject.page    = retobj.page;
            if (retobj.pages) fileobject.pages   = retobj.pages;
            if (retobj.path)  { fileobject.path  = retobj.path;  } else { fileobject.path = path; }
            if (retobj.total) { fileobject.total = retobj.total; } else { fileobject.total = retobj.files.length?retobj.files.length:0; }

            if (fileobject.total > 1000) {
                fileobject.pages = Math.ceil(fileobject.total / fileobject.perpage);
                fileobject.show_files(0, fileobject.perpage);
            } else {
                fileobject.show_files(0, fileobject.total);
            }
        });
    },

    reload_files: function ()
    {
        fileobject.page = 0;
        fileobject.get_files_path(fileobject.path);
    },

    load_next_page: function ()
    {
        if ((fileobject.page+1) == fileobject.pages) return ;
        if (fileobject.loading) return;
        fileobject.loading = true;
        fileobject.page = fileobject.page + 1;
        if (fileobject.total > 1000) {
            var start = fileobject.page * fileobject.perpage;
            var end   = start + fileobject.perpage;
            fileobject.show_files(start, end);
        }
    },

    enter_parent_dir: function () {
        fileobject.get_files_path(fileutil.dirname(fileobject.path));
    },

    enter_dir_by_index: function (i) {
        fileobject.get_files_path(fileobject.files[i].path);
    },
};

var fileui = {
    listmode: "grid",
    selected: -1,
    dirtree_cur: '/',
    uploading: false,
    uploader_inited: false,
    uploader_divshow: false,

    init: function() {
        fileui.init_mkdir_dialog();
        fileui.init_rename_dialog();
        fileui.init_move_dialog();

        $("#filebox .titleline :checkbox").click(function() {
            if ($(this).get(0).checked) {
                fileui.select_all_file(true);
            } else {
                fileui.select_all_file(false);
            }
        });

        $('#filebox .btnbar .op-delete').click(function(e) {
			fileui.show_del_tip();
        });

        $('#filebox .btnbar .op-list').click(function(e) {
            if (fileui.listmode == "list") return ;
            fileui.listmode = "list";
            fileobject.reshow_files();
        });

        $('#filebox .btnbar .op-grid').click(function(e) {
            if (fileui.listmode == "grid") return ;
            fileui.listmode = "grid";
            fileobject.reshow_files();
        });

        $('#filebox .filelistbox').delegate('a', 'click', function(e) {
            e.stopPropagation();
        });
        $('#filebox .filegridbox').delegate('a', 'click', function(e) {
            e.stopPropagation();
        });

        $('#filebox .filelistbox ul').scroll(function (){
            var listH = $('#filebox .filelistbox ul').height();
            var scrollH = $('#filebox .filelistbox ul')[0].scrollHeight;
            var scrollT = $('#filebox .filelistbox ul').scrollTop();
            if((scrollT + listH) >= (scrollH - 50)) {
                fileobject.load_next_page();
            } 
        }); 

        $('#filebox .filegridbox ul').scroll(function (){
            var listH = $('#filebox .filegridbox ul').height();
            var scrollH = $('#filebox .filegridbox ul')[0].scrollHeight;
            var scrollT = $('#filebox .filegridbox ul').scrollTop();
            if((scrollT + listH) >= (scrollH - 50)) {
                fileobject.load_next_page();
            } 
        }); 

        $('#filebox .filelistbox').delegate('li', 'click', function(e){
            if (e.ctrlKey==1) {
                $(":checkbox", this).click();
                return ;
            }
            $("#filebox .filelistbox li").removeClass("selected");
            $("#filebox .filelistbox :checkbox").prop("checked", false); 
            $("#filebox .titleline :checkbox").prop("checked", false); 

            $(this).addClass("selected");
            $(":checkbox", this).prop("checked", true);
            fileui.show_all_button(true);

            fileui.selected = $(this).attr("index");
        });

        $('#filebox .filelistbox').delegate('li :checkbox', 'click', function(e){
            e.stopPropagation();

            if ($(this).get(0).checked) {
                $(this).parent().parent().addClass("selected");
            } else {
                $(this).parent().parent().removeClass("selected");
            }

            var check_count = $("#filebox .filelistbox .selected").length;

            if (check_count > 0) fileui.show_all_button(true);
            else fileui.show_all_button(false);

            if (check_count == fileui.filesobj.length) $("#filebox .titleline :checkbox").prop("checked", true);
            else $("#filebox .titleline :checkbox").prop("checked", false);

            if (check_count == 1) {
                $("#filebox .filelistbox ul :checked").each(function(){
                    fileui.selected = $(this).parent().parent().attr("index");
                });
            }
        });

        $('#filebox .filegridbox').delegate('.checkbox1','click',function(){
            if($(this).parent().parent().hasClass('selected')){
                $(this).parent().parent().removeClass('selected');
            }else{
                $(this).parent().parent().addClass('selected');
            };
            var check_count = $("#filebox .filegridbox .selected").length;
            if (check_count > 0) fileui.show_all_button(true);
            else fileui.show_all_button(false);
        
            fileui.selected = $(this).parent().parent().attr("index");
        });

        fileobject.reload_files();
    },

    show_alert: function (type, msg) {
        noty({
            type: type,
            text: msg,
            layout: 'topCenter',
            theme: 'relax',
            animation: {
                open: 'animated flipInY',
                close: 'animated flipOutX'
            },
            timeout:3000
        });
    },

    show_del_tip: function () {
		noty({
			text: '<p style="font-size:20px; color:red;">警告</p><p>删除文件后无法恢复，确定删除吗？</p>',
            layout: 'center',
            theme: 'relax',
            animation: {
                open: 'animated flipInX',
                close: 'animated flipOutX'
            },
			buttons: [
				{addClass: 'btn btn-default', text: 'Cancel', onClick: function($noty) {
						$noty.close();
					}
				},
				{addClass: 'btn btn-danger', text: 'Delete', onClick: function($noty) {
						$noty.close();
            			fileapi.del(fileui.get_selected_files(), fileui.check_result);
					}
				}
			]
		});
    },

    update_box_size: function() {
        var boxh = $('#filebox').height();
        var titleh = $('#filebox .titleline').outerHeight();
        var btnh = $('#filebox .btnbar').outerHeight();
        var pathh = $('#filebox .pathbar').outerHeight();
        var pathh = 0;
        var uu = boxh - titleh - btnh - pathh;
        $("#filebox .filelistbox ul").css({"height": uu+"px"});
        var gg = boxh - btnh - pathh;
        $("#filebox .filegridbox ul").css({"height": gg+"px"});
    },

    show_path: function(path)
    {
        $('.curpath').empty();
        var patharray = path.split('/');
        var pathdeli = '&nbsp;&gt;&nbsp;';
        $.each(patharray, function(i, item) {
            if (item != "") {
                var cpath = "";
                for (var j=0; j<=i; j++) cpath = cpath + patharray[j] + '/';
                var sss = '<a onclick=\'fileobject.get_files_path("' + cpath + '");\'>' + item + '</a>' + pathdeli;
                $('.curpath').append(sss);
            } else {
                if (i == 0) {
                    var sss = '<a onclick=\'fileobject.get_files_path("/");\'>文件管理器</a>' + pathdeli;
                    $('.curpath').append(sss);
                }
            }
        });
    },

    show_files: function (start, end)
    {
        fileui.show_path(fileobject.path);
        //$('#filebox .filescount').html(fileobject.total);

        if (fileui.listmode == "list")
        {
            $("#filebox .filegridbox").hide();
            $("#filebox .filelistbox").show();
            if (start == 0) {
                $("#filebox .filelistbox ul").empty();
                fileui.show_all_button(false);
            }

            fileui.show_files_list(start, end);

            $("#filebox .titleline .box").removeClass("btnchecked");
        }
        else if (fileui.listmode == "grid")
        {
            $("#filebox .filelistbox").hide();
            $("#filebox .filegridbox").show();
            if (start == 0) {
                $("#filebox .filegridbox ul").empty();
                fileui.show_all_button(false);
            }

            fileui.show_files_grid(start, end);

            $("img.lazy").lazyload({
                effect : "fadeIn",
                container : $('#filebox .filegridbox ul')
            });
            $(window).trigger("lazy");
        }
    },

    show_files_list: function(start, end)
    {
        for (var index = start; index < end; index++) 
        {
            var item    = fileobject.files[index];
            var sizestr = fileutil.format_size(item.size);
            var namestr = '<a target="_blank" href="/home/'+g_uname+fileutil.myescape(item.path)+'">'+item.name+"</a>";
            if (item.isdir) {
                sizestr = "-";
                namestr = '<a href="javascript:;" onclick="fileobject.enter_dir_by_index('+index+');">' + item.name + '</a>';
            }

            var sss = '<li index='+index+'>' + 
            '<div class="box pull-left"><input type="checkbox" /></div>' + 
            '<div class="icon pull-left"><img src="' + fileicon.get_icon(item.name, item.isdir) + '"/></div>' +
            '<div class="time pull-right">' + format_date(item.time) + '</div>' +
            '<div class="size pull-right">' + sizestr + '</div>' + 
            '<div class="name">' + namestr + '</div>' +
            '<div class="clearfix"></div></li>';

            $("#filebox .filelistbox ul").append(sss);
        }
    },

    show_files_grid: function(start, end)
    {
        for (var index = start; index < end; index++) 
        {
            var item     = fileobject.files[index];
            var foldera1 = "";
            var foldera2 = '</a>';
            if (item.isdir) {
                foldera1 = '<a href="javascript:;" onclick="fileobject.enter_dir_by_index('+index+');">';
            }
            else {
                foldera1 = '<a target="_blank" href="/home/'+g_uname+fileutil.myescape(item.path) + '">';
            }
            var imgsrcname = 'src';
            var imgurl     = fileicon.get_icon(item.name, item.isdir);
            var ext = fileutil.file_ext(item.name);
            if(ext == "jpg" || ext == "png" || ext == "gif") {
                imgsrcname = 'class="lazy" data-original';
                imgurl     = '/home/'+g_uname+fileutil.myescape(item.path);
            }

            var sss = '<li class="pull-left"  index='+index+' title="'+item.name+'">'+
                '<div class="imgdiv">'+foldera1+'<img onload="fileui.grid_img_onload(this)" '+imgsrcname+'="'+imgurl+'"/>'+foldera2+ 
                '<div class="checkbox1" style ="width:18px;height:18px;display:block;position:absolute;left:0px;top:0px;cursor:pointer;"></div></div>'+ 
                '<div class="filename">' +  item.name + '</div>' +
                '<div class="clearfix"></div>' +
                '</li>';

            $("#filebox .filegridbox ul").append(sss);
        }
    },

    grid_img_onload: function(who) {
        if (who.height == 1) return ;

        if (who.height <116 ) {
            var v = (116 - who.height) / 2;
            who.style.marginTop = v + 'px';
        }
        if (who.width > 160) {
            var v = (who.width - 160) / 2;
            who.style.marginLeft = '-' + v + 'px';
        }
    },

    show_all_button: function (b) {
        if (b)
        {
            $('#filebox .btnbar .fileopbtn').show();
        } 
        else {
            $('#filebox .btnbar .fileopbtn').hide();
        }
    },

    select_all_file: function(b) {
        if (b) {
            $("#filebox .filelistbox li").addClass("selected");
            $("#filebox .filelistbox :checkbox").prop("checked", true); 
            fileui.show_all_button(true);
        } else {
            $("#filebox .filelistbox li").removeClass("selected");
            $("#filebox .filelistbox :checkbox").prop("checked", false); 
            fileui.show_all_button(false);
        }
    },

    check_result: function (res) {
        if (!res.result) {
            fileui.show_alert('error', '出错啦<br/>'+res.errmsg);
        }
        fileobject.reload_files();
    },

    get_selected_files: function() {
        var arr = [];
        if (fileui.listmode == "list") {
            $("#filebox .filelistbox .selected").each(function(){
                var index = $(this).attr("index");
                arr.push(fileobject.files[index].path);
            });
        } else if (fileui.listmode == "grid") {
            $("#filebox .filegridbox .selected").each(function(){
                var index = $(this).attr("index");
                arr.push(fileobject.files[index].path);
            });
        }
        return arr;
    },

    show_dialog: function(divid) {
        var w = ($('#filebox').width() - $(''+divid).width()) / 2 + $('#filebox').position().left;
        $(''+divid).css({"display":"block", "position":"fixed", "top":"120px", "left":w+"px"});
    },

    init_mkdir_dialog: function() {
        $('#mkdirmodal .modal-footer .btn-default').click(function(){
            $('#blackoverlay').hide();
            $('#mkdirmodal').hide();
            $('#mkdirmodal').removeClass('animated bounceIn');
        });
        $('#mkdirmodal .modal-header .close').click(function(){
            $('#blackoverlay').hide();
            $('#mkdirmodal').hide();
            $('#mkdirmodal').removeClass('animated bounceIn');
        });

        $("#mkdirmodal input").keyup(function(e){
            if (e.keyCode == 13) {
                var str = fileutil.clearString($("#mkdirmodal input").val());
                fileapi.mkdir(fileobject.path, str, fileui.check_result);
                $('#blackoverlay').hide();
                $('#mkdirmodal').hide();
                $('#mkdirmodal').removeClass('animated bounceIn');
            }
        });

        $('#mkdirmodal .modal-footer .btn-primary').click(function(){
            var str = fileutil.clearString($("#mkdirmodal input").val());
            fileapi.mkdir(fileobject.path, str, fileui.check_result);
            $('#blackoverlay').hide();
            $('#mkdirmodal').hide();
            $('#mkdirmodal').removeClass('animated bounceIn');
        });

        $('#filebox .btnbar .op-mkdir').click(function() {
            fileui.show_dialog('#mkdirmodal');
            $('#mkdirmodal').addClass('animated bounceIn');
            $('#blackoverlay').show();
            $("#mkdirmodal input").val("");
        });
    },

    init_rename_dialog: function() {
        $('#renamemodal .modal-footer .btn-default').click(function(){
            $('#blackoverlay').hide();
            $('#renamemodal').hide();
            $('#renamemodal').removeClass('animated bounceIn');
        });
        $('#renamemodal .modal-header .close').click(function(){
            $('#blackoverlay').hide();
            $('#renamemodal').hide();
            $('#renamemodal').removeClass('animated bounceIn');
        });

        $('#renamemodal .modal-footer .btn-primary').click(function(){
            var str = fileutil.clearString($("#renamemodal input").val());
            fileapi.rename(fileobject.files[fileui.selected].path, str, fileui.check_result);

            $('#blackoverlay').hide();
            $('#renamemodal').hide();
            $('#renamemodal').removeClass('animated bounceIn');
        });

        $('#filebox .btnbar .op-rename').click(function() {
            fileui.show_dialog('#renamemodal');
            $('#renamemodal').addClass('animated bounceIn');
            $('#blackoverlay').show();
            $("#renamemodal input").val(fileobject.files[fileui.selected].name);
        });
    },

    init_move_dialog: function() {
        $('#movemodal .modal-footer .btn-default').click(function(){
            $('#blackoverlay').hide();
            $('#movemodal').hide();
            $('#movemodal').removeClass('animated flipInX');
        });
        $('#movemodal .modal-header .close').click(function(){
            $('#blackoverlay').hide();
            $('#movemodal').hide();
            $('#movemodal').removeClass('animated flipInX');
        });

        $('#movemodal .modal-footer .btn-primary').click(function(){
            var todir = fileui.dirtree_cur;
            if (todir != "") {
                fileapi.move(todir, fileui.get_selected_files(), fileui.check_result);
            }
            $('#blackoverlay').hide();
            $('#movemodal').hide();
            $('#movemodal').removeClass('animated flipInX');
        });

        $('#filebox .btnbar .op-move').click(function() {
            fileui.show_dialog('#movemodal');
            $('#blackoverlay').show();
            $('#movemodal').addClass('animated flipInX');
            $('#movemodal .dirtree').DirTree(
                {folderEvent:'click', expandSpeed:200, collapseSpeed:200, multiFolder:false},
                function(file){ fileui.dirtree_cur = file; }
            );
        });
    },

    init_uploader: function() {
        $('#filebox .btnbar .op-upload').click(function(){
            if (false == fileui.uploader_inited) {
                create_plupload();
                fileui.uploader_inited = true;
            }

            if (false == fileui.uploader_divshow) {
                var ur = $(window).width() - ($('#filebox').position().left + $('#filebox').width()) + 2;
                var ub = $(window).height() - ($('#filebox').position().top + $('#filebox').height()) + 2;
                $('#uploaderbox').css({"position":"absolute", "right":ur+"px", "bottom":ub+"px"});
                $("#uploaderbox").slideDown();
                fileui.uploader_divshow = true;
            }

            $('#pickfiles').click();
        });
    },

};
