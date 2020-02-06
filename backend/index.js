const express = require('express');
const path = require('path');
const fs = require('fs');
const exif = require('exif-parser');
const multer = require('multer');
const piexif = require("piexifjs");
const dmsConversion = require('dms-conversion');
// const parseDms = dmsConversion.parseDms;


// const userLatitude = 52.292016;
// const userLongitude = -1.532429;

const userLatitude = 37.31682222222223;
const userLongitude = -122.01681111111111;

const radius = 10000; //meters
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

      console.log("fetched images");
  
      for (var i = 0; i < imgNames.length; i++) {
        var imgName = imgNames[i];
        var imgPath = path.join(imagesDirPath, imgName);
        promises.push(readFileAndCheckDistancePromise(imgName, imgPath, validImageNames));
      }

      //after all readFile calls are finished
      Promise.all(promises).then(() => {
        console.log("here");
        res.send(validImageNames);
      }).catch(err => res.status(500).send(err));
      console.log(promises);
    }
    else {
      res.status(500).send();
    }
  });
});

app.post('/images', upload.single('image'), (req, res) => {
  if(req.file) {
    console.log("/images: POST incoming file");
    console.log(req.file);
    console.log(req.body);

    //adding metadata to image
    var imgName = req.file.filename;
    var imgPath = path.join(imagesDirPath, imgName);
    var lat = JSON.parse(req.body.metadata).lat;
    var long = JSON.parse(req.body.metadata).long;

    const { longitude, latitude } = ConvertDDToDMS(lat, long);

    var jpeg = fs.readFileSync(imgPath);
    var data = jpeg.toString("binary");
    var exifObj = piexif.load(data);
    exifObj["GPS"][piexif.GPSIFD.GPSVersionID] = [7, 7, 7, 7];
    exifObj["GPS"][piexif.GPSIFD.GPSDateStamp] = "1999:99:99 99:99:99";
    exifObj["GPS"][piexif.GPSIFD.GPSLatitudeRef] = lat < 0 ? 'S' : 'N';
    exifObj["GPS"][piexif.GPSIFD.GPSLatitude] = ConvertDMSToFormat(latitude); //todo need to find way to store more precise conversion values
    exifObj["GPS"][piexif.GPSIFD.GPSLongitudeRef] = long < 0 ? 'W' : 'E';
    exifObj["GPS"][piexif.GPSIFD.GPSLongitude] = ConvertDMSToFormat(longitude);

    var exifbytes = piexif.dump(exifObj);
    var newData = piexif.insert(exifbytes, data);
    var newJpeg = new Buffer(newData, "binary");
    fs.writeFileSync(imgPath, newJpeg);
  }
  res.send('Response from server');
});

function ConvertDDToDMS(lat, long) {
  const dmsCoords = new dmsConversion.default(lat, long);
  return dmsCoords.dmsArrays;
}

function ConvertDMSToFormat(dms) {
  return [[dms[0] ,1], [dms[1], 1], [dms[2], 100]];
}

//taken from https://stackoverflow.com/questions/1140189/converting-latitude-and-longitude-to-decimal-values
function ConvertDMSToDD(degrees, minutes, seconds, direction) {
  var dd = degrees + minutes / 60 + seconds / (60 * 60);

  if (direction == "S" || direction == "W") {
    dd = dd * -1;
  } // Don't do anything for N or E
  return dd;
}

var readFileAndCheckDistancePromise = function(imgName, imgPath, validImageNames) {
  return fs.promises.readFile(imgPath).then(data => {
    var parser = exif.create(data);
    var imgExif = parser.parse();
    var imgLat = imgExif.tags.GPSLatitude;
    var imgLong = imgExif.tags.GPSLongitude;

    if (getDistanceFromLatLonInMeters(userLatitude, userLongitude, imgLat, imgLong) < radius) {
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