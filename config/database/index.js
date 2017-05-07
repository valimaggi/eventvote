require('dotenv').config();

let db;
if (process.env.DB_ODM === 'mongoose') {
  db = require('./mongoose'); // eslint-disable-line
} else {
  throw Error('DB_ODM environment variable invalid value or not set');
}

module.exports = {
  connect: db.connect,
  isInvalidDBIdError: db.isInvalidIdError,
  initModel: db.initModel
};
