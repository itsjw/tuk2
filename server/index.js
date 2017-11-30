var config = require('./config.js');
var express = require('express');
var hdb = require('hdb');
var cors = require('cors');
var app = express();

app.use(cors())

var client = hdb.createClient(config.hana);

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/KPI/:entity', function (req, res) {
    client.connect(function (err) {
        if (err) {
            return console.error('Connect error', err);
        }
        let where = "1 = 1";
        where += req.query.year > 1500 ? ` AND "YearOfBirth" = ${req.query.year}` : "";
        where += req.query.gender == 'M' || req.query.gender == 'F' ? ` AND "Gender" = '${req.query.gender}'` : "";
        queries = {
            'patients-count': `SELECT COUNT(*) AS "value", "State" AS "code" FROM PATIENT WHERE ${where} GROUP BY "State"`
        };
        console.log(queries[req.params.entity]);
        client.exec(queries[req.params.entity], function (err, rows) {
            client.end();
            if (err) {
                return console.error('Execute error:', err);
            }
            res.send(rows);
        });
    });
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






