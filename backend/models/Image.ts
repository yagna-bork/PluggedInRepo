import mongoose from 'mongoose';

const { Schema } = mongoose;

const ImageReplySchema = new Schema({
  path: 'string',
  posted: { type: Date, default: Date.now },
});

const ImageSchema = new Schema({
  path: 'string',
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  replies: [ImageReplySchema],
}, { collection: 'Image' });
ImageSchema.index({ location: '2dsphere' });

const Image = mongoose.model('Image', ImageSchema);
export default Image;
