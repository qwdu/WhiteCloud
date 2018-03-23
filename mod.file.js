
var path = require('path');
var fs = require('fs-extra');
var rimraf = require('rimraf');
var Promise = require("bluebird");

function get_file_info(params, ppath, filepath, filename)
{
    var ret = {name:filename, path:ppath + filename};
    return fs.stat(filepath + filename)
    .then( st => {
        ret.time = st.mtime;
        ret.size = st.size;
        ret.isdir = st.isDirectory();
        if (ret.isdir) {
            ret.path = ret.path + '/';
            if (ret.path == '/home/') {
                ret.path = ret.path + params.session_uname + '/';
                ret.name = '私人文件夹';
            }
        }
        return ret;
    });
}

function check_home(params, path)
{
    if ('/home' != path.substr(0, 5)) return true;
    var home_prefix = '/home/' + params.session_uname;
    if (home_prefix != path.substr(0, home_prefix.length)) return false;
    return true;
}

function listdir(params, cb)
{
    if ('/home/' == params.path || !check_home(params, params.path)) {
        cb({result: false, errcode: 13, errmsg: 'perm deny'});
        return ;
    }

    var rpath = 'storage' + params.path;

    return fs.readdir(rpath)
    .then( files => {
        var work = [];
        files.forEach(function(name) {
            if (name[0] != '.') work.push( get_file_info(params, params.path, rpath, name) );
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
        console.log("listdir error", err.toString());
        cb({result: false, errcode: 500, errmsg: err.toString()});
    });
}

function mkdir(params, cb)
{
    var rpath = 'storage/' + params.newname;
    return fs.mkdir(rpath)
    .then( () => {
        cb({result:true});
    })
    .catch( err => {
        console.log("mkdir error", err.toString());
        cb({result: false, errcode: 500, errmsg: err.toString()});
    });
}

function remove(params, cb)
{
    var work = [];
    for(var i = 0 ; i < params.path.length ; i++ ) {
        if (params.path[i] == '/home/') continue;
        if (params.path[i] == '/home/' + params.session_uname + '/') continue;
        if (!check_home(params, params.path[i])) continue;
        work.push( rimraf('storage' + params.path[i], function(){}) );
    }
    if (work.length == 0) {
        cb({result:true});
        return ;
    }

    return Promise.all(work)
    .then( xx => {
        cb({result:true});
    })
    .catch( err => {
        console.log("remove error", err.toString());
        cb({result: false, errcode: 500, errmsg: err.toString()});
    });
}

function rename(params, cb)
{
    var home_prefix = '/home/' + params.session_uname + '/';
    if ('/home/' == params.path || home_prefix == params.path || !check_home(params, params.path)) {
        cb({result: false, errcode: 13, errmsg: 'perm deny'});
        return ;
    }

    var f1 = 'storage' + params.path;
    var f2 = 'storage' + path.dirname(params.path) + '/' + params.newname;
    console.log(f1 + ' -> ' + f2);
    return fs.rename(f1, f2)
    .then( xx => {
        cb({result:true});
    })
    .catch( err => {
        console.log("rename error", err.toString());
        cb({result: false, errcode: 500, errmsg: err.toString()});
    });
}

function move(params, cb)
{
    var work = [];
    for(var i = 0 ; i < params.path.length ; i++ ) {
        if (params.path[i] == '/home/') continue;
        if (params.path[i] == '/home/' + params.session_uname + '/') continue;
        if (!check_home(params, params.path[i])) continue;
        var f1 = 'storage' + params.path[i];
        var f2 = 'storage' + params.todir + path.basename(params.path[i]);
        console.log(f1 + ' -> ' + f2);
        work.push( fs.rename(f1, f2) );
    }
    if (work.length == 0) {
        cb({result:true});
        return ;
    }

    return Promise.all(work)
    .then( xx => {
        cb({result:true});
    })
    .catch( err => {
        console.log("move error", err.toString());
        cb({result: false, errcode: 500, errmsg: err.toString()});
    });
}

function search(params, cb)
{
}

exports.listdir = listdir;
exports.listdir = listdir;
exports.mkdir = mkdir;
exports.remove = remove;
exports.rename = rename;
exports.move = move;
exports.search = search;

