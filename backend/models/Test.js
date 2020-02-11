const mongoose = require('mongoose');
const schema = mongoose.Schema;

const TestSchema = new schema({
  name: {
    type: String,
    required: true
  },
});

module.exports = Test = mongoose.model('test', TestSchema);