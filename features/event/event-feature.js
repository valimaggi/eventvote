const moment = require('moment');
const { DATE_FORMAT } = require('../../common/constants');
const { RESOURCE_NOT_FOUND } = require('../../common/messages');
const eventMessages = require('./messages');
const eventModel = require('./event-model');
const createDateMappedEventFactory = require('./utils').createDateMappedEventFactory;
const sendErrorResponse = require('../../util/helpers').sendErrorResponse;
const errors = require('./event-error-handlers').errors;

const mapDatesWithMoment = (date, dateFormat) => moment(date).format(dateFormat);
const createDateMappedEvent = createDateMappedEventFactory(mapDatesWithMoment, DATE_FORMAT);

// Public functions

const getAllEvents = (req, res, next) => {
  eventModel.getAll()
    .then((events) => { // eslint-disable-line
      return res.status(200).json({
        events: events.map(event => ({ id: event._id, name: event.name }))
      });
    })
    .catch(next);
};

const getEvent = (req, res, next) => {
  eventModel.getOneById(req.params.id)
    .then((event) => {
      if (event === null) {
        throw Error(errors.RESOURCE_NOT_FOUND_ERROR);
      }
        // Only relevant data to the response
      return res.status(200).json(createDateMappedEvent(event._id, event.name, event.dates, event.votes));
    })
    .catch(next);
};

const createEvent = (req, res, next) => {
  const newEvent = {
    name: req.body.name,
    dates: req.body.dates.map(date => moment(date))
  };
  eventModel.create(newEvent)
    .then((event) => {
      res.status(201).json({ id: event._id });
    })
    .catch(next);
};

const castVote = (req, res, next) => {
  eventModel.getOneById(req.params.id)
    .then((event) => {
      if (event === null) {
        throw Error(errors.RESOURCE_NOT_FOUND_ERROR);
      }
      // Check every date in request body. If the date is new or existing one.
      // Then add vote for the date.
      // Non-existent date interrupts the process and error is thrown
      for (const votedDate of req.body.votes) {
        // First check that date is one of event's dates
        const foundDate = event.dates.find(eventDate =>
          moment(eventDate).isSame(votedDate, 'day')
        );
        if (foundDate === undefined) {
          throw Error(errors.NONEXISTENT_DATES_ERROR);
        }
        // Then check if there's already votes for this date
        const voteObject = event.votes.find(vote =>
          moment(vote.date).isSame(votedDate, 'day')
        );
        if (voteObject !== undefined) {
          // Date found, let's add voter name for this vote date
          voteObject.people.push(req.body.name);
        } else {
          // No votes for the date yet, add new vote to the event
          event.votes.push({
            date: votedDate,
            people: [req.body.name]
          });
        }
      }
      // Finally update the event with new vote(s). Return promise which will be resolved next.
      return eventModel.update(event);
    })
    .then(updatedEvent => res.status(200).json(createDateMappedEvent(updatedEvent._id, updatedEvent.name, updatedEvent.dates, updatedEvent.votes)))
    .catch(next);
};

const getResults = (req, res) => {
  eventModel.getOneById(req.params.id)
    .then((event) => {
      if (event === null) {
        // Nothing found so empty response
        return res.status(404).json(RESOURCE_NOT_FOUND);
      }
      // Find all the person names
      // Reduce the names by going through all names of all vote object's of the event and
      // filter only new names to the return array
      const allNames = [];
      event.votes.forEach((currentVote) => {
        const newNames = currentVote.people.filter(name => !allNames.includes(name));
        allNames.push(...newNames);
      });
      // Filter votes and check that all names is included to it's people array
      const suitableVotes = event.votes.filter(vote =>
        allNames.every(name => vote.people.includes(name))
      );
      if (suitableVotes.length > 0) {
        return res.status(200).json({
          id: event._id,
          name: event.name,
          suitableDates: suitableVotes.map(vote => ({
            date: moment(vote.date).format(DATE_FORMAT),
            people: allNames
          }))
        });
      }
      return res.status(200).json(eventMessages.NO_SUITABLE_DATE);
    })
    .catch(err => sendErrorResponse(err, res));
};

const deleteAllEvents = (req, res) => {
  eventModel.deleteAll()
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => sendErrorResponse(err, res));
};

module.exports = { getAllEvents, getEvent, createEvent, castVote, getResults, deleteAllEvents };
