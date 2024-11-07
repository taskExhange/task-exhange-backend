const { Schema, model } = require('mongoose');

const TaskSchema = new Schema({
  id: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  creator: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  categoryLabel: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  infoCompleted: {
    type: String,
    required: true,
  },
  inTop: {
    type: Boolean,
    required: true,
  },
  topDays: {
    type: String,
    required: true,
  },
  priceOneTask: {
    type: Number,
    required: true,
  },
  countTasks: {
    type: Number,
    required: true,
  },
  countDone: {
    type: Number,
    required: true,
  },
  countWait: {
    type: Number,
    required: true,
  },
  countRefused: {
    type: Number,
    required: true,
  },
  dateCreate: {
    type: String,
    required: true,
  },

  dateEnd: {
    type: String,
  },
  historyCompleted: {
    type: Array,
  },
});

module.exports = model('Tasks', TaskSchema);
