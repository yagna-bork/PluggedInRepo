import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import dmsConversion from 'dms-conversion';
import crypto from 'crypto';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

// const parseDms = dmsConversion.parseDms;


// const userLatitude = 52.292016;
// const userLongitude = -1.532429;

const userLatitude = 37.33233141;
const userLongitude = -122.0312186;

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

app.use(bodyParser.json())

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
      res.send({ 'created': doc });
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
    if (!err) {
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

//parent images and their replies
//[{_id, path, replies: {posted, path}}]
app.get('/images/all/location', (req, res) => {
  console.log("Call to /images/all/location (GET).");

  //query database for paths
  const query = {
    location:
    {
      $near:
      {
        $geometry: { type: "Point", coordinates: [userLongitude, userLatitude] }
      }
    }
  };
  Image.find(query, { path: 1, replies: 1 }).exec((err, imgs) => {
    if (!err) {
      console.log("Retrieving items from db:", imgs);

      //[{_id, path, replies: {posted, path}}]
      var formattedImgs = imgs.map(parentImg => {
        var formattedReplies = parentImg.replies.map(reply => {
          return {
            posted: reply.posted,
            path: reply.path
          }
        });

        parentImg.replies = formattedReplies;
        return parentImg;
      });
      res.json(formattedImgs);
    }
    else {
      console.warn("err trying to get images in /images/all/location.", err);
      res.status(500).send(err);
    }
  });
});

//only get parent images without their replies
app.get('/images/all/location/only', (req, res) => {
  console.log("Call to /images/all/location (GET).");

  //query database for paths
  const query = {
    location:
    {
      $near:
      {
        $geometry: { type: "Point", coordinates: [userLongitude, userLatitude] }
      }
    }
  };
  Image.find(query, { path: 1 }).exec((err, imgs) => {
    if (!err) {
      console.log("Retrieving items from db:", imgs);
      res.json(imgs);
    }
    else {
      console.warn("err trying to get images in /images/all/location.", err);
      res.status(500).send(err);
    }
  }).catch(err => {
    console.log("Err trying to connect to db in /images/all/location: ", err);
    res.status(500).send("Err. Try again.", err);
  });
});

//get replies to a given image
app.get('/images/reply', (req, res) => {
  console.log("Call to /images/reply (GET).");

  var parentId = req.query.parentId;
  console.log("parentId inside images/reply: ", parentId);

  //query database for paths
  Image.findOne({ _id: parentId }, { replies: 1 }).exec((err, img) => {
    if (!err) {
      console.log("Retrieving items from db:", img);
      var repliesPathOnly = img.replies.map(reply => reply.path);
      console.log("About to send in /images/reply", repliesPathOnly);
      res.json(repliesPathOnly);
    }
    else {
      console.warn("err trying to get images in /images/reply.", err);
      res.status(500).send(err);
    }
  });
});

//new image posted
app.post('/images', upload.single('image'), (req, res) => {
  console.log("Call to /images (POST).");
  if (req.file) {
    console.log("Uploaded file is valid: ");
    console.log(req.file);

    //getting metadata for image
    var imgName = req.file.filename;
    var imgPath = path.join(imagesDirPath, imgName);
    var lat = JSON.parse(req.body.metadata).lat;
    var long = JSON.parse(req.body.metadata).long;

    //insert image in to db
    const location = { type: 'Point', coordinates: [long, lat] }
    Image.create({ path: imgName, location: location, replies: [] }, (err, doc) => {
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

//new reply to an image
app.post('/images/replies', upload.single('image'), (req, res) => {
  console.log("Call to /images/replies (POST).");
  if (req.file) {
    console.log("Uploaded file is valid: ");
    console.log(req.file);

    //only need name for replies, no location
    var imgName = req.file.filename;
    var parentId = JSON.parse(req.body.metadata).parentId;

    //insert reply in to db
    Image.updateOne({ _id: parentId }, { $push: { 'replies': { path: imgName } } }).exec((err, reply) => {
      if (!err) {
        console.log('Succesfully added reply: ', reply);
        res.json(reply);
      }
      else {
        console.warn("err trying to create doc in /images/new.");
        res.status(500).send(err);
      }
    });

    console.log("Saved reply succesfully.");
  }
  else {
    console.warn("Err trying to save file in POST:/images/replies");
    res.send("Err trying to save file in POST:/images/replies. Try again");
  }
});

function ConvertDDToDMS(lat, long) {
  const dmsCoords = new dmsConversion.default(lat, long);
  return dmsCoords.dmsArrays;
}

function ConvertDMSToFormat(dms) {
  return [[dms[0], 1], [dms[1], 1], [dms[2], 100]];
}

//taken from https://stackoverflow.com/questions/1140189/converting-latitude-and-longitude-to-decimal-values
function ConvertDMSToDD(degrees, minutes, seconds, direction) {
  var dd = degrees + minutes / 60 + seconds / (60 * 60);

  if (direction == "S" || direction == "W") {
    dd = dd * -1;
  } // Don't do anything for N or E
  return dd;
}

app.use('/images', (req, res, next) => {
  console.log(`@${Date.now()}`, ": call for image");
  next();
}, express.static(path.join(__dirname, 'images')));

app.listen(3000, () => console.log("Listening on port 3000..."));
