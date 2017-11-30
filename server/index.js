var config = require('./config.js');
var express = require('express');
var hdb = require('hdb');
var app = express();

var client = hdb.createClient(config.hana);

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/:table', function (req, res) {
    client.connect(function (err) {
        if (err) {
            return console.error('Connect error', err);
        }
        client.exec('select * from ' + req.params.table, function (err, rows) {
            client.end();
            if (err) {
                return console.error('Execute error:', err);
            }
            res.send(rows);
        });
    });
});

app.get('/:table/count', function (req, res) {
    client.connect(function (err) {
        if (err) {
            return console.error('Connect error', err);
        }
        client.exec('select count(*) as Count from ' + req.params.table, function (err, rows) {
            client.end();
            if (err) {
                return console.error('Execute error:', err);
            }
            res.send(rows);
        });
    });
});

app.listen(3001, function () {
    console.log('Tuk2 Backend is listening on port 3001!');
});






