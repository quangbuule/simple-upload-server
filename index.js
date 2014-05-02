var express = require('express'),
    app = express(),
    path = require('path'),
    fs = require('fs'),
    config = require('./config');

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

function _copyUploadedFile (file) {
    var extName = path.extname(file.name).toLowerCase(),
        newName = Date.now(),
        newFilename = newName + extName;

    var fileContent = fs.readFileSync(file.path);
    fs.writeFileSync(path.join(config.uploadPath, newFilename), fileContent);

    return config.returnUrl.replace('%s', newFilename);
};

app.post(config.uploadRoute, function (req, res) {
    _allowOrigiṇ̣(req, res);

    var ret = [];

    if (req.files && req.files.files && Array.isArray(req.files.files)) {
        ret = req.files.files.map(function (file) {
            return _copyUploadedFile(file);
        });

    } else if (req.files) {
        for (var k in req.files) {
            ret.push(_copyUploadedFile(file));
        }
    }


    res.json(200, {
        message: 'Uploaded Successfully!',
        urls: ret
    });
})

console.log('Simple Upload Server started at port ' + config.port);
console.log('Please upload file(s) via route: 0.0.0.0:' + config.port +
            config.uploadRoute);

app.listen(config.port);
