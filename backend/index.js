const express = require('express');
const path = require('path');
const fs = require('fs');
const exif = require('exif-parser');
const multer = require('multer');

const userLatitude = 52.292016;
const userLongitude = -1.532429;
const radius = 20; //meters
const imagesDirPath = path.join(__dirname, 'images');

const app = express();
const upload = multer({ dest: imagesDirPath });

app.get('/images/all', (req, res) => {
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
  fs.readdir(imagesDirPath, (err, imgNames) => {
    if(!err) {
      var promises = [];
      var validImageNames = [];
  
      for (var i = 0; i < imgNames.length; i++) {
        var imgName = imgNames[i];
        var imgPath = path.join(imagesDirPath, imgName);
        promises.push(readFileAndCheckDistancePromise(imgName, imgPath, validImageNames));
      }

      //after all readFile calls are finished
      Promise.all(promises).then(() => {
        res.send(validImageNames);
      }).catch(err => res.status(500).send(err));
    }
    else {
      res.status(500).send();
    }
  });
});

app.post('/images', upload.single('image'), (req, res) => {
  if(req.file) {
    console.log(req.file);
  }
  res.send('Response from server');
});

var readFileAndCheckDistancePromise = function(imgName, imgPath, validImageNames) {
  return fs.promises.readFile(imgPath).then(data => {
    var parser = exif.create(data);
    var img = parser.parse();

    if (getDistanceFromLatLonInMeters(userLatitude, userLongitude, img.tags.GPSLatitude, img.tags.GPSLongitude) < radius) {
      validImageNames.push(imgName);
    }
  });
}

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);  // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d * 1000; //distance in m
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}


app.use('/images', express.static(path.join(__dirname, 'images')));

app.listen(3000, () => console.log("Listening on port 3000..."));