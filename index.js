var express = require('express'),
    app = express(),
    async = require('async'),
    path = require('path'),
    fs = require('fs'),
    config = require('./config'),
    gm = require('gm');

app.use(express.bodyParser());
app.use('/upload', express.static(path.join(__dirname, '/upload')));

app.get('/', function(req, res){
    res.set('Access-Control-Allow-Origin', '*');
    res.send('<h1>Simple Upload Server</h1><p>Created by quangbuule.</p>' +
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

function _processUploadedFile (file, callback) {
    var extName = path.extname(file.name).toLowerCase(),
        newName = Date.now(),
        newFilename = newName + extName,
        newFilepath = path.join(config.uploadPath, newFilename);

    gm(file.path)
        .autoOrient()
        .write(newFilepath, function (err) {
            if (err) {
                var fileContent = fs.readFileSync(file.path);
                fs.writeFileSync(newFilepath, fileContent);
            }

            callback(null, config.returnUrl.replace('%s', newFilename));
        });
};

app.post(config.uploadRoute, function (req, res) {
    _allowOrigiṇ̣(req, res);

    var ret = [],

        callback = function () {
            res.json(200, {
                message: 'Uploaded Successfully!',
                urls: ret
            });
        },

        files;

    if (req.files && req.files.files && Array.isArray(req.files.files)) {
        files = req.files.files;

    } else if (req.files) {
        files = req.files;
    }

    async.map(files, function (file, callback) {
        _processUploadedFile(file, callback);
    }, function (err, urls) {
        ret = urls;
        callback(err);
    });
});

console.log('Simple Upload Server started at port ' + config.port);
console.log('Please upload file(s) via route: 0.0.0.0:' + config.port +
            config.uploadRoute);

app.listen(config.port);
