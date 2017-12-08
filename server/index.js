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
        //generate filter where clause
        let where = "";
        where += req.query.year > 1500 ? ` AND "YearOfBirth" = ${req.query.year}` : "";
        where += req.query.gender == 'M' || req.query.gender == 'F' ? ` AND "Gender" = '${req.query.gender}'` : "";
        
        queries = {
            'patients-count': `SELECT COUNT(*) AS "value", "State" AS "code" FROM PATIENT WHERE 1=1 ${where} GROUP BY "State"`,
            'visits-count': `SELECT COUNT(*) AS "value", "State" AS "code"
                            FROM PATIENT 
                            JOIN TRANSCRIPT ON PATIENT."PatientGuid" = TRANSCRIPT."PatientGuid" 
                            WHERE 1 = 1 ${where}
                            GROUP BY "State"`,
            'patients-relative': `SELECT PATIENTCOUNTS.PATIENTCOUNT / STATES."Population" * 1000 * 1000 AS "value", PATIENTCOUNTS.STATE as "code", STATES."State" as "state" FROM 
                                    (SELECT COUNT(*) AS PATIENTCOUNT, PATIENT."State" AS STATE FROM PATIENT 
                                    WHERE 1 = 1 ${where} 
                                    GROUP BY PATIENT."State") PATIENTCOUNTS
                                JOIN STATES ON STATES."Code" = PATIENTCOUNTS.STATE`,
            'visits-relative': `SELECT VISITCOUNTS.VISITCOUNT / STATES."Population" * 1000 * 1000 AS "value", VISITCOUNTS.STATE as "code", STATES."State" as "state" FROM 
                                    (SELECT COUNT(*) AS VISITCOUNT, PATIENT."State" AS STATE FROM PATIENT 
                                    JOIN TRANSCRIPT ON PATIENT."PatientGuid" = TRANSCRIPT."PatientGuid" 
                                    WHERE 1 = 1 ${where} 
                                    GROUP BY PATIENT."State") VISITCOUNTS
                                JOIN STATES ON STATES."Code" = VISITCOUNTS.STATE`,      
            'average-bmi': `SELECT AVG(BMI) AS "value", PATIENT."State" AS "code" FROM PATIENT 
                            JOIN TRANSCRIPT ON PATIENT."PatientGuid" = TRANSCRIPT."PatientGuid" 
                            WHERE BMI <> 0 ${where}
                            GROUP BY PATIENT."State"`,                        

        };
        console.log(queries[req.params.entity]);
        client.exec(queries[req.params.entity], function (err, rows) {
            client.end();
            if (err) {
                res.status(500).send('Hana query failed ' + err);
                return console.error('Execute error:', err);
            }
            res.send(rows);
        });
    });
});

app.get('/most-common-diseases-by-year-of-birth', function (req, res) {
    client.connect(function (err) {
        if (err) {
            return console.error('Connect error', err);
        }
        const query = `
            WITH TOPDIAGNOSES AS (
                SELECT TOP 10 "DIAGNOSIS"."DiagnosisDescription"
                FROM "DIAGNOSIS"
                GROUP BY "DIAGNOSIS"."DiagnosisDescription"
                ORDER BY COUNT(*) DESC
            ),
            PATIENTDIAGNOSES AS (
                SELECT DIAGNOSIS."DiagnosisDescription", PATIENT."YearOfBirth", COUNT(*) AS "Count"
                FROM DIAGNOSIS
                JOIN PATIENT ON PATIENT."PatientGuid" = DIAGNOSIS."PatientGuid"
                GROUP BY  DIAGNOSIS."DiagnosisDescription", PATIENT."YearOfBirth"
                ORDER BY COUNT(*) DESC
            ),
            YEARSOFBIRTH AS (
                SELECT DISTINCT "YearOfBirth"
                FROM PATIENT
            ),
            TOPDIAGNOSESPERYEAR AS (
                SELECT TOPDIAGNOSES."DiagnosisDescription", YEARSOFBIRTH."YearOfBirth", "Count" 
                FROM TOPDIAGNOSES
                CROSS JOIN YEARSOFBIRTH
                LEFT JOIN PATIENTDIAGNOSES 
                    ON TOPDIAGNOSES."DiagnosisDescription" = PATIENTDIAGNOSES."DiagnosisDescription" 
                    AND PATIENTDIAGNOSES."YearOfBirth" = YEARSOFBIRTH."YearOfBirth"
            )
            SELECT  "YearOfBirth", "DiagnosisDescription", COALESCE("Count", 0) AS "Count"
            FROM TOPDIAGNOSESPERYEAR
            ORDER BY "YearOfBirth", "DiagnosisDescription"
        `
        client.exec(query, function (err, rows) {
            client.end();
            if (err) {
                res.status(500).send('Hana query failed ' + err);
                return console.error('Execute error:', err);
            }
            let result = {};
            rows.forEach(element => {
                let year = element["YearOfBirth"];
                let diagnosis = element["DiagnosisDescription"];
                
                if(result[diagnosis] === undefined) { result[diagnosis] = {}; }
                result[diagnosis][year] =  element["Count"];
            });
            res.send(result);
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
