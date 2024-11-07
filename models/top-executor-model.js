const { Schema, model } = require('mongoose');

const TopExecutorModel = new Schema({
  name: {
    type: String,
    required: true,
  },
  profession: {
    type: String,
    required: true,
  },
  about: {
    type: String,
    required: true,
  },
  site: {
    type: String,
  },
  contacts: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  timeEnd: {
    type: Number,
    required: true,
  },
});

module.exports = model('TopExecutor', TopExecutorModel);
