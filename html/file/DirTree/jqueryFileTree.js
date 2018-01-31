// jQuery File Tree Plugin
//
// Version 1.01
//
if(jQuery) (function($){
	
	$.extend($.fn, {
		DirTree: function(o, h) {
			// Defaults
			if( !o ) var o = {};
			if( o.root == undefined ) o.root = '/';
			if( o.script == undefined ) o.script = 'jqueryFileTree.php';
			if( o.folderEvent == undefined ) o.folderEvent = 'click';
			if( o.expandSpeed == undefined ) o.expandSpeed= 500;
			if( o.collapseSpeed == undefined ) o.collapseSpeed= 500;
			if( o.expandEasing == undefined ) o.expandEasing = null;
			if( o.collapseEasing == undefined ) o.collapseEasing = null;
			if( o.multiFolder == undefined ) o.multiFolder = true;
			if( o.loadMessage == undefined ) o.loadMessage = 'Loading...';
			
			$(this).each( function() {

                var thisobj = $(this);

				function file_ext(name) {
					var len = name.length - name.lastIndexOf(".") - 1;
					var ext = name.substr(name.lastIndexOf(".") + 1, len);
					return ext.toLowerCase();
				}

                function gen_ul(obj) {
                    var sss = '<ul class="jqueryFileTree" style="display: none;">';
                    $.each(obj.files, function(index, item){
						if (item.isdir) {
                        sss = sss + '<li class="directory collapsed"><a href="#" rel="' + item.path + '">' + item.name + '</a></li>';
						} else {
                        sss = sss + '<li class="file ext_'+ file_ext(item.name) +'"><a href="#" rel="' + item.path + '">' + item.name + '</a></li>';
						}
                    });
                    sss = sss + '</ul>';
                    return sss;
                }

				function showTree(c, t) {
					$(c).addClass('wait');
					$(".jqueryFileTree.start").remove();
                    fileapi.list(t, true, function(data){
						$(c).find('.start').html('');
						$(c).removeClass('wait').append(gen_ul(data));
						if( o.root == t ) $(c).find('UL:hidden').show(); else $(c).find('UL:hidden').slideDown({ duration: o.expandSpeed, easing: o.expandEasing });
						bindTree(c);
					});
				}
				
				function bindTree(t) {
					$(t).find('LI A').bind(o.folderEvent, function() {
						if( $(this).parent().hasClass('directory') ) {
							if( $(this).parent().hasClass('collapsed') ) {
								// Expand
								if( !o.multiFolder ) {
									$(this).parent().parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });
									$(this).parent().parent().find('LI.directory').removeClass('expanded').addClass('collapsed');
								}
								$(this).parent().find('UL').remove(); // cleanup
								showTree( $(this).parent(), $(this).attr('rel'));
								$(this).parent().removeClass('collapsed').addClass('expanded');
							} else {
								// Collapse
								$(this).parent().find('UL').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });
								$(this).parent().removeClass('expanded').addClass('collapsed');
							}
                        }
                        thisobj.find('A').css("background", "none");
                        $(this).css("background", "#bdf");
                        h($(this).attr('rel'));
						return false;
					});
					// Prevent A from triggering the # on non-click events
					if( o.folderEvent.toLowerCase != 'click' ) $(t).find('LI A').bind('click', function() { return false; });
				}
				// Loading message
				$(this).html('<ul class="jqueryFileTree start"><li class="wait">' + o.loadMessage + '<li></ul>');
				// Get the initial file list
				showTree( $(this), o.root);
			});
		}
	});
	
})(jQuery);
