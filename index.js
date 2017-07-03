const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mutualFund = require('./lib/mutual-fund');
const mysql = require('mysql');
const moment = require('moment-timezone');

// Enter mysql credentials
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'ayush',
  password: 'root',
  database: 'investment'
});

moment.tz.setDefault('Asia/Kolkata');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.get('/api', (req, res, next) => {
  // res.send({ done: true });
  mutualFund.getUniqueFunds(connection)
    .then(data => {
      res.send({
        uniqueFunds: data
      });
    })
    .catch(err => next(err));
});

app.get('/abc', (req, res, next) => {
  mutualFund.getParsedData()
    .then(data => {
      res.json(data);
    })
    .catch(err => next(err));
});

// Function to import to mysql
app.get('/import', (req, res, next) => {
  mutualFund.getParsedData()
    .then(data => {
      const insertData = data.map(row => [
        row.name,
        row.value,
        moment(row.date).format('YYYY-MM-DD')
      ]);
      const q = connection.query('INSERT INTO funds (name, value, date) VALUES ?', [insertData], (err) => {
        // eslint-disable-next-line no-console
        console.log(q.sql);
        if (err) return next(err);
        res.send({ done: true });
      });
      // res.send(insertData);
    });
});

app.post('/api/new-fund', (req, res, next) => {
  const {
    amountInvested,
    selectedFund,
    purchaseDate } = req.body;
  const date = moment(purchaseDate).format('YYYY-MM-DD');
  const dateYday = moment()
    .subtract(1, 'day')
    .format('YYYY-MM-DD');
  Promise.all([
    mutualFund.getValueForDate(connection, selectedFund, date),
    mutualFund.getValueForDate(connection, selectedFund, dateYday)
  ]).then(data => {
    const valueOfOne = data[0];
    const valueOfOneYday = data[1];
    const unitsPurchased = amountInvested / valueOfOne;
    const valueYday = unitsPurchased * valueOfOneYday;
    mutualFund.addFund(connection, selectedFund, unitsPurchased)
      .then(id => {
        res.send({
          id,
          units: unitsPurchased,
          fundName: selectedFund,
          value: valueYday,
        });
      })
      .catch(err => next(err));
  }).catch(err => next(err));
});

app.get('/api/user-funds', (req, res, next) => {
  mutualFund.getFunds(connection)
    .then(data => { res.send(data); })
    .catch(err => next(err));
});

app.listen(3005, (err) => {
  // eslint-disable-next-line no-console
  if (err) return console.log(err);
  // eslint-disable-next-line no-console
  console.log('Server listening on port 3005');
});
