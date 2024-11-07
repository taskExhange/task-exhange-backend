const UserModel = require('../models/user-model');
const TopExecutorModel = require('../models/top-executor-model');
const bcrypt = require('bcryptjs');

const uuid = require('uuid');
const MailService = require('../service/mail-service');
const tokenService = require('../service/token-service');
const UserDto = require('../dtos/user-dto');
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

class UserService {
  async registration(name, email, password) {
    const candidateName = await UserModel.findOne({ name });
    if (candidateName) {
      throw ApiError.BadRequest(`Пользователь с таким логином уже зарегистрирован`);
    }
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest(`Пользователь с такой почтой уже зарегистрирован`);
    }
    const hashPassword = await bcrypt.hash(password, 3);
    const activatorLink = uuid.v4();
    const createdAt = `${new Date().getDate()}.${new Date().getMonth() + 1}.${new Date().getFullYear()}`;
    const user = await UserModel.create({
      email,
      password: hashPassword,
      isActivated: false,
      loginGoogle: false,
      activatorLink,
      name: name,
      userImage: '',
      role: 'USER',
      plan: 'BASIC',
      balance: 0,
      createdAt: createdAt,
      lastVisit: new Date().getTime(),
      messages: [],
      myTasks: [],
      completeTasks: [],
      info: {},
    });
    await MailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activatorLink}`);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    const userInfo = {
      _id: user._id,
      name: user.name,
      email: user.email,
      loginGoogle: user.loginGoogle,
      role: user.role,
      userImage: user.userImage,
      plan: user.plan,
      balance: user.balance,
      myTasks: user.myTasks,
      completeTasks: user.completeTasks,
      info: user.info,
      messages: user.messages,
      historyPay: user.historyPay,
      isActivated: user.isActivated,
      lastVisit: user.lastVisit,
    };
    return { ...tokens, user: userInfo };
  }
  async loginGoogle(name, email, userImage, isActivated, password) {
    const candidate = await UserModel.findOne({
      $or: [{ email: email }, { name: name }],
    });
    if (candidate) {
      const user = await UserModel.findOne({
        $or: [{ email: email }, { name: email }],
      });
      const userDto = new UserDto(user);
      const tokens = tokenService.generateTokens({ ...userDto });
      await tokenService.saveToken(userDto.id, tokens.refreshToken);
      const userInfo = {
        _id: user._id,
        name: user.name,
        email: user.email,
        loginGoogle: user.loginGoogle,
        role: user.role,
        userImage: user.userImage,
        plan: user.plan,
        balance: user.balance,
        myTasks: user.myTasks,
        completeTasks: user.completeTasks,
        info: user.info,
        messages: user.messages,
        historyPay: user.historyPay,
        isActivated: user.isActivated,
        lastVisit: user.lastVisit,
      };
      return { ...tokens, user: userInfo };
    }
    const hashPassword = await bcrypt.hash(password, 3);
    const createdAt = `${new Date().getDate()}.${new Date().getMonth() + 1}.${new Date().getFullYear()}`;
    const user = await UserModel.create({
      email,
      password: hashPassword,
      isActivated: isActivated,
      loginGoogle: true,
      activatorLink: '',
      name: name,
      userImage: userImage,
      role: 'USER',
      plan: 'BASIC',
      balance: 0,
      createdAt: createdAt,
      lastVisit: new Date().getTime(),
      messages: [],
      myTasks: [],
      completeTasks: [],
      info: {},
      historyPay: [],
    });
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    const userInfo = {
      _id: user._id,
      name: user.name,
      email: user.email,
      loginGoogle: user.loginGoogle,
      role: user.role,
      userImage: user.userImage,
      plan: user.plan,
      balance: user.balance,
      myTasks: user.myTasks,
      completeTasks: user.completeTasks,
      info: user.info,
      messages: user.messages,
      historyPay: user.historyPay,
      isActivated: user.isActivated,
      lastVisit: user.lastVisit,
    };
    return { ...tokens, user: userInfo };
  }
  async activate(link) {
    const user = await UserModel.findOne({ activatorLink: link });
    if (!user) {
      throw ApiError.BadRequest('Не удалося активувати аккаунт');
    }
    user.isActivated = true;
    await user.save();
  }
  async activatedUser(username) {
    const user = await UserModel.findOne({ name: username });
    if (!user) {
      return { messages: 'Пользователь не найден', status: 400 };
    }
    await MailService.sendActivationMail(user.email, `${process.env.API_URL}/api/activate/${user.activatorLink}`);
    return { messages: 'Письмо отправлено на почту', status: 200 };
  }
  async login(email, password) {
    const user = await UserModel.findOne({
      $or: [{ email: email }, { name: email }],
    });
    if (!user) {
      throw ApiError.BadRequest('Пользователя с такой почтой не существует');
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest('Не верный пароль или email');
    }
    await UserModel.updateOne({ email: email }, { $set: { lastVisit: new Date().getTime() } });
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    const userInfo = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      userImage: user.userImage,
      plan: user.plan,
      balance: user.balance,
      myTasks: user.myTasks,
      completeTasks: user.completeTasks,
      info: user.info,
      messages: user.messages,
      historyPay: user.historyPay,
      isActivated: user.isActivated,
      lastVisit: user.lastVisit,
    };
    return { ...tokens, user: userInfo };
  }
  async logout(refreshToken) {
    const response = await tokenService.removeToken(refreshToken);
    return response;
  }
  async refresh(refreshToken) {
    if (!refreshToken) {
      console.log('no refresh token');
      return {
        status: 401,
      };
    }

    const userData = await tokenService.validateRefreshToken(refreshToken);

    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      return {
        status: 401,
      };
    }
    const user = await UserModel.findOne({ email: userData.email });
    await UserModel.updateOne({ email: userData.email }, { $set: { lastVisit: new Date().getTime() } });
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    const userInfo = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      userImage: user.userImage,
      plan: user.plan,
      balance: user.balance,
      myTasks: user.myTasks,
      completeTasks: user.completeTasks,
      info: user.info,
      messages: user.messages,
      historyPay: user.historyPay,
      isActivated: user.isActivated,
      lastVisit: user.lastVisit,
    };
    return { ...tokens, user: userInfo };
  }
  async updateUserRole(id, role) {
    const updateDoc = {
      $set: {
        role: role,
      },
    };
    const options = { returnDocument: 'after' };
    const response = await UserModel.findOneAndUpdate({ _id: id }, updateDoc, options);
    if (response) {
      return { message: 'Успішно оновлено' };
    } else if (!response) {
      throw ApiError.BadRequest(`Не вдалося оновити`);
    } else {
      throw ApiError.BadRequest(`Якась помилка`);
    }
  }
  async updateUserInfo(updatedUser) {
    const updateDoc = {
      $set: {
        email: updatedUser.email,
        name: updatedUser.name,
        userImage: updatedUser.userImage,
        website: updatedUser.website,
        info: {
          aboutMe: updatedUser.info.aboutMe,
          profession: updatedUser.info.profession,
          userName: updatedUser.info.userName,
          contacts: updatedUser.info.contacts,
        },
      },
    };
    const options = { returnDocument: 'after' };
    const response = await UserModel.findOneAndUpdate({ name: updatedUser.name }, updateDoc, options);
    if (response) {
      return { message: 'Успешно обновлено' };
    } else if (!response) {
      throw ApiError.BadRequest(`Не удалось обновить`);
    } else {
      throw ApiError.BadRequest(`Какая-то ошибка`);
    }
  }
  async updateUserPassword(password) {
    const user = await UserModel.findOne({
      name: password.user,
    });
    if (!user) {
      throw ApiError.BadRequest('Error');
    }
    const isPassEquals = await bcrypt.compare(password.oldPassword, user.password);
    if (!isPassEquals) {
      return { message: 'Не верный пароль', status: 400 };
    }
    const hashPassword = await bcrypt.hash(password.newPassword, 3);
    const updateDoc = {
      $set: {
        password: hashPassword,
      },
    };
    const options = { returnDocument: 'after' };
    const response = await UserModel.findOneAndUpdate({ name: password.user }, updateDoc, options);
    const userDto = new UserDto(response);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }
  async getUsers() {
    const response = await UserModel.find();
    let users = response.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      contacts: user.info.contacts,
    }));
    return users;
  }
  async getUsersTopExecutor() {
    const currentDate = new Date();
    const currentTimestamp = currentDate.getTime();

    const usersSorted = await TopExecutorModel.find({
      timeEnd: { $gt: currentTimestamp },
    }).sort({ timeEnd: -1 });

    return usersSorted;
  }

  async addUsersTopExecutor(body) {
    const user = await UserModel.findOne({ name: body.name });
    if (!user) {
      return { message: 'Пользователь не найден', status: 400 };
    }
    const updateDoc = {
      $set: {
        balance: Number((user.balance - 4.99).toFixed(2)),
      },
    };
    const options = { returnDocument: 'after' };
    await UserModel.findOneAndUpdate({ name: body.name }, updateDoc, options);
    const currentDate = new Date();

    const oneMonthLater = new Date();
    oneMonthLater.setMonth(currentDate.getMonth() + 1);

    await TopExecutorModel.create({
      ...body,
      timeEnd: oneMonthLater.getTime(),
    });

    const currentTimestamp = currentDate.getTime();
    const users = await TopExecutorModel.find({
      timeEnd: { $gt: currentTimestamp },
    }).sort({ timeEnd: -1 });

    return users;
  }

  async getUser(name) {
    const user = await UserModel.findOne({ name: name });
    return user;
  }
  async sendMessages(messages) {
    const user = await UserModel.findOne({ name: messages.name });
    if (!user) {
      return { message: 'Пользователь не найден', status: 400 };
    }
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

    const updateDoc = {
      $push: {
        messages: {
          $each: [
            {
              status: messages.type,
              title: messages.title,
              text: messages.message,
              time: getFormattedDate(),
            },
          ],
          $position: 0, // Добавить сообщение в начало массива
        },
      },
    };
    const options = { returnDocument: 'after' };
    await UserModel.findOneAndUpdate({ name: messages.name }, updateDoc, options);
    return { message: 'Сообщение отправлено', status: 200 };
  }
  async sendFeedback(messages) {
    const user = await UserModel.findOne({ name: messages.name });
    if (!user) {
      return { message: 'Пользователь не найден', status: 400 };
    }
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

    const updateDoc = {
      $push: {
        feedbacks: {
          $each: [
            {
              id: messages.id,
              user: messages.name,
              status: messages.status,
              title: messages.title,
              text: messages.message,
              time: getFormattedDate(),
            },
          ],
          $position: 0, // Добавить сообщение в начало массива
        },
      },
    };
    const options = { returnDocument: 'after' };
    await UserModel.findOneAndUpdate({ name: messages.name }, updateDoc, options);
    return { message: 'Сообщение отправлено', status: 200 };
  }
  async changeBalance(body) {
    const user = await UserModel.findOne({ name: body.name });
    if (!user) {
      return { message: 'Пользователь не найден', status: 400 };
    }
    let newBalance = Number((user.balance + body.balance).toFixed(1));

    const updateDoc = {
      $set: {
        balance: newBalance,
      },
    };
    const options = { returnDocument: 'after' };
    await UserModel.findOneAndUpdate({ name: body.name }, updateDoc, options);
    return { status: 200 };
  }
  async changePlan(body) {
    const user = await UserModel.findOne({ name: body.name });
    if (!user) {
      return { message: 'Пользователь не найден', status: 400 };
    }
    if (user.balance < body.price) {
      return { message: 'Недостаточно средств', status: 400 };
    }

    const updateDoc = {
      $set: {
        plan: body.plan,
        balance: Number((user.balance - body.price).toFixed(2)),
      },
    };
    const options = { returnDocument: 'after' };
    const response = await UserModel.findOneAndUpdate({ name: body.name }, updateDoc, options);
    return { response, message: 'План успешно изменен', status: 200 };
  }
  async addTaskInListCompleted(body) {
    let task = body.task;
    const user = await UserModel.findOne({ name: body.name });
    if (!user) {
      return { message: 'Пользователь не найден', status: 400 };
    }
    const updateDoc = {
      $push: {
        completeTasks: {
          $each: [
            {
              inTop: task.inTop,
              id: task.id,
              title: task.title,
              description: task.description,
              priceOneTask: task.priceOneTask,
              status: task.status,
              creator: task.creator,
            },
          ],
          $position: 0, // Добавить сообщение в начало массива
        },
      },
    };
    const options = { returnDocument: 'after' };
    await UserModel.findOneAndUpdate({ name: body.name }, updateDoc, options);
    return { status: 200 };
  }
  async addHistoryBalance(body) {
    const user = await UserModel.findOne({ name: body.user });
    if (!user) {
      return { message: 'Пользователь не найден', status: 400 };
    }

    const updateDoc = {
      $push: {
        historyPay: {
          $each: [
            {
              ...body,
              id: user.historyPay.length === 0 ? 1 : user.historyPay.length,
              date: getFormattedDate(),
            },
          ],
          $position: 0,
        },
      },
    };
    const options = { returnDocument: 'after' };
    const response = await UserModel.findOneAndUpdate({ name: body.user }, updateDoc, options);
    return { user: response };
  }
  async changeHistoryBalance(body) {
    await UserModel.updateOne({ name: body.name, 'historyPay.hash': body.hash }, { $set: { 'historyPay.$.status': body.status } });

    const user = await UserModel.findOne({ name: body.name });
    return { user };
  }
}

module.exports = new UserService();
