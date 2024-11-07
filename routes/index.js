const Router = require('express').Router;
const router = new Router();
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');
const fileMiddleware = require('../middlewares/file-middleeare');
const UserControllers = require('../controllers/user-controllers');
const TaskControllers = require('../controllers/task-controllers');
const CategoryControllers = require('../controllers/category-controllers');
const FeedbackControllers = require('../controllers/feedback-controllers');

router.post('/registration', body('email').isEmail(), body('password').isLength({ min: 3, max: 32 }), UserControllers.registration);

router.post('/login', UserControllers.login);
router.post('/login-google', UserControllers.loginGoogle);
router.post('/logout', UserControllers.logout);

router.get('/activate/:link', UserControllers.activate);
router.post('/activate-user', UserControllers.activatedUser);

// router.get('/refresh', UserControllers.refresh);
router.post('/refresh', UserControllers.refresh);

router.get('/users-top-executor', UserControllers.getUsersTopExecutor);
router.post('/users-top-executor', UserControllers.addUsersTopExecutor);
router.get('/user/:name', UserControllers.getUser);
router.put('/update-user-info', UserControllers.updateUserInfo);
router.put('/update-user-password', UserControllers.updateUserPassword);
router.post('/update-user-role/:id', authMiddleware, UserControllers.updateUserRole);
router.post('/send-messages', UserControllers.sendMessages);
router.post('/change-balance', UserControllers.changeBalance);
router.post('/change-plan', UserControllers.changePlan);
router.post('/add-task-in-list-completed', UserControllers.addTaskInListCompleted);
router.post('/callback', UserControllers.callback);
router.post('/add-history-balance', UserControllers.addHistoryBalance);
router.post('/change-history-balance', UserControllers.changeHistoryBalance);

router.post('/send-feedback', FeedbackControllers.createFeedback);
router.post('/change-feedback', FeedbackControllers.changeFeedback);
router.get('/get-feedbacks', FeedbackControllers.getFeedbacks);

router.get('/task/:id', TaskControllers.getTask);
router.post('/create-task', TaskControllers.createTask);
router.post('/update-task', TaskControllers.updateTask);
router.get('/get-my-tasks/:user', TaskControllers.getMyTasks);
router.get('/get-tasks', TaskControllers.getAllTasks);
router.get('/get-tasks-admin', TaskControllers.getAllTasksAdmin);
router.post('/complete-task', TaskControllers.completeTask);
router.post('/change-task-complete-status', TaskControllers.changeTaskCompleteStatus);
router.post('/change-status-task', TaskControllers.changeStatusTask);

router.get('/category', CategoryControllers.getAllCategorys);
router.post('/create-category', CategoryControllers.createCategory);
router.delete('/remove-category/:id', CategoryControllers.removeCategory);

router.post('/upload', fileMiddleware.array('images', 5), async (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      res.json(req.files); // Відправити інформацію про файли назад
    } else {
      res.status(400).send('No files uploaded.');
    }
  } catch (error) {
    next(error); // Передати помилку до обробника помилок
  }
});

module.exports = router;
