const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mutualFund = require('./lib/mutual-fund');
const mysql = require('mysql');
const moment = require('moment-timezone');
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
      console.log(insertData[0]);
      const q = connection.query('INSERT INTO funds (name, value, date) VALUES ?', [insertData], (err) => {
        console.log(q.sql);
        if (err) return next(err);
        res.send({ done: true });
      });
      // res.send(insertData);
    });
});

app.post('/api/current-value', (req, res, next) => {
  const {
    amountInvested,
    selectedFund,
    purchaseDate } = req.body;
  const date = moment(purchaseDate).format('YYYY-MM-DD');
  console.log(date);
  mutualFund.getValueForDate(connection, selectedFund, date)
    .then(valueOfOne => {
      const unitsPurchased = amountInvested / valueOfOne;
      const dateYday = moment()
        .subtract(1, 'day')
        .format('YYYY-MM-DD');
      mutualFund.getValueForDate(connection, selectedFund, dateYday)
        .then(valueOfOneYday => {
          const valueYday = unitsPurchased * valueOfOneYday;
          console.log({ unitsPurchased, valueOfOne, valueOfOneYday, valueYday });
          res.send({ data: valueYday });
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
  // res.send({ done: true });
});

app.listen(3005, (err) => {
  // eslint-disable-next-line no-console
  if (err) return console.log(err);
  // eslint-disable-next-line no-console
  console.log('Server listening on port 3005');
});
