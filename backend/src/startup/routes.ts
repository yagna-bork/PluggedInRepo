import express, { Application } from 'express';
import bodyParser from 'body-parser';
import path from 'path';

module.exports = (app: Application): void => {
  app.use(bodyParser.json());

  app.use('/images', (req, res, next) => {
    console.log(`@${Date.now()}`, ': call for image');
    next();
  },
  express.static(path.join(__dirname, 'images')));
};
