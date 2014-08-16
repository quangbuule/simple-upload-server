var express = require('express'),
    app = express(),
    async = require('async'),
    path = require('path'),
    fs = require('fs'),
    config = require('./config'),
    gm = require('gm'),
    request = require('request');

app.use(express.bodyParser());
app.use('/upload', express.static(path.join(__dirname, '/upload')));

app.get('/', function(req, res){
    res.set('Access-Control-Allow-Origin', '*');
    res.send('<h1>Simple Upload Server</h1><p>Created by quangbuule. Last update: 4:57 PM 7/24/2014</p>' +
            '<p>Please upload file(s) via route: ' + req.get('host') +
            config.uploadRoute + '</p>');
});

function _allowOrigiṇ̣ (req, res) {
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Allow-Headers', 'X-Requested-With');
    res.set('Access-Control-Allow-Origin', req.header('origin'));
};

app.options(config.uploadRoute, function (req, res) {
    _allowOrigiṇ̣(req, res);
    res.send(200);
});

function _copyFile(source, dest) {
    var fileContent = fs.readFileSync(source);
    fs.writeFileSync(dest, fileContent);
};

function _processUploadedFile (file, opts, callback) {
    var extName = path.extname(file.name).toLowerCase(),
        newFilename = (Math.random().toString(36) + '00000000000000000').slice(2, 18) + extName,
        newFilepath = path.join(config.uploadPath, newFilename),
        thumbFilename = (Math.random().toString(36) + '00000000000000000').slice(2, 18) + extName,
        thumbFilepath = path.join(config.uploadPath, thumbFilename);

    async.waterfall([
        function (callback) {
            var gmQuery = gm(file.path)
                .write(newFilepath, function (err) {
                    if (err) {
                        _copyFile(file.path, newFilepath);
                    }

                    callback(null);
                });
        },

        function (callback) {
            if (!opts.w) {
                return callback();
            }

            var maxWidth = Number(opts.w) || 100,
                _fallback = function (err) {
                    _copyFile(file.path, thumbFilepath);
                    return callback();
                };

            gm(file.path)
                .autoOrient()
                .stream(function (err, stdout, stderr) {
                    if (err) {
                        return _fallback(err);
                    }

                    gm(stdout)
                        .size(function (err, size) {
                            if (err || size.width <= maxWidth) {
                                return _fallback();
                            }

                            gm(file.path)
                            .autoOrient()
                            .resize(maxWidth, size.height * maxWidth/size.width)
                                .write(thumbFilepath, function (err) {
                                    return err ? fallback() : callback();
                                });
                        });
                })
        },

        function () {
            var ret = {
                url: config.returnUrl.replace('%s', newFilename),
                thumb: config.returnUrl.replace('%s', thumbFilename)
            };

            if (!opts.w) {
                delete ret.thumb;
            }

            callback(null, ret);
        }
    ]);
};

app.post(config.uploadRoute, function (req, res) {
    _allowOrigiṇ̣(req, res);

    var urls = [],
        thumbs = [],
        opts = req.query;

        callback = function (err) {
            if (err) {
                console.error(err.stack);
            }

            res.json(200, {
                message: 'Uploaded successfully',
                urls: urls,
                thumbs: thumbs
            });
        },

        files = [];

    if (req.files && req.files.files && Array.isArray(req.files.files)) {
        files = req.files.files;

    } else if (req.files) {
        for (var i in req.files) {
            files.push(req.files[i]);
        }
    }

    async.map(files, function (file, callback) {
        _processUploadedFile(file, opts, callback);
    }, function (err, rets) {
        urls = rets.map(function (ret) { return ret.url });
        thumbs = rets.map(function (ret) { return ret.thumb });
        callback(err);
    });
});

app.get(config.getRoute, function (req, res) {
    _allowOrigiṇ̣(req, res);

    var url = req.query.url;

    if (!url || !url.match(/^\w+\:\/\//)) {
        return res.json(400, {
            message: 'URL\'s not match standard'
        });
    }

    var headers = {
            'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Connection':'keep-alive',
            'Accept-Language':'en-US,en;q=0.8,vi;q=0.6',
            'User-Agent':'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1700.107 Safari/537.36'
        },
        filename = (Math.random().toString(36) + '00000000000000000').slice(2, 18) + '.jpg',
        filepath = path.join(config.uploadPath, filename);
        r = request({
                url: url,
                headers: headers
            }).pipe(fs.createWriteStream(filepath)),
        callback = function (err) {
            if (err) {
                console.error(err.stack);
                return res.json(500, {
                    error: err,
                    message: 'Error occured'
                });
            }

            res.json(200, {
                message: 'Got image successfully',
                urls: Array(config.returnUrl.replace('%s', filename))
            });
        };

    r.on('close', callback);
});

console.log('Simple Upload Server started at port ' + config.port);
console.log('Please upload file(s) via route: 0.0.0.0:' + config.port +
            config.uploadRoute);

app.listen(config.port);
