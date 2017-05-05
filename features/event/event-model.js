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

const getAll = () => mongoose.model('Event', EventSchema).find({});
const getOneById = id => mongoose.model('Event', EventSchema).findOne({ _id: id });
const create = newEvent => mongoose.model('Event', EventSchema).create(newEvent);
const update = event => event.save();
const deleteAll = () => mongoose.model('Event', EventSchema).remove({});

module.exports = { getAll, getOneById, create, update, deleteAll };
