import mongoose from 'mongoose';

const { Schema } = mongoose;

const TestSchema = new Schema({
  name: { type: String },
}, { collection: 'test' });

const Test = mongoose.model('test', TestSchema);
export default Test;
