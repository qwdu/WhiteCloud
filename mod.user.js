
var crypto = require('crypto');
var path = require('path');
var fs = require('fs-extra');
var Promise = require("bluebird");

function hash_password(password)
{
    return crypto.createHash('md5').update(password, "utf8", "binary").digest("hex");
}

function login(params, cb)
{
    var home_dir = path.join(__dirname, 'storage/home', params.username);
    if (!fs.existsSync(home_dir)) {
        cb({result: false, errcode: 2, errmsg: 'not exsit'});
        return ;
    }

    var conf_file = path.join(__dirname, 'storage/home', params.username, '.config.json');
    if (!fs.existsSync(conf_file)) {
        var conf = {
            name: params.username,
            level: 'user',
            key: hash_password(params.password)
        };
        fs.writeFile(conf_file, JSON.stringify(conf, null, 4), 'utf8', (err) => {
            if (err) console.log("login error", err.toString());
            cb({result: true, utype: conf.level, uname: params.username, uid: 9999});
        });
        return ;
    }

    var conf = require(conf_file);
    if (hash_password(params.password) == conf.key) {
        cb({result: true, utype: conf.level, uname: params.username, uid: 9999});
        return ;
    }

    cb({result: false, errcode: 3, errmsg: 'password invalid'});
}

function create(params, cb)
{
    if (params.session_utype != 'admin') {
        cb({result: false, errcode: 13, errmsg: 'perm deny'});
        return ;
    }

    var home_dir = path.join(__dirname, 'storage/home', params.username);
    if (fs.existsSync(home_dir)) {
        cb({result: false, errcode: 2, errmsg: 'already exsit'});
        return ;
    }

    var conf = {
        name: params.username,
        level: 'user',
        key: hash_password(params.password)
    };

    return fs.mkdir(home_dir)
    .then( () => {
        return fs.writeFile(conf_file, JSON.stringify(conf, null, 4), 'utf8');
    })
    .then( () => {
        cb({result: true});
    })
    .catch( err => {
        console.log("create error", err.toString());
        cb({result: false, errcode: 500, errmsg: err.toString()});
    });
}

function modify(params, cb)
{
    cb({result: false, errcode: 2, errmsg: 'not implement'});
}

function remove(params, cb)
{
    cb({result: false, errcode: 2, errmsg: 'not implement'});
}

function get_user_info(conf_path)
{
    return fs.readFile(conf_path, 'utf8')
    .then( data => {
        var conf = JSON.parse(data);
        return {name:name, utype:conf.level};
    });
}

function list(params, cb)
{
    var home_dir = path.join(__dirname, 'storage/home');

    return fs.readdir(home_dir)
    .then( files => {
        var work = [];
        files.forEach(function(name) {
            let conf_path = path.join(__dirname, 'storage/home', name);
            if (fs.existsSync(conf_path)) {
                work.push( get_user_info(conf_path) );
            }
        });
        return Promise.all(work);
    })
    .then ( users => {
        cb({result: true, users:users});
    })
    .catch( err => {
        console.log("list error", err.toString());
        cb({result: false, errcode: 500, errmsg: err.toString()});
    });
}

exports.list = list;
exports.create = create;
exports.remove = remove;
exports.modify = modify;
exports.login = login;

