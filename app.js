
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var path = require('path');
var http = require('http');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'jscloud'
}));

app.use('/api', require('./api'));
//app.use('/upload', require('./upload'));

app.get('/public/:file(*)', function(req, res, next){
    var filePath = path.join(__dirname, 'public', req.params.file);
    res.download(filePath, function (err) {
        if (!err) return; // file sent
        if (err && err.status !== 404) return next(err); // non-404 error
        // file for download not found
        res.statusCode = 404;
        res.send('file not exist');
    });
});

app.get('/home/:file(*)', function(req, res, next){
	var ss = req.params.file.split('/');
	if (ss[0] != req.session.uname) return next();

    var filePath = path.join(__dirname, 'home', req.params.file);
    res.download(filePath, function (err) {
        if (!err) return; // file sent
        if (err && err.status !== 404) return next(err); // non-404 error
        // file for download not found
        res.statusCode = 404;
        res.send('file not exist');
    });
});

app.use(function(req, res, next) {
    console.log('404', req.url);
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err,err.message);
});

var server = http.createServer(app);
server.listen(3000);

