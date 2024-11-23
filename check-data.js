const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const TopExecutorModel = require('./models/top-executor-model');
const userModel = require('./models/user-model');
const TaskModel = require('./models/task-model');
async function checkData() {
  const updateDoc = {
    $push: {
      messages: {
        $each: [
          {
            status: 'information',
            title: 'Задачи проверяються',
            text: '',
            time: getFormattedDate(),
          },
        ],
        $position: 0, // Добавить сообщение в начало массива
      },
    },
  };
  const options = { returnDocument: 'after' };
  await userModel.findOneAndUpdate({ name: 'task_exchange' }, updateDoc, options);

  // Проверяем top-executor
  await checkTopExecutor();
  // Проверяем задания
  await checkTaskDate();
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
const checkTopExecutor = async () => {
  try {
    const result = await TopExecutorModel.find();
    result.forEach(async (item) => {
      const itemDate = new Date(item.timeEnd);
      const currentDate = new Date();

      itemDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);

      const timeDiff = itemDate - currentDate;

      // Конвертируем разницу в дни
      const daysLeft = timeDiff / (1000 * 3600 * 24);

      if (daysLeft == -1) {
        const updateDoc = {
          $push: {
            messages: {
              $each: [
                {
                  status: 'information',
                  title: item.name + ' Остался 1 день',
                  text: 'Вы завтра будете удалены из списка топ-исполнителей, вы сможете подать заявку заново',
                  time: getFormattedDate(),
                },
              ],
              $position: 0,
            },
          },
        };
        const options = { returnDocument: 'after' };
        await userModel.findOneAndUpdate({ name: item.name }, updateDoc, options);
      } else if (daysLeft <= 0) {
        const updateDoc = {
          $push: {
            messages: {
              $each: [
                {
                  status: 'information',
                  title: item.name + ' был удален из списка топ-исполнителей',
                  text: 'Подайте свою заявку заново',
                  time: getFormattedDate(),
                },
              ],
              $position: 0, // Добавить сообщение в начало массива
            },
          },
        };
        const options = { returnDocument: 'after' };
        await userModel.findOneAndUpdate({ name: item.name }, updateDoc, options);
        await TopExecutorModel.deleteOne({ name: item.name });
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const checkTaskDate = async () => {
  try {
    const result = await TaskModel.find();

    result.forEach(async (item) => {
      if (item.status == 'not_active') return;

      // Текущая дата
      const currentDate = new Date();

      // Дата для сравнения (например, 2024-11-30)
      const targetDate = new Date(item.dateEnd);

      // Устанавливаем время на полночь для обеих дат
      currentDate.setHours(0, 0, 0, 0);
      targetDate.setHours(0, 0, 0, 0);

      // Сравниваем даты
      if (currentDate < targetDate) {
        return;
      } else if (currentDate > targetDate) {
        const updateDoc = {
          $set: {
            status: 'not_active',
          },
        };

        const options = { returnDocument: 'after' };

        await TaskModel.findOneAndUpdate({ id: item.id }, updateDoc, options);
        const updateDocUser = {
          $push: {
            messages: {
              $each: [
                {
                  status: 'information',
                  title: 'Задание "' + item.title + '" было завершено',
                  text: `Выполнено: ${item.countDone} <br> Отменено: ${item.countRefused} <br> Ожидают: ${item.countWait}`,
                  time: getFormattedDate(),
                },
              ],
              $position: 0,
            },
          },
        };

        const optionsUser = { returnDocument: 'after' };
        await userModel.findOneAndUpdate({ name: item.creator }, updateDocUser, optionsUser);
      } else {
        const updateDocUser = {
          $push: {
            messages: {
              $each: [
                {
                  status: 'information',
                  title: 'Задание "' + item.title + '" будет завершено завтра',
                  text: `Выполнено: ${item.countDone} <br> Отменено: ${item.countRefused} <br> Ожидают: ${item.countWait}`,
                  time: getFormattedDate(),
                },
              ],
              $position: 0,
            },
          },
        };

        const optionsUser = { returnDocument: 'after' };
        await userModel.findOneAndUpdate({ name: item.creator }, updateDocUser, optionsUser);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
module.exports = checkData;
