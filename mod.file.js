
var path = require('path');
var fs = require('fs-extra');
var Promise = require("bluebird");

function get_file_info(ppath, filepath, filename)
{
    var ret = {name:filename, path:ppath + filename};
    return fs.stat(filepath + filename)
    .then( st => {
        ret.time = st.mtime;
        ret.size = st.size;
        ret.isdir = st.isDirectory();
        return ret;
    });
}

function listdir(params, cb)
{
    var rpath = 'home/' + params.session_uname + params.path;

    return fs.readdir(rpath)
    .then( files => {
        var work = [];
        files.forEach(function(name) {
            if (name[0] != '.') work.push( get_file_info(params.path, rpath, name) );
        });
        if (files.length > 0) return Promise.all(work);
        return [];
    })
    .then( files => {
        var oo = {result:true, path:params.path, total:0, page:0, pages:1, files:files};
        if (params.onlydir) {
            var dirs = [];
            for (var i = 0 ; i < files.length ; i ++ ) {
                if (files[i].isdir) dirs.push(files[i]);
            }
            oo.files = dirs;
        }
        cb(oo);
    })
    .catch( err => {
        console.log("list error", err.toString());
        cb({result: false, errcode: 500, errmsg: err.toString()});
    });
}

function mkdir(params, cb)
{
    var rpath = 'home/' + params.session_uname + '/' + params.newname;
    return fs.mkdir(rpath)
    .then( () => {
        cb({result:true});
    })
    .catch( err => {
        console.log("mkdir error", err.toString());
        cb({result: false, errcode: 500, errmsg: err.toString()});
    });
}

exports.listdir = listdir;
//exports.remove = remove;
//exports.rename = rename;
//exports.move = move;
exports.mkdir = mkdir;

