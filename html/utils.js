
function logout() {
    jpost('api', {method:'user.logout', params:{}}, function() {
        window.location.href = 'login.html';
    });
}

function show_alert(type, msg) {
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
}

function show_dialog (divid) {
    var w = ($(window).width() - $(''+divid).width()) / 2;
    var h = ($(window).height() - $(''+divid).height()) / 2 - 50;
    if (h < 10) h = 10;
    h = h + $(document).scrollTop();
    $(''+divid).css({"display":"block", "position":"absolute", "top":h+"px", "left":w+"px"});
}

function jpost(u, d, cb) {
    $.ajax({
        type: "POST",
        url: u,
        data: JSON.stringify(d),
        dataType: "json",
        contentType : 'application/json',
        success: function (data) {
            if (!data.resut && errcode == 1) {
                window.location.href = 'login.html';
                return ;
            }
            if (cb) cb(data);
        }
    });
}

function format_second (sec) {
    function pad(n){return (n<10 ? '0'+n : n);}
    var d = new Date(sec * 1000);
    return d.getFullYear()+'-'
        + pad(d.getMonth()+1)+'-'
        + pad(d.getDate())+' '
        + pad(d.getHours())+':'
        + pad(d.getMinutes())+':'
        + pad(d.getSeconds());
}

function format_date(ddd) {
    function pad(n){return (n<10 ? '0'+n : n);}
    var d = new Date(ddd);
    return d.getFullYear()+'-'
        + pad(d.getMonth()+1)+'-'
        + pad(d.getDate())+' '
        + pad(d.getHours())+':'
        + pad(d.getMinutes())+':'
        + pad(d.getSeconds());
}

