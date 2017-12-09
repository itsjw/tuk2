const express = require('express');
const cors = require('cors');
const app = express();

const client = require('./hanaClient');
const kpiResource = require('./resources/kpiResource');
const commonDiseasesResource = require('./resources/commonDiseaseResource');

app.use(cors());

app.get('/KPI/:entity', kpiResource.getForEntity);
app.get('/most-common-diseases-by-year-of-birth', commonDiseasesResource.getDiseasesByYearOfBirth);
app.get('/most-common-diseases-correlations', commonDiseasesResource.getDiseasesCorrelation);

app.get('/table/:table', function (req, res) {
    client.exec('select * from ' + req.params.table, function (err, rows) {
        if (err) {
            return console.error('Execute error:', err);
        }
        res.send(rows);
    });
});

app.get('/count/:table', function (req, res) {
    client.exec('select count(*) as Count from ' + req.params.table, function (err, rows) {
        if (err) {
            return console.error('Execute error:', err);
        }
        res.send(rows);
    });
});

app.listen(3001, function () {
    console.log('Tuk2 Backend is listening on port 3001!');
});
