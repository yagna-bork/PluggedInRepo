const express = require('express');
const path = require('path');
const fs = require('fs');
const exif = require('exif-parser');

const app = express();

app.get('/images/all', (req, res) => {
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

app.get('/images/all/location', (req, res) => {
  var imagesDirPath = path.join(__dirname, 'images');
  fs.readdir(imagesDirPath, (err, filesName) => {
    if (!err) {
      var locations = [];
      filesName.forEach(fileName => {
        const buffer = fs.readFile(fileName, (err, data) => {
          if(!err) {
            console.log(data);
          }
        });
        const parser = exif.create(buffer);
        const result = parser.parse();
      });
    }
    else {
      res.status(500).send();
    }
  });
}) 

app.use('/images', express.static(path.join(__dirname, 'images')));

app.listen(3000, () => console.log("Listening on port 3000..."));