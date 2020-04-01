import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import crypto from 'crypto';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
// eslint-disable-next-line import/extensions
import Test from './models/Test';
// eslint-disable-next-line import/extensions
import Image, { IImage } from './models/Image';
import ImageReply, { IImageReply } from './models/ImageReply';

// interface Image {}

const userLatitude = 37.33233141;
const userLongitude = -122.0312186;

const imagesDirPath = path.join(__dirname, 'images');
const imgFileExt = 'jpg';

const app = express();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDirPath);
  },
  filename: (req, file, cb) => {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      cb(null, `${raw.toString('hex') + Date.now()}.${imgFileExt}`);
    });
  },
});

const upload = multer({ storage });

mongoose.connect('mongodb://mongo:27017/pluggedInDb', {
  useNewUrlParser: true,
// eslint-disable-next-line no-console
})
  .then(() => console.log('MongoDB connected'))
  // eslint-disable-next-line no-console
  .catch((err) => console.warn('Err trying to connection to MongoDb. \n', err));

app.use(bodyParser.json());

app.get('/db', (req, res) => {
  console.log('Call to GET:/db');
  Test.find({}).exec((err, docs) => {
    if (!err) {
      console.log('Retrieving items from db:', docs);
      res.send(docs);
    } else {
      console.warn('err trying to get collection in /db.');
      res.status(500).send(err);
    }
  });
});

// todo: make this a post
app.get('/db/create', (req, res) => {
  Test.create({ name: 'test1' }, (err, doc) => {
    if (!err) {
      console.log('added following doc to db: ', doc);
      res.send({ created: doc });
    } else {
      console.warn('err trying to create doc in /.');
      res.status(500).send(err);
    }
  });
});

app.get('/images/all', (req, res) => {
  console.log('Call to /images/all (GET).');
  fs.readdir(imagesDirPath, (err, files) => {
    if (!err) {
      console.log('Sending: ');
      console.log(files);
      res.send(files);
    } else {
      console.log('Sending err (500): ');
      console.log(err);
      res.status(500).send(err);
    }
  });
});

// parent images and their replies
// [{_id, path, replies: {posted, path}}]
// todo: distance?
app.get('/images/all/location', (req, res) => {
  console.log('Call to /images/all/location (GET).');

  // query database for paths
  const query = {
    location:
    {
      $near:
      {
        $geometry: { type: 'Point', coordinates: [userLongitude, userLatitude] },
      },
    },
  };
  Image.find(query, { path: 1, replies: 1 }).exec((err, imgs: [IImage]) => {
    if (!err) {
      console.log('Retrieving items from db:', imgs);

      // [{_id, path, replies: {posted, path}}]
      const formattedImgs = imgs.map((parentImg) => {
        const formattedReplies = parentImg.replies
          .map((reply: IImageReply): IImageReply => new ImageReply({
            posted: reply.posted,
            path: reply.path,
          }));

        return new Image({
          path: parentImg.path,
          location: parentImg.location,
          replies: formattedReplies,
        });
      });
      res.json(formattedImgs);
    } else {
      console.warn('err trying to get images in /images/all/location.', err);
      res.status(500).send(err);
    }
  });
});

// only get parent images without their replies
app.get('/images/all/location/only', (req: Request, res: Response) => {
  console.log('Call to /images/all/location (GET).');

  // query database for paths
  const query = {
    location:
    {
      $near:
      {
        $geometry: { type: 'Point', coordinates: [userLongitude, userLatitude] },
      },
    },
  };
  Image.find(query, { path: 1 }).exec((err, imgs) => {
    if (!err) {
      console.log('Retrieving items from db:', imgs);
      res.json(imgs);
    } else {
      console.warn('err trying to get images in /images/all/location.', err);
      res.status(500).send(err);
    }
  }).catch((err: unknown) => {
    console.log('Err trying to connect to db in /images/all/location: ', err);
    res.status(500).send(`Err. Try again. ${err}`);
  });
});

// get replies to a given image
app.get('/images/reply', (req, res) => {
  console.log('Call to /images/reply (GET).');

  const { parentId } = req.query;
  console.log('parentId inside images/reply: ', parentId);

  // query database for paths
  Image.findOne({ _id: parentId }, { replies: 1 }).exec((err, img) => {
    if (!err) {
      console.log('Retrieving items from db:', img);
      const repliesPathOnly = img.replies.map((reply) => reply.path);
      console.log('About to send in /images/reply', repliesPathOnly);
      res.json(repliesPathOnly);
    } else {
      console.warn('err trying to get images in /images/reply.', err);
      res.status(500).send(err);
    }
  });
});

// new image posted
app.post('/images', upload.single('image'), (req, res) => {
  console.log('Call to /images (POST).');
  if (req.file) {
    console.log('Uploaded file is valid: ');
    console.log(req.file);

    // getting metadata for image
    const imgName = req.file.filename;
    const { lat, long } = JSON.parse(req.body.metadata);

    // insert image in to db
    const location = { type: 'Point', coordinates: [long, lat] };
    Image.create({ path: imgName, location, replies: [] }, (err, doc) => {
      if (!err) {
        console.log('added following doc to Image collection: ', doc);
        res.send({ created: doc });
      } else {
        console.warn('err trying to create doc in /images/new.');
        res.status(500).send(err);
      }
    });

    console.log('Saved file with location succesfully.');
  } else {
    console.warn('Err trying to save file in POST:/images');
    res.send('Err trying to save file in POST:/images. Try again');
  }
});

// new reply to an image
app.post('/images/replies', upload.single('image'), (req, res) => {
  console.log('Call to /images/replies (POST).');
  if (req.file) {
    console.log('Uploaded file is valid: ');
    console.log(req.file);

    // only need name for replies, no location
    const imgName = req.file.filename;
    const { parentId } = JSON.parse(req.body.metadata);

    // insert reply in to db
    const query = { _id: parentId };
    const updateQuery = {
      $push: {
        replies: {
          path: imgName,
        },
      },
    };
    Image.updateOne(query, updateQuery).exec((err, reply) => {
      if (!err) {
        console.log('Succesfully added reply: ', reply);
        res.json(reply);
      } else {
        console.warn('err trying to create doc in /images/new.');
        res.status(500).send(err);
      }
    });

    console.log('Saved reply succesfully.');
  } else {
    console.warn('Err trying to save file in POST:/images/replies');
    res.send('Err trying to save file in POST:/images/replies. Try again');
  }
});

app.use('/images', (req, res, next) => {
  console.log(`@${Date.now()}`, ': call for image');
  next();
}, express.static(path.join(__dirname, 'images')));

app.listen(3000, () => console.log('Listening on port 3000...'));
