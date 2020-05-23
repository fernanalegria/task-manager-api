const mongoose = require('mongoose');

mongoose.connect(`${process.env.MONGO_DB_URL}/${process.env.MONGO_DB_NAME}`, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

module.exports = mongoose;
