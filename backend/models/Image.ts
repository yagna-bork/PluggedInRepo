import mongoose, { Document, Schema } from 'mongoose';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IImageReply extends Document {
  path: string;
  posted: Date;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IImage extends Document {
  path: string;
  location: {
    type: string;
    coordinates: [number];
  };
  replies: [IImageReply];
}

export const ImageReplySchema = new Schema({
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

export default mongoose.model<IImage>('Image', ImageSchema);
