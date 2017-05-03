const moment = require('moment');
const validateNewEvent = require('./event-validation');
const constants = require('../../common/constants');
const commonMessages = require('../../common/messages');
const eventMessages = require('./messages');
const eventModel = require('./event-model');
const createDateMappedEventFactory = require('./utils').createDateMappedEventFactory;
const sendServerErrorResponse = require('../../util/helpers').sendServerErrorResponse;
const NONEXISTENT_DATES_ERROR = require('./utils').errorStrings.NONEXISTENT_DATES_ERROR;
const RESOURCE_NOT_FOUND_ERROR = require('./utils').errorStrings.RESOURCE_NOT_FOUND_ERROR;

const mapDatesWithMoment = (date, dateFormat) => moment(date).format(dateFormat);
const createDateMappedEvent = createDateMappedEventFactory(mapDatesWithMoment, constants.DATE_FORMAT);

function getAllEvents(req, res) {
  eventModel.getAll()
    .then((events) => { // eslint-disable-line
      return res.status(200).json({
        events: events.map(event => ({ id: event._id, name: event.name }))
      });
    })
    .catch(err => sendServerErrorResponse(err, res));
}

function getEvent(req, res) {
  eventModel.getOneById(req.params.id)
    .then((event) => {
      if (event === null) {
        // Nothing found so empty response
        return res.status(404).json(commonMessages.RESOURCE_NOT_FOUND);
      }
        // Only relevant data to the response
      return res.status(200).json(createDateMappedEvent(event._id, event.name, event.dates, event.votes));
    })
    .catch(err => sendServerErrorResponse(err, res));
}

function createEvent(req, res) {
  try {
    if (validateNewEvent(req)) {
      const newEvent = {
        name: req.body.name,
        dates: req.body.dates.map(date => moment(date))
      };
      eventModel.create(newEvent)
        .then((event) => {
          res.status(201).json({ id: event._id });
        })
        .catch(err => sendServerErrorResponse(err, res));
      return;
    }
    res.status(400).json(commonMessages.INVALID_REQUEST_BODY);
  } catch (err) { sendServerErrorResponse(err, res); }
}

function castVote(req, res) {
  eventModel.getOneById(req.params.id)
    .then((event) => {
      if (event === null) {
        // Nothing found, return the error to the next promise handler in the chain
        return RESOURCE_NOT_FOUND_ERROR;
      }
      // Check every date in request body. If the date is new or existing one.
      // Then add vote for the date.
      // Non-existent date interrupts the process and response is sent
      let nonExistentDate = false;
      for (const votedDate of req.body.votes) {
        // First check that date is one of event's dates
        const foundDate = event.dates.find(eventDate =>
          moment(eventDate).format(constants.DATE_FORMAT) === votedDate
        );
        if (foundDate === undefined) {
          nonExistentDate = true;
          break;
        }
        // Then check if there's already votes for this date
        const voteObject = event.votes.find(vote =>
          moment(vote.date).format(constants.DATE_FORMAT) === votedDate
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
      if (nonExistentDate) {
        return NONEXISTENT_DATES_ERROR;
      }
      // Finally update the event with new vote(s). Return promise which will be resolved next.
      return eventModel.update(event);
    })
    .then((updatedEvent) => {
      // If previous promise handler returned errors
      switch (updatedEvent) {
        case RESOURCE_NOT_FOUND_ERROR:
          res.status(404).json(commonMessages.RESOURCE_NOT_FOUND);
          break;
        case NONEXISTENT_DATES_ERROR:
          res.status(404).json(eventMessages.NONEXISTENT_DATES);
          break;
        default:
          // In normal situation updated event is returned
          res.status(200).json(createDateMappedEvent(updatedEvent._id, updatedEvent.name, updatedEvent.dates, updatedEvent.votes));
      }
    })
    .catch(err => sendServerErrorResponse(err, res));
}

function getResults(req, res) {
  eventModel.findOne({ _id: req.params.id })
    .then((event) => {
      if (event === null) {
        // Nothing found so empty response
        return res.status(404).json(commonMessages.RESOURCE_NOT_FOUND);
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
            date: moment(vote.date).format(constants.DATE_FORMAT),
            people: allNames
          }))
        });
      }
      return res.status(200).json(eventMessages.NO_SUITABLE_DATE);
    })
    .catch(err => sendServerErrorResponse(err, res));
}

function deleteAllEvents(req, res) {
  eventModel.deleteAll()
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => sendServerErrorResponse(err, res));
}

module.exports = { getAllEvents, getEvent, createEvent, castVote, getResults, deleteAllEvents };
