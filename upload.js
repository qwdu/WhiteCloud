
var express = require('express');
var router = express.Router();
var session = require('express-session');
var fs = require('fs-extra');
var multer = require('multer');

function write_response(res, result)
{
    res.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
    var json = JSON.stringify(result);
    res.end(json);
}

function auth_check(req)
{
    if (!req.session.uid || !req.session.uname) {
        return false;
    }
    return true;
}

function fileFilter (req, file, cb) {
    if (auth_check(req)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

var upload_tmp = multer({
    storage: multer.memoryStorage(), 
    limits: {
        fileSize: 2048*1024*1024
    },
    fileFilter : fileFilter
});

router.post('/', upload_tmp.any(), function(req, res, next){
    var params = req.body;
    var fileobj = req.files[0];

    //console.log('------------------------');
    //console.log(params);
    //console.log(req.files);
    //console.log('------------------------');

    var tmp_path = './storage/tmp/' + params.name + '.tmpdata';

    var opt = {flags: 'w'};
    if (params.chunk > 0) opt = {flags: 'a'};
    var ws = fs.createWriteStream(tmp_path, opt);
    ws.write(fileobj.buffer, () => {
        ws.end(() => {
            if ((parseInt(params.chunk)+1) < parseInt(params.chunks)) {
                write_response(res, {result: true});
                return ;
            }
  
            var saveto = 'storage/' + params.savepath + params.name;
            if (fs.existsSync(saveto)) saveto = saveto + '.' + Date.now();
  
            return fs.rename(tmp_path, saveto)
            .then( () => {
                write_response(res, {result: true});
            })
            .catch( err => {
                console.log("upload error", err.toString());
                cb({result: false, errcode: 500, errmsg: err.toString()});
            });
        });
    });
});


module.exports = router;
                            
