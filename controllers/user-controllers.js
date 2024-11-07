const ApiError = require('../exception/api-error');
const userService = require('../service/user-service');
const { validationResult } = require('express-validator');
const { MongoClient } = require('mongodb');
class UserControllers {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Не коректные данные', errors.array()));
      }
      const { name, email, password } = req.body;
      const userData = await userService.registration(name, email, password);
      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      return res.json(userData);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async loginGoogle(req, res, next) {
    try {
      const { name, email, userImage, isActivated, password } = req.body;
      const userData = await userService.loginGoogle(name, email, userImage, isActivated, password);
      return res.json(userData);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await userService.login(email, password);
      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie('refreshToken');
      return res.json(token);
    } catch (e) {
      next(e);
    }
  }
  async activate(req, res, next) {
    try {
      const activateLink = req.params.link;
      await userService.activate(activateLink);
      res.redirect(process.env.CLIENT_URL + '/tasks/pages/1');
    } catch (e) {
      next(e);
    }
  }
  async activatedUser(req, res, next) {
    try {
      const user = req.body;
      const response = await userService.activatedUser(user.username);
      return res.json(response);
    } catch (e) {
      next(e);
    }
  }
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const userData = await userService.refresh(refreshToken);
      return res.json(userData);
      // const { refreshToken } = req.cookies;
      // const userData = await userService.refresh(refreshToken);
      // res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      // return res.json(userData);
    } catch (e) {
      next(e);
    }
  }
  async getUsers(req, res, next) {
    try {
      const users = await userService.getUsers();
      return res.json(users);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async getUser(req, res, next) {
    try {
      const { name } = req.params;
      const users = await userService.getUser(name);
      return res.json(users);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async getUsersTopExecutor(req, res, next) {
    try {
      const users = await userService.getUsersTopExecutor();
      return res.json(users);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async addUsersTopExecutor(req, res, next) {
    try {
      const users = await userService.addUsersTopExecutor(req.body);
      return res.json(users);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async updateUserInfo(req, res, next) {
    const update = await userService.updateUserInfo(req.body);
    return res.json(update);
  }
  async updateUserPassword(req, res, next) {
    const update = await userService.updateUserPassword(req.body);
    return res.json(update);
  }
  async updateUserRole(req, res, next) {
    try {
      const role = req.body.role;
      const { id } = req.params;
      const result = await userService.updateUserRole(id, role);
      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async sendMessages(req, res, next) {
    try {
      const messages = req.body;
      const result = await userService.sendMessages(messages);
      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async sendFeedback(req, res, next) {
    try {
      const messages = req.body;
      const result = await userService.sendFeedback(messages);
      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async changeBalance(req, res, next) {
    try {
      const result = await userService.changeBalance(req.body);
      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async changePlan(req, res, next) {
    try {
      const result = await userService.changePlan(req.body);
      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async addTaskInListCompleted(req, res, next) {
    try {
      const result = await userService.addTaskInListCompleted(req.body);
      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async callback(req, res, next) {
    try {
      const data = req.body; // Данные от CryptoCloud
      console.log(data);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async addHistoryBalance(req, res, next) {
    try {
      const result = await userService.addHistoryBalance(req.body);
      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async changeHistoryBalance(req, res, next) {
    try {
      const result = await userService.changeHistoryBalance(req.body);
      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
}
module.exports = new UserControllers();
