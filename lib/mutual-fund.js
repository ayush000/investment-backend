const axios = require('axios');
const moment = require('moment-timezone');

moment.tz.setDefault('Asia/Kolkata');

function getParsedData() {
  const yday = moment().subtract(1, 'day').format('DD-MMM-YYYY');
  const apiUrl = `http://portal.amfiindia.com/DownloadNAVHistoryReport_Po.aspx?mf=53&tp=1&frmdt=01-Apr-2015&todt=${yday}`;
  return axios.get(apiUrl)
    .then(response => {
      const { data } = response;
      const jsonData = data.substring(data.indexOf('1'))
        .split('\r\n')
        .filter(row => row.indexOf(';') !== -1)
        .map(row => {
          const splitted = row.split(';');
          return {
            name: splitted[1],
            value: splitted[2],
            date: splitted[splitted.length - 1],
          };
        });
      return Promise.resolve(jsonData);
      // res.send({ data: response.data });
    });
}

function getUniqueFunds(connection) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT DISTINCT name FROM funds', (err, data) => {
      if (err) return reject(err);
      resolve(data.map(row => row.name));
    });
  });
}

function getValueForDate(connection, name, date) {
  return new Promise((resolve, reject) => {
    const q = connection.query('SELECT * FROM funds WHERE name=? AND `date` <= ? ORDER BY `date` DESC LIMIT 1', [name, date], (err, data) => {
      // eslint-disable-next-line no-console
      console.log(q.sql);
      if (err) return reject(err);
      resolve(data[0] ? data[0].value : 0);
    });
  });
}

exports.getParsedData = getParsedData;
exports.getUniqueFunds = getUniqueFunds;
exports.getValueForDate = getValueForDate;