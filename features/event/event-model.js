const { initModel } = require('../../config/database');

const EventSchema = {
  id: String,
  name: String,
  dates: [Date],
  votes: [{
    _id: false,
    date: Date,
    people: [String]
  }],
};

const model = initModel('Event', EventSchema);
const getAll = () => model.findAll();
const getOneById = id => model.findOne(id);
const create = newEvent => model.create(newEvent);
const update = event => model.save(event);
const deleteAll = () => model.removeAll();

module.exports = { getAll, getOneById, create, update, deleteAll };
