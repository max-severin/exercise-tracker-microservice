const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

require('dotenv').config();

app.use(cors());

app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/view/index.html`)
});





const listener = app.listen(port || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});