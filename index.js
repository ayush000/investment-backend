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

// API to get unique funds. 
app.get('/api/unique-funds', (req, res, next) => {
  mutualFund.getUniqueFunds(connection)
    .then(data => {
      res.send({
        uniqueFunds: data
      });
    })
    .catch(err => next(err));
});

// Function to import to mysql
app.get('/import', (req, res, next) => {
  const start = '01-Apr-2015',
    end = '01-Apr-2016',
    start2 = '02-Apr-2016',
    end2 = moment().format('DD-MMM-YYYY');
  mutualFund.importData(connection, start, end)
    .then(() => mutualFund.importData(connection, start2, end2))
    .catch(err => next(err));
});

// Receives input from form and stores a new fund with a start and end date.
// One fund can only be present once.
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

// API to display all the funds added
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
