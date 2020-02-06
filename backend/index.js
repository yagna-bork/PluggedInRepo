const express = require('express');
const path = require('path');
const fs = require('fs');
const exif = require('exif-parser');
const multer = require('multer');
const piexif = require("piexifjs");
const dmsConversion = require('dms-conversion');
// const parseDms = dmsConversion.parseDms;


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
    console.log('req.file in post /images');
    console.log(req.file);

    console.log(req.body);

    //adding metadata to image
    var imgName = req.file.filename;
    var imgPath = path.join(imagesDirPath, imgName);
    var lat = JSON.parse(req.body.metadata).lat;
    var long = JSON.parse(req.body.metadata).long;

    console.log("lat upload before conversion: " + lat);
    console.log("long upload before conversion: " + long);

    // console.log("lat converison: " + deg_to_dms(lat));
    // console.log("long converison: " + deg_to_dms(long));

    const { longitude, latitude } = ConvertDDToDMS(lat, long);

    var jpeg = fs.readFileSync(imgPath);
    var data = jpeg.toString("binary");
    var exifObj = piexif.load(data);
    exifObj["GPS"][piexif.GPSIFD.GPSVersionID] = [7, 7, 7, 7];
    exifObj["GPS"][piexif.GPSIFD.GPSDateStamp] = "1999:99:99 99:99:99";
    exifObj["GPS"][piexif.GPSIFD.GPSLatitudeRef] = lat < 0 ? 'S' : 'N';
    exifObj["GPS"][piexif.GPSIFD.GPSLatitude] = ConvertDMSToFormat(latitude);
    exifObj["GPS"][piexif.GPSIFD.GPSLongitudeRef] = long < 0 ? 'W' : 'E';
    exifObj["GPS"][piexif.GPSIFD.GPSLongitude] = ConvertDMSToFormat(longitude);


    // console.log("long upload: ");
    console.log(exifObj["GPS"][piexif.GPSIFD.GPSLongitude]);
    // console.log("lat upload: ");
    console.log(exifObj["GPS"][piexif.GPSIFD.GPSLatitude]);

    var exifbytes = piexif.dump(exifObj);
    var newData = piexif.insert(exifbytes, data);
    var newJpeg = new Buffer(newData, "binary");
    fs.writeFileSync(imgPath + '-location', newJpeg);

    console.log("new method allowed");
  }
  res.send('Response from server');
});

//taken from https://github.com/hMatoba/piexifjs/issues/1
// function degToDmsRational(degFloat) {
//   var minFloat = degFloat % 1 * 60
//   var secFloat = minFloat % 1 * 60
//   var deg = Math.floor(degFloat)
//   var min = Math.floor(minFloat)
//   var sec = Math.round(secFloat * 100)

//   deg = Math.abs(deg) * 1
//   min = Math.abs(min) * 1
//   sec = Math.abs(sec) * 1

//   return [[deg, 1], [min, 1], [sec, 100]]
// }

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

    var dataStr = data.toString("binary");
    var img = piexif.load(dataStr);

    console.log(img);
    console.log(imgName);
    console.log(img.GPS[piexif.GPSIFD.GPSLongitude]);
    console.log(img.GPS[piexif.GPSIFD.GPSLatitude]);
    // console.log("piexif long: " + piexif.GPSHelper.dmsRationalToDeg(img.GPS[piexif.GPSIFD.GPSLongitude], img.GPS[piexif.GPSIFD.GPSLongitudeRef]));
    // console.log(imgExif.tags.GPSLongitude);
    // console.log("piexif lat: " + piexif.GPSHelper.dmsRationalToDeg(img.GPS[piexif.GPSIFD.GPSLatitude], img.GPS[piexif.GPSIFD.GPSLatitudeRef]));
    // console.log(imgExif.tags.GPSLatitude);


    // console.log(ConvertDMSToDD());

    var imgLat = piexif.GPSHelper.dmsRationalToDeg(img.GPS[piexif.GPSIFD.GPSLongitude], img.GPS[piexif.GPSIFD.GPSLongitudeRef]);
    var imgLong = piexif.GPSHelper.dmsRationalToDeg(img.GPS[piexif.GPSIFD.GPSLatitude], img.GPS[piexif.GPSIFD.GPSLatitudeRef]);
    
    if (getDistanceFromLatLonInMeters(userLatitude, userLongitude, imgLat, imgLong) < radius) {
      console.log(imgName + ": " + imgLat + "," + imgLong);
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