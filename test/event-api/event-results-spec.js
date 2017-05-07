const sinon = require('sinon');
const expect = require('chai').expect;
require('sinon-as-promised'); // This needs to be called once to enable promise stubbing

const { initRequest } = require('../test-helpers');
const createEventRouter = require('../../api/event-router');
const { createInvalidIdErrorObject } = require('./utils');
const { NO_SUITABLE_DATE, RESOURCE_NOT_FOUND, INVALID_REQUEST_URL } = require('../../features/event/messages');

describe('GET /event/:id/results', () => {
  let createEventRouterRequest;
  let stubForGetOneById;
  let request;

  before(() => {
    createEventRouterRequest = initRequest();
    stubForGetOneById = sinon.stub();
    request = createEventRouterRequest(createEventRouter, '../features/event/event-feature', {
      './event-model': {
        getOneById: stubForGetOneById
      }
    });
  });

  it('should respond with a 200 and one date found from one voted date', () => {
    const testId = 2;
    // DB stub returns an event
    stubForGetOneById.resolves(
      {
        _id: testId,
        name: 'Tyrsky\'s secret party',
        dates: ['2014-01-01', '2014-01-05', '2014-01-12'],
        votes: [
          {
            date: '2014-01-01',
            people: ['Matt', 'Heidi', 'Tyrsky']
          }
        ]
      }
    );
    return request
      .get('/' + testId + '/results')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal({
          id: testId,
          name: 'Tyrsky\'s secret party',
          suitableDates: [
            {
              date: '2014-01-01',
              people: ['Matt', 'Heidi', 'Tyrsky']
            }
          ]
        });
      });
  });

  it('should respond with a 200 and one date found from two voted date', () => {
    const testId = 2;
    // DB stub returns an event
    stubForGetOneById.resolves(
      {
        _id: testId,
        name: 'Tyrsky\'s secret party',
        dates: ['2014-01-01', '2014-01-05', '2014-01-12'],
        votes: [
          {
            date: '2014-01-01',
            people: ['Matt', 'Heidi', 'Tyrsky']
          },
          {
            date: '2014-01-05',
            people: ['Matt', 'Tyrsky']
          }
        ]
      }
    );
    return request
      .get('/' + testId + '/results')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal({
          id: testId,
          name: 'Tyrsky\'s secret party',
          suitableDates: [
            {
              date: '2014-01-01',
              people: ['Matt', 'Heidi', 'Tyrsky']
            }
          ]
        });
      });
  });

  it('should respond with a 200 and two dates found from three voted date', () => {
    const testId = 2;
    // DB stub returns an event
    stubForGetOneById.resolves(
      {
        _id: testId,
        name: 'Tyrsky\'s secret party',
        dates: ['2014-01-01', '2014-01-05', '2014-01-12'],
        votes: [
          {
            date: '2014-01-01',
            people: ['Matt', 'Heidi', 'Tyrsky']
          },
          {
            date: '2014-01-05',
            people: ['Matt', 'Tyrsky']
          },
          {
            date: '2014-01-12',
            people: ['Heidi', 'Matt', 'Tyrsky']
          }
        ]
      }
    );
    return request
      .get('/' + testId + '/results')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal({
          id: testId,
          name: 'Tyrsky\'s secret party',
          suitableDates: [
            {
              date: '2014-01-01',
              people: ['Matt', 'Heidi', 'Tyrsky']
            },
            {
              date: '2014-01-12',
              people: ['Matt', 'Heidi', 'Tyrsky']
            }
          ]
        });
      });
  });

  it('should respond with a 200 and error message when no suitable dates found', () => {
    const testId = 2;
    // DB stub returns an event
    stubForGetOneById.resolves(
      {
        _id: testId,
        name: 'Tyrsky\'s secret party',
        dates: ['2014-01-01', '2014-01-05', '2014-01-12'],
        votes: [
          {
            date: '2014-01-01',
            people: ['Matt', 'Heidi', 'Tyrsky']
          },
          {
            date: '2014-01-05',
            people: ['Matt']
          },
          {
            date: '2014-01-12',
            people: ['Heidi', 'Jaska']
          }
        ]
      }
    );
    return request
      .get('/' + testId + '/results')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal(NO_SUITABLE_DATE);
      });
  });

  it('should respond with a 200 and not found when using non-existing id', () => {
    const nonExistingId = 'jhy8b';
    // DB stub returns null
    stubForGetOneById.resolves(null);
    return request
      .get('/' + nonExistingId + '/results')
      .expect('Content-Type', /json/)
      .expect(404)
      .then((res) => {
        expect(res.body).to.deep.equal(RESOURCE_NOT_FOUND);
      });
  });

  it('should respond with a 400 when using invalid id', () => {
    const invalidId = '57fa90d046d78827c7c50f8';
    const errorObject = createInvalidIdErrorObject(invalidId);
    // DB stub returns null
    stubForGetOneById.rejects(errorObject);
    return request
      .get('/' + invalidId + '/results')
      .expect(400);
  });

  it('should respond with an error message when using invalid id', () => {
    const invalidId = '57fa90d046d78827c7c50f8';
    const errorObject = createInvalidIdErrorObject(invalidId);
    // DB stub returns null
    stubForGetOneById.rejects(errorObject);
    return request
      .get('/' + invalidId + '/results')
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(INVALID_REQUEST_URL);
      });
  });

  it('should respond with a 500 in other cases when errors occur in server', () => {
    const errorObject = {
      name: 'not CastError'
    };
    // DB stub returns error
    stubForGetOneById.rejects(errorObject);
    return request
      .get('/2/results')
      .expect(500);
  });
});
