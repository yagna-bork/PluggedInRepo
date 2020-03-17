const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TestSchema = new Schema({
  name: 'string'
}, { collection: 'test' });

module.exports = Test = mongoose.model('test', TestSchema);