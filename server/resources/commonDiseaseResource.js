const client = require('../hanaClient');

function getDiseasesByYearOfBirth(req, res) {
  const query = `
        WITH TOPDIAGNOSES AS (
            SELECT TOP 10 "DIAGNOSIS"."DiagnosisDescription"
            FROM "DIAGNOSIS"
            GROUP BY "DIAGNOSIS"."DiagnosisDescription"
            ORDER BY COUNT(*) DESC
        ),
        PATIENTDIAGNOSES AS (
            SELECT DIAGNOSIS."DiagnosisDescription", LEFT(PATIENT."YearOfBirth", 3) AS "YearOfBirth", COUNT(*) AS "Count"
            FROM DIAGNOSIS
            JOIN PATIENT ON PATIENT."PatientGuid" = DIAGNOSIS."PatientGuid"
            GROUP BY  DIAGNOSIS."DiagnosisDescription", LEFT(PATIENT."YearOfBirth", 3)
            ORDER BY COUNT(*) DESC
        ),
        YEARSOFBIRTH AS (
            SELECT DISTINCT LEFT(PATIENT."YearOfBirth", 3) AS "YearOfBirth"
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
        SELECT  "YearOfBirth" || '0s' AS "AGEGROUP", "DiagnosisDescription", COALESCE("Count", 0) AS "Count"
        FROM TOPDIAGNOSESPERYEAR
        ORDER BY "YearOfBirth", "DiagnosisDescription"
    `;
  client.exec(query, function (err, rows) {
    if (err) {
      res.status(500).send('Hana query failed ' + err);
      return console.error('Execute error:', err);
    }
    let result = {};
    rows.forEach(element => {
      let year = element['AGEGROUP'];
      let diagnosis = element['DiagnosisDescription'];

      if(result[diagnosis] === undefined) { result[diagnosis] = {}; }
      result[diagnosis][year] =  element['Count'];
    });
    res.send(result);
  });
}

function getDiseasesCorrelation(req, res) {
  const query = `
        WITH PATIENTDIAGNOSIS AS (
            SELECT
            DISTINCT 
            T."PatientGuid" AS "Patient",
            T."VisitYear" AS "VisitYear",
            REPLACE_REGEXPR('(\\D*)(\\d*)\\.(.*)' IN UPPER(D."ICD9Code") WITH '\\1\\2') AS "ICD9Code"
            FROM TRANSCRIPT T
            JOIN TRANSCRIPTDIAGNOSIS TD ON TD."TranscriptGuid" = T."TranscriptGuid"
            JOIN DIAGNOSIS D ON D."DiagnosisGuid" = TD."DiagnosisGuid"
        ), CORRDIAGNOSIS AS (
            SELECT TOP 10 
            COUNT(PD1."Patient") AS "COUNT", /*PD1."VisitYear",*/ PD1."ICD9Code" AS CODE1, PD2."ICD9Code" AS CODE2
            FROM PATIENTDIAGNOSIS PD1
            JOIN PATIENTDIAGNOSIS PD2 ON PD1."Patient" = PD2."Patient" AND PD1."VisitYear" = PD2."VisitYear" AND PD1."ICD9Code" > PD2."ICD9Code"
            GROUP BY PD1."ICD9Code", PD2."ICD9Code"/*, PD1."VisitYear"*/
            ORDER BY "COUNT" DESC
        )
        SELECT "COUNT", C1."SHORT DESCRIPTION" AS DISEASE1, C2."SHORT DESCRIPTION" AS DISEASE2 FROM CORRDIAGNOSIS
        LEFT JOIN ICD9CODES C1 ON C1."DIAGNOSIS CODE" = CORRDIAGNOSIS.CODE1 OR C1."DIAGNOSIS CODE" = CONCAT(CORRDIAGNOSIS.CODE1, '0') OR C1."DIAGNOSIS CODE" = CONCAT(CORRDIAGNOSIS.CODE1, '00')
        LEFT JOIN ICD9CODES C2 ON C2."DIAGNOSIS CODE" = CORRDIAGNOSIS.CODE2 OR C2."DIAGNOSIS CODE" = CONCAT(CORRDIAGNOSIS.CODE2, '0') OR C2."DIAGNOSIS CODE" = CONCAT(CORRDIAGNOSIS.CODE2, '00')
    `;
  client.exec(query, function (err, rows) {
    if (err) {
      res.status(500).send('Hana query failed ' + err);
      return console.error('Execute error:', err);
    }
    res.send(rows);
  });
}

function getDiseasesCorrelationPerRange(req, res) {
    const query = `
        WITH CLEANDIAGNOSIS AS (
            SELECT
            RANGE."Description" AS "ICD9RANGE",
            REPLACE_REGEXPR('(\\D*)(\\d*)\\.(.*)' IN UPPER(D."ICD9Code") WITH '\\1\\2') AS "ICD9Code",
            D."DiagnosisGuid"
            FROM DIAGNOSIS D
            JOIN ICD9CODERANGE RANGE 
                ON REPLACE_REGEXPR('(\\D*)(\\d*)\\.(.*)' IN UPPER(D."ICD9Code") WITH '\\2') >= RANGE."From" 
                AND REPLACE_REGEXPR('(\\D*)(\\d*)\\.(.*)' IN UPPER(D."ICD9Code") WITH '\\2') <= RANGE."To"
            WHERE REPLACE_REGEXPR('(\\D*)(\\d*)\\.(.*)' IN UPPER(D."ICD9Code") WITH '\\1') = ''
        ),
        PATIENTDIAGNOSIS AS (
            SELECT
            DISTINCT 
            T."PatientGuid" AS "Patient",
            T."VisitYear" AS "VisitYear",
            D."ICD9Code",
            D."ICD9RANGE"
            FROM TRANSCRIPT T
            JOIN TRANSCRIPTDIAGNOSIS TD ON TD."TranscriptGuid" = T."TranscriptGuid"
            JOIN CLEANDIAGNOSIS D ON D."DiagnosisGuid" = TD."DiagnosisGuid"
        ), CORRDIAGNOSIS AS (
            SELECT 
            COUNT(PD1."Patient") AS "COUNT",
            PD1."ICD9Code" AS CODE1, 
            PD2."ICD9Code" AS CODE2, 
            PD1."ICD9RANGE",
            RANK() OVER(PARTITION BY PD1.ICD9RANGE ORDER BY COUNT(PD1."Patient") DESC) AS RANK
            FROM PATIENTDIAGNOSIS PD1
            JOIN PATIENTDIAGNOSIS PD2 
                ON PD1."Patient" = PD2."Patient" 
                AND PD1."VisitYear" = PD2."VisitYear" 
                AND PD1."ICD9RANGE" = PD2."ICD9RANGE"
                AND PD1."ICD9Code" > PD2."ICD9Code"
            GROUP BY PD1."ICD9Code", PD2."ICD9Code", PD1."ICD9RANGE"/*, PD1."VisitYear"*/
            ORDER BY "COUNT" DESC
        )
        SELECT
         ICD9RANGE, 
         C1."SHORT DESCRIPTION" AS DISEASE1,
         C2."SHORT DESCRIPTION" AS DISEASE2
        FROM CORRDIAGNOSIS
        LEFT JOIN ICD9CODES C1 ON C1."DIAGNOSIS CODE" = CORRDIAGNOSIS.CODE1 OR C1."DIAGNOSIS CODE" = CONCAT(CORRDIAGNOSIS.CODE1, '0') OR C1."DIAGNOSIS CODE" = CONCAT(CORRDIAGNOSIS.CODE1, '00')
        LEFT JOIN ICD9CODES C2 ON C2."DIAGNOSIS CODE" = CORRDIAGNOSIS.CODE2 OR C2."DIAGNOSIS CODE" = CONCAT(CORRDIAGNOSIS.CODE2, '0') OR C2."DIAGNOSIS CODE" = CONCAT(CORRDIAGNOSIS.CODE2, '00')
        WHERE RANK = 1
        ORDER BY ICD9RANGE`;
  client.exec(query, function (err, rows) {
    if (err) {
      res.status(500).send('Hana query failed ' + err);
      return console.error('Execute error:', err);
    }
    res.send(rows);
  });    
}


module.exports = { getDiseasesByYearOfBirth, getDiseasesCorrelation, getDiseasesCorrelationPerRange };