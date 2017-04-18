const moment = require('moment');
const isEmpty = require('lodash/isEmpty');
const constants = require('../common/constants');
const messages = require('../common/messages');
const eventModel = require('../models/event');
const dateMappedEvent = require('../util/helpers').dateMappedEvent;
const dbErrorResponse = require('../util/helpers').dbErrorResponse;

const NONEXISTENT_DATES_ERROR = 'NONEXISTENT_DATES_ERROR';
const RESOURCE_NOT_FOUND_ERROR = 'RESOURCE_NOT_FOUND_ERROR';

const mapDatesWithMoment = (date, dateFormat) => moment(date).format(dateFormat);
const createDateMappedEvent = dateMappedEvent(mapDatesWithMoment, constants.DATE_FORMAT);

function getAllEvents(req, res) {
  eventModel.getAll()
    .then((events) => {
      // Only relevant data to the response
      const responseEvents = events.map(event => (
        { id: event._id, name: event.name }
      ));
      return res.status(200).json({ events: responseEvents });
    })
    .catch(err => dbErrorResponse(err, res));
  return;
}

function getEvent(req, res) {
  eventModel.getOneById(req.params.id)
    .then((event) => {
      if (event === null) {
        // Nothing found so empty response
        return res.status(404).json(messages.RESOURCE_NOT_FOUND);
      }
        // Only relevant data to the response
      return res.status(200).json(createDateMappedEvent(event._id, event.name, event.dates, event.votes));
    })
    .catch(err => dbErrorResponse(err, res));
  return;
}

function createEvent(req, res) {
  if (req.body !== undefined && !isEmpty(req.body)) {
    const newEvent = {
      name: req.body.name,
      dates: req.body.dates.map(date => moment(date))
    };
    eventModel.create(newEvent)
      .then((event) => {
        res.status(201).json({ id: event._id });
      })
      .catch(err => dbErrorResponse(err, res));
    return;
  }
  res.status(400).json(messages.INVALID_REQUEST_BODY);
  return;
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
          res.status(404).json(messages.RESOURCE_NOT_FOUND);
          break;
        case NONEXISTENT_DATES_ERROR:
          res.status(404).json(messages.NONEXISTENT_DATES);
          break;
        default:
          // In normal situation updated event is returned
          res.status(200).json(createDateMappedEvent(updatedEvent._id, updatedEvent.name, updatedEvent.dates, updatedEvent.votes));
      }
      return;
    })
    .catch(err => dbErrorResponse(err, res));
  return;
}

function getResults(req, res) {
  eventModel.findOne({ _id: req.params.id })
    .then((event) => {
      if (event === null) {
        // Nothing found so empty response
        return res.status(404).json(messages.RESOURCE_NOT_FOUND);
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
      return res.status(200).json(messages.NO_SUITABLE_DATE);
    })
    .catch(err => dbErrorResponse(err, res));
}

function deleteAllEvents(req, res) {
  eventModel.deleteAll()
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => dbErrorResponse(err, res));
  return;
}

module.exports = { getAllEvents, getEvent, createEvent, castVote, getResults, deleteAllEvents };
