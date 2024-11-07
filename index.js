require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const router = require('./routes/index');
const errormiddleware = require('./middlewares/error-middleware');
const path = require('path');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(
  cors({
    credentials: true,
    origin: 'https://task-exchange-indol.vercel.app',
  })
);
app.use(bodyParser.json({ limit: '10mb' })); // Увеличивает лимит для JSON запросов
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); // Увеличивает лимит для URL-кодированных запросов
app.use(express.json({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(cookieParser());
app.use('/api', router);
app.use(errormiddleware);

const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {});

    app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

start();
