const { Schema, model } = require('mongoose');

const categoryModel = new Schema({
  title: {
    type: String,
    unique: true,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    required: true,
  },
});

module.exports = model('Category', categoryModel);
