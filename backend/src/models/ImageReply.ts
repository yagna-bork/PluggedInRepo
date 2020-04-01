import mongoose, { Document, Schema } from 'mongoose';


// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IImageReply extends Document {
  path: string;
  posted: Date;
}

export const ImageReplySchema = new Schema({
  path: { type: String, required: true, unique: true },
  posted: { type: Date, default: Date.now },
});

export default mongoose.model<IImageReply>('ImageReply', ImageReplySchema);
