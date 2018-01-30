
var express = require('express');
var router = express.Router();

function write_response(res, result)
{
    res.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
    var json = JSON.stringify(result);
    res.end(json);
}

var mod_file = require('./mod.file.js');
var mod_user = require('./mod.user.js');

router.post('/', function (req, res, next)
{
    console.log("/api body", req.body);

    var method = req.body.method;
    var params = req.body.params;

    var ss = method.split(".");
    var func = ss[1];

    if (func != 'login') {
        if (!req.session.uid || !req.session.uname) {
            write_response(res, {result: false, errcode: 1, errmsg: 'not auth'});
            return ;
        }

        params.session_uid   = req.session.uid;
        params.session_uname = req.session.uname;
        params.session_utype = req.session.utype;
    }

    if (ss[0] == 'file') {
        mod_file[func](params, function(retjs) {
            write_response(res, retjs);
        });
        return ;
    }
    
    if (ss[0] == 'user') {
        if (func == 'logout') {
            req.session.destroy();
            write_response(res, {success: true});
            return;
        }
        mod_user[func](params, function(retjs) {
            if (func == 'login') {
                req.session.uid = retjs.uid;
                req.session.uname = retjs.uname;
                req.session.utype = retjs.utype;
            }
            write_response(res, retjs);
        });
        return ;
    }

    write_response(res, {result: false, errcode: 2, errmsg: 'not implement'});
});

module.exports = router;
