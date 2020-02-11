const mongoose = require('mongoose');
const schema = mongoose.Schema;

const TestSchema = new Schema({
  name: {
    type: String,
    required: true
  },
});

module.exports = Test = mongoose.model('test', TestSchema);