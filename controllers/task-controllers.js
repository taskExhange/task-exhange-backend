const TaskService = require('../service/task-service');

class TaskControllers {
  async createTask(req, res, next) {
    try {
      const result = await TaskService.createTask(req.body);
      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async updateTask(req, res, next) {
    try {
      const result = await TaskService.updateTask(req.body);
      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async getMyTasks(req, res, next) {
    try {
      const user = req.params.user;
      const result = await TaskService.getMyTasks(user);
      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async getAllTasks(req, res, next) {
    try {
      const result = await TaskService.getAllTasks(req.query);
      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async getAllTasksAdmin(req, res, next) {
    try {
      const result = await TaskService.getAllTasksAdmin(req.query);
      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async getTask(req, res, next) {
    try {
      const result = await TaskService.getTask(req.params);
      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async completeTask(req, res, next) {
    try {
      const result = await TaskService.completeTask(req.body);
      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async changeTaskCompleteStatus(req, res, next) {
    try {
      const result = await TaskService.changeTaskCompleteStatus(req.body);
      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async changeStatusTask(req, res, next) {
    try {
      const result = await TaskService.changeStatusTask(req.body);
      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
}
module.exports = new TaskControllers();
