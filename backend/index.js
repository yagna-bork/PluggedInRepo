const express = require('express');
const path = require('path');
const app = express();

app.get('/', (req, res) => {
  var firstImagePath = path.resolve(__dirname, 'images/download-1.jpg');
  res.sendFile(firstImagePath);
});

app.listen(3000, () => console.log("Listening on port 3000..."));