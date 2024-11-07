const feedbackService = require('../service/feedback-service');

class FeedbackControllers {
  async getFeedbacks(req, res, next) {
    try {
      const { user } = req.query;
      const feedbacks = await feedbackService.getFeedbacks(user);
      return res.json(feedbacks);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async createFeedback(req, res, next) {
    try {
      const userData = await feedbackService.createFeedback(req.body);
      return res.json(userData);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async changeFeedback(req, res, next) {
    try {
      const result = await feedbackService.changeFeedback(req.body);
      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
}
module.exports = new FeedbackControllers();
