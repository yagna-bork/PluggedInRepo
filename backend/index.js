const express = require('express');
const app = express();

app.get('/', (req, res) => {
  console.log('GET at /');
  res.send('Hello World');
});

app.listen(3000, () => console.log("Listening on port 3000..."));