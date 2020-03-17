const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  path: 'string',
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
}, { collection: 'Image' });
ImageSchema.index({ location: "2dsphere" });

module.exports = Image = mongoose.model('Image', ImageSchema);