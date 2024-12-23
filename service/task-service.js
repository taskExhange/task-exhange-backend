const TaskModel = require('../models/task-model');
const UserModel = require('../models/user-model');
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
const getFormatted = () => {
  const date = new Date();

  // Получаем компоненты даты
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  // Формируем строку в нужном формате
  return `${day}.${month}.${year}`;
};
class TaskService {
  async createTask(body) {
    const tasks = await TaskModel.find();
    const result = await TaskModel.create({ ...body.newTask, id: tasks.length + 1 });
    if (!result) {
      return { message: 'Не получилось создать задание', status: 400 };
    }
    const user = await UserModel.findOne({ name: body.newTask.creator });
    const updateDoc = {
      $set: {
        balance: Number((user.balance - body.toPay).toFixed(2)),
      },
    };
    const options = { returnDocument: 'after' };
    await UserModel.findOneAndUpdate({ name: body.newTask.creator }, updateDoc, options);
    return { message: 'Задание создано', status: 200 };
  }
  async updateTask(body) {
    const task = await TaskModel.find({ id: body.id });
    if (!task) {
      return { message: 'Задание не найдено', status: 400 };
    }

    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().slice(0, 10);

    const updateDoc = {
      $set: {
        ...body,
        status: 'waiting',
        dateEnd: nextWeekStr,
      },
    };
    const options = { returnDocument: 'after' };
    const result = await TaskModel.findOneAndUpdate({ id: body.id }, updateDoc, options);
    if (!result) {
      return { message: 'Не получилось обновить задание', status: 400 };
    }
    return { message: 'Задание обновлено', status: 200 };
  }
  async deleteTask(id) {
    const task = await TaskModel.find({ id });
    if (!task) {
      return { message: 'Задание не найдено', status: 400 };
    }
    const result = await TaskModel.deleteOne({ id });
    if (!result) {
      return { message: 'Не получилось удалить задание', status: 400 };
    }
    const taskAll = await TaskModel.find();
    return { message: 'Задание удалено', status: 200, taskAll };
  }
  async getMyTasks(user) {
    const tasks = await TaskModel.find({ creator: user }).sort({ inTop: -1, id: -1 });
    return tasks;
  }
  async completeTask(body) {
    const user = await UserModel.findOne({ name: body.user });
    if (!user) {
      return { message: 'Пользователь не найден', status: 400 };
    }

    const findTaskInWaitComplete = user.waitCompleteTasks.find((task) => task.id === body.id);
    if (findTaskInWaitComplete) {
      return { message: 'Вы уже выполнили эту задачу', status: 400 };
    }
    // Проверка наличия и корректности массива completeTasks
    const completeTasks = Array.isArray(user.completeTasks)
      ? user.completeTasks.flat().map((task) => (task.toObject ? task.toObject() : task)) // Упрощаем структуру массива
      : [];

    // Проверяем, существует ли уже задача с данным id в completeTasks
    const taskExists = completeTasks.some((task) => task.id === body.id);

    if (taskExists) {
      return { message: 'Вы уже выполнили эту задачу', status: 400 };
    }
    if (user.countTasksToday.count === 5 && user.plan === 'BASIC') {
      return { message: 'Вы достигли лимита заданий', status: 400 };
    }
    if (user.countTasksToday.count === 15 && user.plan === 'START') {
      return { message: 'Вы достигли лимита заданий', status: 400 };
    }
    const tasks = await TaskModel.find({ id: body.id });
    const updateDoc = {
      $push: {
        historyCompleted: {
          $each: [
            {
              ...body,
              id: tasks[0].historyCompleted.length + 1,
            },
          ],
          $position: 0, // Добавить сообщение в начало массива
        },
      },
      $inc: { countWait: 1 }, // Увеличиваем значение countWait на 1
    };
    const options = { returnDocument: 'after' };
    await TaskModel.findOneAndUpdate({ id: body.id }, updateDoc, options);

    const updateDocUser = {
      $push: {
        waitCompleteTasks: {
          $each: [
            {
              id: tasks[0].id,
              title: tasks[0].title,
              description: tasks[0].description,
              priceOneTask: tasks[0].priceOneTask,
              status: tasks[0].status,
              creator: tasks[0].creator,
              countDone: tasks[0].countDone,
              countWait: tasks[0].countWait,
              countRefused: tasks[0].countRefused,
            },
          ],
          $position: 0, // Добавить сообщение в начало массива
        },
        countTasksToday: {
          $inc: { count: 1 },
          date: getFormatted(),
        },
      },
    };
    const optionsUser = { returnDocument: 'after' };
    await UserModel.findOneAndUpdate({ name: body.user }, updateDocUser, optionsUser);

    return { message: 'Задание отправлено на проверку', status: 200 };
  }

  async changeTaskCompleteStatus(body) {
    // Определяем, какое поле инкрементировать
    const incrementField = body.status === 'complete' ? { countDone: 1 } : { countRefused: 1 };

    const updateDoc = {
      $set: { 'historyCompleted.$.status': body.status },
      $inc: { ...incrementField, countWait: -1 },
    };

    const options = { returnDocument: 'after' };

    // Обновляем документ и возвращаем обновленный статус задачи
    await TaskModel.findOneAndUpdate({ id: body.id, 'historyCompleted.id': body.historyId }, updateDoc, options);
    const task = await TaskModel.findOne({ id: body.id });

    return { message: 'Статус обновлен', status: 200, task };
  }
  async changeStatusTask(body) {
    const updateDoc = {
      $set: {
        status: body.status,
      },
    };

    const options = { returnDocument: 'after' };

    await TaskModel.findOneAndUpdate({ id: body.id }, updateDoc, options);

    const task = await TaskModel.find();

    return { message: 'Статус обновлен', status: 200, task };
  }

  async getTask(params) {
    const task = await TaskModel.find({ id: params.id });
    let taskList = {
      id: task[0].id,
      title: task[0].title,
      priceOneTask: task[0].priceOneTask,
      description: task[0].description,
      creator: task[0].creator,
      countDone: task[0].countDone,
      countRefused: task[0].countRefused,
      countWait: task[0].countWait,
      historyCompleted: [...task[0].historyCompleted],
      infoCompleted: task[0].infoCompleted,
      link: task[0].link,
      categoryLabel: task[0].categoryLabel,
      category: task[0].category,
      status: task[0].status,
    };
    return taskList;
  }
  async getAllTasks(body) {
    const tasksCount = await TaskModel.countDocuments({
      ...(body.category !== 'all' && { category: body.category }),
      status: 'active',
      dateEnd: { $gte: new Date().toISOString().slice(0, 10) }, // сравниваем с текущей датой
    });

    const priceSort = body.price === '1' ? 1 : -1; // сортировка по возрастанию или убыванию
    const query = {
      ...(body.category !== 'all' && { category: body.category }),
      status: 'active',
      dateEnd: { $gte: new Date().toISOString().slice(0, 10) },
    };

    const tasks = await TaskModel.find(query)
      .sort({ inTop: -1, price: { $exists: true }, price: priceSort, id: -1 })
      .skip((body.page - 1) * body.limit)
      .limit(body.limit);

    let tasksList = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      priceOneTask: task.priceOneTask,
      description: task.description,
      creator: task.creator,
      inTop: task.inTop,
    }));
    return { tasks: tasksList, tasksCount };
  }
  async getAllTasksAdmin() {
    const tasks = await TaskModel.find();

    let tasksList = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      priceOneTask: task.priceOneTask,
      description: task.description,
      creator: task.creator,
      inTop: task.inTop,
      countDone: task.countDone,
      countRefused: task.countRefused,
      countWait: task.countWait,
      status: task.status,
      category: task.category,
    }));
    return { tasks: tasksList };
  }
}

module.exports = new TaskService();
