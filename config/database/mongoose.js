const connect = (dbURI, dbUser, dbPass) => {
  const mongoose = require('mongoose'); // eslint-disable-line
  // Set the native ES6 promise to mongoose since mongoose's mpromise is deprecated
  mongoose.Promise = Promise;
  return mongoose.connect(dbURI, { user: dbUser, pass: dbPass });
};

const isInvalidIdError = err =>
  Object.prototype.hasOwnProperty.call(err, 'name') && err.name === 'CastError' && Object.prototype.hasOwnProperty.call(err, 'path') && err.path === '_id';

const initModel = (name, schema) => {
  const mongoose = require('mongoose'); // eslint-disable-line
  const Schema = new mongoose.Schema(schema);
  return {
    findAll: () => mongoose.model(name, Schema).find({}),
    findOne: id => mongoose.model(name, Schema).findOne({ _id: id }),
    create: instance => mongoose.model(name, Schema).create(instance),
    save: instance => instance.save(),
    removeAll: () => mongoose.model(name, Schema).remove({})
  };
};

module.exports = { connect, initModel, isInvalidIdError };
