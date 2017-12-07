
--Get the distribution of a disease over the year of birth
SELECT 
    COUNT(*) AS "Number of Diagnosis", 
    "DiagnosisDescription", 
    "YearOfBirth" 
FROM 
    "DIAGNOSIS" 
    INNER JOIN "PATIENT" 
    ON "PATIENT"."PatientGuid" = "DIAGNOSIS"."PatientGuid" 
WHERE 
    "DiagnosisDescription"='${req.params.disease}' 
GROUP BY 
    "YearOfBirth", 
    "DiagnosisDescription" 
ORDER BY 
    "YearOfBirth" DESC;

--Get the 10 most diagnosed diseases
SELECT 
    TOP 10 
    COUNT(*) AS "Number of Diagnosis", 
    "DiagnosisDescription" 
FROM 
    "DIAGNOSIS" 
GROUP BY 
    "DiagnosisDescription" 
ORDER BY 
    "Number of Diagnosis" DESC;

--Combine both
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
    "YearOfBirth" DESC;


--Select only complete datasets
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
    "YearOfBirth" DESC;

-- Combine all three
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