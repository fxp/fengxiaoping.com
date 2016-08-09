'use strict';
var express = require('express');
var timeout = require('connect-timeout');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var todos = require('./routes/todos');
var AV = require('leanengine');

var app = express();

// 设置模板引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('bower_components'));

// 设置默认超时时间
app.use(timeout('15s'));

// 加载云函数定义
require('./cloud');
// 加载云引擎中间件
app.use(AV.express());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.get('/', function (req, res) {
    res.render('index', {currentTime: new Date()});
});

// 可以将一类的路由单独保存在一个文件中
// app.use('/todos', todos);
var QR = require('qr-image');
var url = require('url');
app.get('/api/1/qrcode', function (req, res, next) {
    var img = QR.image(req.query.url);
    res.writeHead(200, {'Content-Type': 'image/png'});
    img.pipe(res);
});

var Credential = AV.Object.extend("Credential");
var multiparty = require('multiparty');
var fs = require('fs');

app.post('/api/1/credential/file', function (req, res, next) {
    // console.log(req.body.split('\n'));
    //
    // if (req.body.credential) {
    // }

    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {
        var credential = files.credential[0];
        if (credential.size == 0) {
            res.send('no file');
            return;
        }
        fs.readFile(credential.path, function (err, data) {
            if (err) {
                return res.send('read failed');
            }
            new AV.File(credential.originalFilename, data).save()
                .then(function (theFile) {
                    var lines = new Buffer(data).toString('utf8').split('\n');
                    lines.forEach(function (l) {
                        var parts = l.split(' ');
                        var credential = new Credential();
                        credential.set('protocol', parts[0]);
                        credential.set('host', parts[2]);
                        credential.set('username', parts[5]);
                        credential.set('password', parts[8]);

                        var query = new AV.Query(Credential);
                        query.equalTo('protocol', parts[0]);
                        query.equalTo('host', parts[2]);
                        query.equalTo('username', parts[5]);
                        query.equalTo('password', parts[8]);
                        query.first().then(function (c) {
                            if (!c) {
                                return credential.save();
                            }
                        }, function (err) {
                            return credential.save();
                        }).then(function (c) {
                            console.log(c.id);
                        }, function (err) {
                            console.log(err);
                        })
                    })
                    res.send(lines);
                }).catch(next);
        });
    });

});


app.use(function (req, res, next) {
    // 如果任何一个路由都没有返回响应，则抛出一个 404 异常给后续的异常处理器
    if (!res.headersSent) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    }
});

// error handlers
app.use(function (err, req, res, next) { // jshint ignore:line
    var statusCode = err.status || 500;
    if (statusCode === 500) {
        console.error(err.stack || err);
    }
    if (req.timedout) {
        console.error('请求超时: url=%s, timeout=%d, 请确认方法执行耗时很长，或没有正确的 response 回调。', req.originalUrl, err.timeout);
    }
    res.status(statusCode);
    // 默认不输出异常详情
    var error = {}
    if (app.get('env') === 'development') {
        // 如果是开发环境，则将异常堆栈输出到页面，方便开发调试
        error = err;
    }
    res.render('error', {
        message: err.message,
        error: error
    });
});

module.exports = app;
