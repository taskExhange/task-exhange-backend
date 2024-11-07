const { Schema, model } = require('mongoose');

const feedbackModel = new Schema({
  id: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  createTime: {
    type: String,
    required: true,
  },
  updateTime: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
});

module.exports = model('Feedbacks', feedbackModel);
