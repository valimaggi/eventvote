const sinon = require('sinon');
const bodyParser = require('body-parser');
const expect = require('chai').expect;
const initRequest = require('./util/test-helpers').initRequest;
const createEventWithVotesFactory = require('./util/test-helpers').createEventWithVotesFactory;
require('sinon-as-promised'); // This needs to be called once to enable promise stubbing

const createEventRouter = require('../routes/event-routes');
const errorStrings = require('../util/error-strings');
const messages = require('../common/messages');

describe('POST /event/:id/vote', () => {
  let createEventRouterRequest;
  let stubForGetOneById;
  let stubForUpdate;
  let request;

  before(() => {
    createEventRouterRequest = initRequest(createEventRouter, [bodyParser.json()]);
    stubForGetOneById = sinon.stub();
    stubForUpdate = sinon.stub();
    request = createEventRouterRequest('../../features/event-feature', {
      '../models/event': {
        getOneById: stubForGetOneById,
        update: stubForUpdate
      }
    });
  });

  it('should respond with a 200 when making a valid vote', () => {
    const testEventId = 2;
    const testEventName = 'Secret party';
    const testVoteDate = '2014-01-12';
    const testVoteDates = ['2014-01-01', testVoteDate];
    const createEventWithVotes = createEventWithVotesFactory(testEventName, testVoteDates);

    const initialEvent = createEventWithVotes({ _id: testEventId }, [{ date: testVoteDate, people: ['Sakke,', 'Pena'] }]);
    const testVoterName = 'Mikko';
    const updatedEvent = createEventWithVotes({ _id: testEventId }, [{ date: testVoteDate, people: ['Sakke,', 'Pena', testVoterName] }]);

    // DB stub returns an event
    stubForGetOneById.resolves(initialEvent);
    stubForUpdate.resolves(updatedEvent);

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: [testVoteDate] })
      .expect(200);
  });

  it('should respond with a vote status of the voted event when making a valid vote to an event with two dates without any votes', () => {
    const testEventId = 2;
    const testEventName = 'Secret party';
    const testVoteDate = '2014-01-12';
    const testVoteDates = ['2014-01-01', testVoteDate];
    const createEventWithVotes = createEventWithVotesFactory(testEventName, testVoteDates);

    const initialEvent = createEventWithVotes({ _id: testEventId }, [{ date: testVoteDate, people: [] }]);
    const testVoterName = 'Mikko';
    const updatedEvent = createEventWithVotes({ _id: testEventId }, [{ date: testVoteDate, people: [testVoterName] }]);
    const responseEvent = createEventWithVotes({ id: testEventId }, [{ date: testVoteDate, people: [testVoterName] }]);

    // DB stub returns an event
    stubForGetOneById.resolves(initialEvent);
    stubForUpdate.resolves(updatedEvent);

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: [testVoteDate] })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal(responseEvent);
      });
  });

  it('should respond with a vote status of the voted event when making a valid vote to an event with two dates, and to a date with votes', () => {
    const testEventId = 2;
    const testEventName = 'Secret party';
    const testVoteDate = '2014-01-12';
    const testVoteDates = ['2014-01-01', testVoteDate];
    const createEventWithVotes = createEventWithVotesFactory(testEventName, testVoteDates);

    const initialEvent = createEventWithVotes({ _id: testEventId }, [{ date: testVoteDate, people: ['Sakke,', 'Pena'] }]);
    const testVoterName = 'Mikko';
    const updatedEvent = createEventWithVotes({ _id: testEventId }, [{ date: testVoteDate, people: ['Sakke,', 'Pena', testVoterName] }]);
    const responseEvent = createEventWithVotes({ id: testEventId }, [{ date: testVoteDate, people: ['Sakke,', 'Pena', testVoterName] }]);

    // DB stub returns an event
    stubForGetOneById.resolves(initialEvent);
    stubForUpdate.resolves(updatedEvent);

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: [testVoteDate] })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal(responseEvent);
      });
  });

  it('should respond with a vote status of the voted event when making a valid vote to an event with two voted dates, and to a date without any votes', () => {
    const testEventId = 2;
    const testEventName = 'Secret party';

    const voteDate1 = '2014-01-01';
    const voteDate2 = '2014-01-12';
    const testVoteDates = [voteDate1, voteDate2];
    const createEventWithVotes = createEventWithVotesFactory(testEventName, testVoteDates);

    const initialEvent = createEventWithVotes({ _id: testEventId }, [
      { date: voteDate1, people: [] },
      { date: voteDate2, people: ['Sakke,', 'Pena'] }
    ]);
    const testVoterName = 'Mikko';
    const updatedEvent = createEventWithVotes({ _id: testEventId }, [
      { date: voteDate1, people: [testVoterName] },
      { date: voteDate2, people: ['Sakke,', 'Pena'] }
    ]);
    const responseEvent = createEventWithVotes({ id: testEventId }, [
      { date: voteDate1, people: [testVoterName] },
      { date: voteDate2, people: ['Sakke,', 'Pena'] }
    ]);

    // DB stub returns an event
    stubForGetOneById.resolves(initialEvent);
    stubForUpdate.resolves(updatedEvent);

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: [voteDate1] })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal(responseEvent);
      });
  });

  it('should respond with a vote status of the voted event when making a valid vote to an event with two voted dates, and to one of those dates', () => {
    const testEventId = 2;
    const testEventName = 'Secret party';

    const voteDate1 = '2014-01-01';
    const voteDate2 = '2014-01-12';
    const testVoteDates = [voteDate1, voteDate2];
    const createEventWithVotes = createEventWithVotesFactory(testEventName, testVoteDates);

    const initialEvent = createEventWithVotes({ _id: testEventId }, [
      { date: voteDate1, people: ['Sakke'] },
      { date: voteDate2, people: ['Sakke,', 'Pena'] }
    ]);
    const testVoterName = 'Mikko';
    const updatedEvent = createEventWithVotes({ _id: testEventId }, [
      { date: voteDate1, people: ['Sakke', testVoterName] },
      { date: voteDate2, people: ['Sakke,', 'Pena'] }
    ]);
    const responseEvent = createEventWithVotes({ id: testEventId }, [
      { date: voteDate1, people: ['Sakke', testVoterName] },
      { date: voteDate2, people: ['Sakke,', 'Pena'] }
    ]);

    // DB stub returns an event
    stubForGetOneById.resolves(initialEvent);
    stubForUpdate.resolves(updatedEvent);

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: [voteDate1] })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal(responseEvent);
      });
  });

  it('should respond with a 404 when voting with event id which is not found', () => {
    const testEventId = 2234234;
    const testVoterName = 'Mikko';
    const testVoteDate = '2014-01-01';

    // DB stub returns an event
    stubForGetOneById.resolves(null);
    stubForUpdate.resolves(errorStrings.RESOURCE_NOT_FOUND_ERROR);

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: [testVoteDate] })
      .expect(404);
  });

  it('should respond with an error message when voting with event id which is not found', () => {
    const testEventId = 2234234;
    const testVoterName = 'Mikko';
    const testVoteDate = '2014-01-01';

    // DB stub returns an event
    stubForGetOneById.resolves(null);
    stubForUpdate.resolves(errorStrings.RESOURCE_NOT_FOUND_ERROR);

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: [testVoteDate] })
      .expect('Content-Type', /json/)
      .expect(404)
      .then((res) => {
        expect(res.body).to.deep.equal(messages.RESOURCE_NOT_FOUND);
      });
  });

  it('should respond with a 404 when voting with a non-existing date', () => {
    const testEventId = 2;
    const testEventName = 'Secret party';

    const actualVoteDate = '2014-01-01';
    const testVoteDate = '2014-01-02';
    const testVoteDates = [actualVoteDate];
    const createEventWithVotes = createEventWithVotesFactory(testEventName, testVoteDates);

    const initialEvent = createEventWithVotes({ _id: testEventId }, [{ date: actualVoteDate, people: ['Sakke'] }
    ]);
    const testVoterName = 'Mikko';

    // DB stub returns an event
    stubForGetOneById.resolves(initialEvent);
    stubForUpdate.resolves(errorStrings.NONEXISTENT_DATES_ERROR);

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: [testVoteDate] })
      .expect(404);
  });

  it('should respond with an error message when voting with a non-existing date', () => {
    const testEventId = 2;
    const testEventName = 'Secret party';

    const actualVoteDate = '2014-01-01';
    const testVoteDate = '2014-01-02';
    const testVoteDates = [actualVoteDate];
    const createEventWithVotes = createEventWithVotesFactory(testEventName, testVoteDates);

    const initialEvent = createEventWithVotes({ _id: testEventId }, [{ date: actualVoteDate, people: ['Sakke'] }
    ]);
    const testVoterName = 'Mikko';

    // DB stub returns an event
    stubForGetOneById.resolves(initialEvent);
    stubForUpdate.resolves(errorStrings.NONEXISTENT_DATES_ERROR);

    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: [testVoteDate] })
      .expect('Content-Type', /json/)
      .expect(404)
      .then((res) => {
        expect(res.body).to.deep.equal(messages.NONEXISTENT_DATES);
      });
  });
});
