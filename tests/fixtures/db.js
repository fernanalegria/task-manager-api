const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { User, Task } = require("../../src/models");

const userOneId = new mongoose.Types.ObjectId();
const userOneToken = jwt.sign(
  {
    _id: userOneId
  },
  process.env.SECRET_KEY
);
const userOne = {
  _id: userOneId,
  name: "Mike",
  email: "mike@example.com",
  password: ":zH7g6DW8WU({)a#",
  tokens: [{ token: userOneToken }]
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwoToken = jwt.sign(
  {
    _id: userTwoId
  },
  process.env.SECRET_KEY
);
const userTwo = {
  _id: userTwoId,
  name: "Harry",
  email: "harry@example.com",
  password: "y4aCq(@C6?Qs6_8P",
  tokens: [{ token: userTwoToken }]
};

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: "First task",
  completed: false,
  owner: userOneId
};

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: "Second task",
  completed: true,
  owner: userOneId
};

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: "Third task",
  completed: true,
  owner: userTwoId
};

const setupDatabase = async () => {
  await Task.deleteMany();
  await User.deleteMany();
  await Promise.all([new User(userOne).save(), new User(userTwo).save()]);
  await Promise.all([
    new Task(taskOne).save(),
    new Task(taskTwo).save(),
    new Task(taskThree).save()
  ]);
};

module.exports = {
  setupDatabase,
  userOneId: userOneId.toString(),
  userOneToken,
  userOne,
  userTwoId: userTwoId.toString(),
  userTwoToken,
  userTwo,
  taskOneId: taskOne._id.toString()
};
