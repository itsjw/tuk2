const config = require('./config.js');
const hdb = require('hdb');

const client = hdb.createClient(config.hana);
client.connect((err) => {
  if (err) {
    console.error('Connect error', err);
  } else {
    console.log("Connected to HANA");
  }
});

module.exports = client;
