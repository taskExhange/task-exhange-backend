const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
  },
  loginGoogle: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
  },
  userImage: {
    type: String,
  },
  balance: {
    type: Number,
    default: 0,
  },
  contacts: {
    type: String,
  },
  website: {
    type: String,
  },
  info: {
    type: {
      aboutMe: String,
      profession: String,
      userName: String,
      contacts: String,
    },
  },
  role: {
    type: String,
    default: 'USER',
  },
  plan: {
    type: String,
    default: 'BASIC',
  },
  isActivated: {
    type: Boolean,
    default: false,
  },
  activatorLink: {
    type: String,
  },
  changePasswordLink: {
    type: String,
  },

  createdAt: {
    type: String,
  },
  lastVisit: {
    type: String,
  },

  messages: {
    type: [],
    default: [],
  },
  myTasks: {
    type: [],
    default: [],
  },
  completeTasks: {
    type: [],
    default: [],
  },
  waitCompleteTasks: {
    type: [],
    default: [],
  },

  historyPay: {
    type: [],
    default: [],
  },
  feedbacks: {
    type: [],
    default: [],
  },
  countTasksToday: {
    date: {
      type: String,
    },
    count: {
      type: Number,
    },
  },
});

module.exports = model('User', userSchema);
