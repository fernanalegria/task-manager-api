const express = require('express');
const dotenv = require('dotenv');

// Read environment variables
dotenv.config();

require('./db');
const { userRouter, taskRouter } = require('./routers');

const app = express();

app.use(express.json());

// Routes
app.use('/users', userRouter);
app.use('/tasks', taskRouter);

module.exports = app;
