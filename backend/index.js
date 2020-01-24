const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.get('/', (req, res) => {
  var imagesDirPath = path.join(__dirname, 'images');
  fs.readdir(imagesDirPath, (err, files) => {
    if(!err) {
      res.send(files);
    }
    else {
      res.status(500).send();
    }
  });
});

app.listen(3000, () => console.log("Listening on port 3000..."));