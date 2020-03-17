const express = require('express');
const path = require('path');
const fs = require('fs');
const exif = require('exif-parser');
const multer = require('multer');
const piexif = require("piexifjs");
const dmsConversion = require('dms-conversion');
const crypto = require('crypto');
const mongoose = require('mongoose');

// const parseDms = dmsConversion.parseDms;


// const userLatitude = 52.292016;
// const userLongitude = -1.532429;

const userLatitude = 37.31682222222223;
const userLongitude = -122.01681111111111;

const radius = 10000; //meters
const imagesDirPath = path.join(__dirname, 'images');
const imgFileExt = 'jpg';

const app = express();
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesDirPath);
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + imgFileExt);
    });
  }
});
const upload = multer({ storage: storage });
const Test = require('./models/Test');
const Image = require('./models/Image');
mongoose.connect('mongodb://mongo:27017/pluggedInDb', {
  useNewUrlParser: true
}).then(() => console.log("MongoDB connected"))
.catch(err => console.warn("Err trying to connection to MongoDb. \n", err));

app.get('/db', (req, res) => {
  console.log("Call to GET:/db");
  Test.find({}).exec((err, docs) => {
    if (!err) {
      console.log("Retrieving items from db:", docs);
      res.send(docs);
    }
    else {
      console.warn("err trying to get collection in /db.");
      res.status(500).send(err);
    }
  });
});

//todo: make this a post
app.get('/db/create', (req, res) => {
  Test.create({ name: "test1" }, (err, doc) => {
    if (!err) {
      console.log("added following doc to db: ", doc);
      res.send({'created': doc});
    }
    else {
      console.warn("err trying to create doc in /.");
      res.status(500).send(err);
    }
  });
});

app.get('/images/all', (req, res) => {
  console.log("Call to /images/all (GET).");
  fs.readdir(imagesDirPath, (err, files) => {
    if(!err) {
      console.log("Sending: ");
      console.log(files);
      res.send(files);
    }
    else {
      console.log("Sending err (500): ");
      console.log(err);
      res.status(500).send(err);
    }
  });
});

app.get('/images/all/location', (req, res) => {
  console.log("Call to /images/all/location (GET).");

//   [
//     '8d9eb4f243818462486c4b4a335800d41583915034688.jpg',
//      '64c49688d7ee67639cea0ce8a16add6c1583915140584.jpg',
//      '7c25aa15c7e3758339233ab94e03da1b1581685833120.jpg',
//      'ad163391aa21b0edbebeefd361d27f0b1581685809274.jpg'
//  ]
});

//new image posted
app.post('/images', upload.single('image'), (req, res) => {
  console.log("Call to /images (POST).");
  if(req.file) {
    console.log("Uploaded file is valid: ");
    console.log(req.file);

    //adding metadata to image
    var imgName = req.file.filename;
    var imgPath = path.join(imagesDirPath, imgName);
    var lat = JSON.parse(req.body.metadata).lat;
    var long = JSON.parse(req.body.metadata).long;

    //insert image in to db
    const location = { type: 'Point', coordinates: [long, lat] }
    Image.create({ path: imgName, location: location }, (err, doc) => {
      if (!err) {
        console.log("added following doc to Image collection: ", doc);
        res.send({ 'created': doc });
      }
      else {
        console.warn("err trying to create doc in /images/new.");
        res.status(500).send(err);
      }
    });
    
    console.log("Saved file with location succesfully.");
  }
  else {
    console.warn("Err trying to save file in POST:/images");
    res.send("Err trying to save file in POST:/images. Try again");
  }
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
      console.log(imgName + " is nearby to user.");
      validImageNames.push(imgName);
    }
  }).catch(err => {
    console.log("Err checking filtering " + imgName + " by location: ");
    console.log(err);
    console.log("Ignored error.");
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