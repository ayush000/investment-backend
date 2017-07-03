const app = require('express')()

app.listen(3005, (err) => {
  if (err) return console.log(err);
  console.log('Server listening on port 3000');
})