const feedbackModel = require('../models/feedback-model');
const ApiError = require('../exception/api-error');
const getFormattedDate = () => {
  const date = new Date();

  // Получаем компоненты даты
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  // Получаем компоненты времени
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  // Формируем строку в нужном формате
  return `${day}.${month}.${year} ${hours}:${minutes}`;
};
class FeedbackService {
  async getFeedbacks(user) {
    if (user === 'all') {
      const feetbacks = await feedbackModel.find().sort({ createTime: -1 });
      return feetbacks;
    }
    const feetbacks = await feedbackModel.find({ user }).sort({ createTime: -1 });
    return feetbacks;
  }
  async createFeedback(body) {
    const feedbacks = await feedbackModel.find();
    const newFeedback = {
      ...body,
      id: feedbacks.length + 1,
      createTime: getFormattedDate(),
      updateTime: getFormattedDate(),
    };
    feedbacks.unshift(newFeedback);
    await feedbackModel.create(newFeedback);
    if (body.user === 'all') {
      const feetbacks = await feedbackModel.find().sort({ createTime: -1 });
      return feetbacks;
    }
    const feedbacksList = await feedbackModel.find({ user: body.user }).sort({ createTime: -1 });

    return { feedbacks: feedbacksList, message: 'Обращение создано', status: 200 };
  }

  async changeFeedback(body) {
    const update = {
      $set: {
        status: body.status,
        updateTime: getFormattedDate(),
      },
    };

    const options = { returnDocument: 'after' };
    const feedback = await feedbackModel.findOneAndUpdate({ _id: body.id }, update, options);
    if (!feedback) {
      return { message: 'Статус не обновлен', status: 400 };
    }
    return { message: 'Статус обновлен', status: 200 };
  }
}

module.exports = new FeedbackService();
