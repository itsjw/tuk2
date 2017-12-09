const client = require('../hanaClient');

const toNumList = string => string.split(',').map(Number);

function getInterpolationPoints() {
  const query = 'SELECT * FROM "EX3_1_EXPORTS"';
  return new Promise((resolve, reject) => {
    client.exec(query, (err, rows) => {
      if (err) return reject(err);
      rows.forEach(row => {
        row.INTERPOLATION = toNumList(row.INTERPOLATION.toString());
        row.PREDICTEDVISITS = toNumList(row.PREDICTEDVISITS.toString());
      });
      resolve(rows);
    })
  });
}

function getAgeGroups() {
  const query = 'SELECT "AGEGROUP", "AVGVISITS" FROM "EX3_AGEGROUPS"';
  return new Promise((resolve, reject) => {
    client.exec(query, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function getAvgVisits() {
  const query = 'SELECT "AGE", "AVGVISITS" FROM "TUKGRP2"."EX3_AVG_VISITS_PER_AGE"';
  return new Promise((resolve, reject) => {
    client.exec(query, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    })
  });
}

function getPatientVisitsData(req, res) {
  Promise.all([getAgeGroups(), getAvgVisits(), getInterpolationPoints()])
    .then(results => {
      res.send({
        ageGroups: results[0],
        avgVisits: results[1],
        interpolation: results[2],
      });
    })
}

module.exports = { getPatientVisitsData };
