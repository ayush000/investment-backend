const axios = require('axios');
const moment = require('moment-timezone');

moment.tz.setDefault('Asia/Kolkata');

function getParsedData(start, end) {
  // const yday = moment().subtract(1, 'day').format('DD-MMM-YYYY');
  const apiUrl = `http://portal.amfiindia.com/DownloadNAVHistoryReport_Po.aspx?mf=53&tp=1&frmdt=${start}&todt=${end}`;
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

function addFund(connection, fundName, unitsPurchased) {
  return new Promise((resolve, reject) => {
    const q = connection.query('INSERT INTO user_funds (fund_name, units) VALUES (?, ?)', [fundName, unitsPurchased], (err, row) => {
      // eslint-disable-next-line no-console
      console.log(q.sql);
      if (err) return reject(err);
      resolve(row.insertId);
    });
  });
}

function getFunds(connection) {
  return new Promise((resolve, reject) => {
    const yday = moment().subtract(4, 'day').format('YYYY-MM-DD');
    const q = connection.query('SELECT u.id id, f.name fund_name, f.value * u.units total_value, u.units units FROM user_funds u, funds f WHERE u.fund_name = f.name AND `date` = ?', [yday], (err, rows) => {
      // eslint-disable-next-line no-console
      console.log(q.sql);
      if (err) return reject(err);
      const data = rows.map(row => ({
        id: row.id,
        fundName: row.fund_name,
        value: row.total_value,
        units: row.units
      }));
      resolve(data);
    });
  });
}

function importData(connection, start, end) {
  return new Promise((resolve, reject) => {
    getParsedData(start, end)
      .then(data => {
        const insertData = data.map(row => [
          row.name,
          row.value,
          moment(row.date).format('YYYY-MM-DD')
        ]);
        const q = connection.query('INSERT INTO funds (name, value, date) VALUES ?', [insertData], (err) => {
          // eslint-disable-next-line no-console
          console.log(q.sql);
          if (err) return reject(err);
          resolve();
        });
        // res.send(insertData);
      });
  });
}

exports.getParsedData = getParsedData;
exports.getUniqueFunds = getUniqueFunds;
exports.getValueForDate = getValueForDate;
exports.addFund = addFund;
exports.getFunds = getFunds;
exports.importData = importData;