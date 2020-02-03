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
  var userLatitude = 52.292016;
  var userLongitude = -1.532429;


  var imagesDirPath = path.join(__dirname, 'images');
  fs.readdir(imagesDirPath, (err, imgNames) => {
    if(!err) {
      var promises = [];
      var validImageNames = [];
      
      // var imgPath = path.join(imagesDirPath, imgNames[1]);
      // fs.promises.readFile(imgPath, (err, data) => {
      //   console.log("here");
      //   if (!err) {
      //     // console.log("here");
      //     var parser = exif.create(data);
      //     var img = parser.parse();

      //     // console.log(imgPath + " lat: " + img.tags.GPSLatitude + " long: " + img.tags.GPSLongitude);
      //     // console.log(imgPath + " distance = " + getDistanceFromLatLonInMeters(userLatitude, userLongitude, img.tags.GPSLatitude, img.tags.GPSLongitude));
      //     if (getDistanceFromLatLonInMeters(userLatitude, userLongitude, img.tags.GPSLatitude, img.tags.GPSLongitude) < 20) {
      //       resolve("here");
      //     }
      //   }
      //   else {
      //     reject(err);
      //   }
      // }).then(result => {
      //   console.log(result);
      // });

      for (var i = 0; i < imgNames.length; i++) {
        var imgName = imgNames[i];
        var imgPath = path.join(imagesDirPath, imgName);
        promises.push(fs.promises.readFile(imgPath).then(data => {
          if (!err) {
            // console.log("here");
            var parser = exif.create(data);
            var img = parser.parse();

            if (getDistanceFromLatLonInMeters(userLatitude, userLongitude, img.tags.GPSLatitude, img.tags.GPSLongitude) < 20) {
              // console.log(imgPath + " lat: " + img.tags.GPSLatitude + " long: " + img.tags.GPSLongitude);
              // console.log(imgPath + " distance = " + getDistanceFromLatLonInMeters(userLatitude, userLongitude, img.tags.GPSLatitude, img.tags.GPSLongitude));
              validImageNames.push(imgName);
            }
          }
          else {
            console.log("err");
          }
        }));
      }

      Promise.all(promises).then(() => {
        //after all readFile calls are finished
        console.log(validImageNames);
        res.send(validImageNames);
      });
    }
    else {
      res.status(500).send();
    }
  });

  // var imagesDirPath = path.join(__dirname, 'images');
  // fs.readdir(imagesDirPath, (err, filesNames) => {
  //   if (!err) {
  //     validImageNames = [];
  //     filesNames.forEach(imgName => {
  //       var imgPath = path.join(imagesDirPath, imgName);
  //       fs.readFile(imgPath, (err, data) => {
  //         if(!err) {
  //           var parser = exif.create(data);
  //           var img = parser.parse();
            
  //           console.log(imgPath + " lat: " + img.tags.GPSLatitude + " long: " + img.tags.GPSLongitude);
  //           console.log(imgPath + " distance = " + getDistanceFromLatLonInMeters(userLatitude, userLongitude, img.tags.GPSLatitude, img.tags.GPSLongitude));
  //           if (getDistanceFromLatLonInMeters(userLatitude, userLongitude, img.tags.GPSLatitude, img.tags.GPSLongitude) < 20) {
  //             validImageNames.push(imgName);
  //             console.log(validImageNames);
  //           }
  //         }
  //       });
  //     });
  //     console.log(validImageNames);
  //     res.send(validImageNames);
  //   }
  //   else {
  //     res.status(500).send();
  //   }
  // });
});

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