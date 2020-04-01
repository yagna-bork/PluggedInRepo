import mongoose from 'mongoose';

const { Schema } = mongoose;

const ImageReplySchema = new Schema({
  path: { type: String, required: true, unique: true },
  posted: { type: Date, default: Date.now },
});

const ImageSchema = new Schema(
  {
    path: { type: String, required: true, unique: true },
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
  },
  { collection: 'Image' },
);
ImageSchema.index({ location: '2dsphere' });

const Image = mongoose.model('Image', ImageSchema);
export default Image;
