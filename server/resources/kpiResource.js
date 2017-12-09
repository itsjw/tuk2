const client = require('../hanaClient');

function getForEntity(req, res) {
  //generate filter where clause
  let where = '';
  where += req.query.year > 1500 ? ` AND "YearOfBirth" = ${req.query.year}` : '';
  where += req.query.gender === 'M' || req.query.gender === 'F' ? ` AND "Gender" = '${req.query.gender}'` : '';

  const queries = {
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
    if (err) {
      res.status(500).send('Hana query failed ' + err);
      return console.error('Execute error:', err);
    }
    res.send(rows);
  });
}

module.exports = { getForEntity };