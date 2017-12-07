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
            SELECT 
                COUNT(*) AS "Number of Diagnosis", 
                "DIA"."DiagnosisDescription", 
                "PATIENT"."YearOfBirth",
                "DATACOUNT"."Count per Year"
            FROM 
                "DIAGNOSIS" AS "DIA"
                INNER JOIN (
                    SELECT
                        TOP 10
                        COUNT(*) AS "Number of Diagnosis", 
                        "D"."DiagnosisDescription" 
                    FROM 
                        "DIAGNOSIS" AS "D"
                    GROUP BY 
                        "D"."DiagnosisDescription"
                    ORDER BY 
                        "Number of Diagnosis" DESC
                ) AS "TOPDIAGNOSIS"
                    ON "TOPDIAGNOSIS"."DiagnosisDescription" = "DIA"."DiagnosisDescription"
                INNER JOIN "PATIENT"
                    ON "PATIENT"."PatientGuid" = "DIA"."PatientGuid"
                INNER JOIN (
                    SELECT 
                        COUNT(*) AS "Count per Year",
                        "YearOfBirth"
                    FROM (
                        SELECT 
                            COUNT(*) AS "Number of Diagnosis", 
                            "DIA"."DiagnosisDescription", 
                            "YearOfBirth" 
                        FROM 
                            "DIAGNOSIS" AS "DIA"
                            INNER JOIN (
                                SELECT
                                    TOP 10
                                    COUNT(*) AS "Number of Diagnosis", 
                                    "D"."DiagnosisDescription" 
                                FROM 
                                    "DIAGNOSIS" AS "D"
                                GROUP BY 
                                    "D"."DiagnosisDescription"
                                ORDER BY 
                                    "Number of Diagnosis" DESC
                            ) AS "TOPDIAGNOSIS"
                                ON "TOPDIAGNOSIS"."DiagnosisDescription" = "DIA"."DiagnosisDescription"
                            INNER JOIN "PATIENT"
                                ON "PATIENT"."PatientGuid" = "DIA"."PatientGuid"
                        GROUP BY 
                            "YearOfBirth", 
                            "DIA"."DiagnosisDescription" 
                        ORDER BY 
                            "YearOfBirth" DESC
                    )
                    GROUP BY 
                        "YearOfBirth"
                    ORDER BY 
                        "YearOfBirth" DESC
                ) AS "DATACOUNT"
                    ON "DATACOUNT"."YearOfBirth" = "PATIENT"."YearOfBirth"
            WHERE
                "Count per Year" = 10
            GROUP BY 
                "PATIENT"."YearOfBirth", 
                "DIA"."DiagnosisDescription" ,
                "DATACOUNT"."Count per Year"
            ORDER BY 
                "DIA"."DiagnosisDescription",
                "PATIENT"."YearOfBirth";
        `
        client.exec(query, function (err, rows) {
            client.end();
            if (err) {
                res.status(500).send('Hana query failed ' + err);
                return console.error('Execute error:', err);
            }
            // Preformat the data for the charting library
            let categories = [];
            let series = [];
            rows.forEach(element => {
                const currentYear = categories.find(category => {
                    return category == element["YearOfBirth"];
                });
                if(!currentYear) {
                    categories.push(element["YearOfBirth"]);
                }
                
                const currentSeries = series.find(a => {
                    return a["name"] == element["DiagnosisDescription"];
                });
                if(currentSeries) {
                    currentSeries.data.push(element["Number of Diagnosis"]);
                } else {
                    series.push({
                        name: element["DiagnosisDescription"],
                        data: [element["Number of Diagnosis"]]
                    });
                }
            });
            res.send({
                categories: categories,
                series: series
            });
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
