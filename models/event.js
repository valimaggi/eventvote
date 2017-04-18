const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const EventSchema = new Schema({
  id: String,
  name: String,
  dates: [Date],
  votes: [{
    _id: false,
    date: Date,
    people: [String]
  }],
});

function getAll() {
  return mongoose.model('Event', EventSchema).find({});
}

function getOneById(id) {
  return mongoose.model('Event', EventSchema).findOne({ _id: id });
}

function create(newEvent) {
  return mongoose.model('Event', EventSchema).create(newEvent);
}

function update(event) {
  return event.save();
}

function deleteAll() {
  return mongoose.model('Event', EventSchema).remove({});
}

module.exports = { getAll, getOneById, create, update, deleteAll };
