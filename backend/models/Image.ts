import mongoose, { Document, Schema } from 'mongoose';
import ImageReply, { IImageReply } from './ImageReply';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IImage extends Document {
  path: string;
  location: {
    type: string;
    coordinates: [number];
  };
  replies: IImageReply[];
}

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
    replies: [ImageReply.schema],
  },
  { collection: 'Image' },
);
ImageSchema.index({ location: '2dsphere' });

export default mongoose.model<IImage>('Image', ImageSchema);
