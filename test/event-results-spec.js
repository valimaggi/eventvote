const sinon = require('sinon');
const expect = require('chai').expect;
const initRequest = require('./util/test-helpers').initRequest;
const messages = require('../common/messages');
require('sinon-as-promised'); // This needs to be called once to enable promise stubbing

const createEventRouter = require('../routes/event-routes');

describe('GET /event/:id/results', () => {
  let createEventRouterRequest;
  let stubForFindOne;
  let request;

  before(() => {
    createEventRouterRequest = initRequest(createEventRouter);
    stubForFindOne = sinon.stub();
    request = createEventRouterRequest('../../features/event-feature', {
      '../models/event': {
        findOne: stubForFindOne
      }
    });
  });

  it('should respond with a 200 and one date found from one voted date', () => {
    const testId = 2;
    // DB stub returns an event
    stubForFindOne.resolves(
      {
        _id: testId,
        name: 'Tyrsky\'s secret party',
        dates: [
          '2014-01-01',
          '2014-01-05',
          '2014-01-12'
        ],
        votes: [
          {
            date: '2014-01-01',
            people: [
              'Matt',
              'Heidi',
              'Tyrsky'
            ]
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
              people: [
                'Matt',
                'Heidi',
                'Tyrsky'
              ]
            }
          ]
        });
      });
  });

  it('should respond with a 200 and one date found from two voted date', () => {
    const testId = 2;
    // DB stub returns an event
    stubForFindOne.resolves(
      {
        _id: testId,
        name: 'Tyrsky\'s secret party',
        dates: [
          '2014-01-01',
          '2014-01-05',
          '2014-01-12'
        ],
        votes: [
          {
            date: '2014-01-01',
            people: [
              'Matt',
              'Heidi',
              'Tyrsky'
            ]
          },
          {
            date: '2014-01-05',
            people: [
              'Matt',
              'Tyrsky'
            ]
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
              people: [
                'Matt',
                'Heidi',
                'Tyrsky'
              ]
            }
          ]
        });
      });
  });

  it('should respond with a 200 and two dates found from three voted date', () => {
    const testId = 2;
    // DB stub returns an event
    stubForFindOne.resolves(
      {
        _id: testId,
        name: 'Tyrsky\'s secret party',
        dates: [
          '2014-01-01',
          '2014-01-05',
          '2014-01-12'
        ],
        votes: [
          {
            date: '2014-01-01',
            people: [
              'Matt',
              'Heidi',
              'Tyrsky'
            ]
          },
          {
            date: '2014-01-05',
            people: [
              'Matt',
              'Tyrsky'
            ]
          },
          {
            date: '2014-01-12',
            people: [
              'Heidi',
              'Matt',
              'Tyrsky'
            ]
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
              people: [
                'Matt',
                'Heidi',
                'Tyrsky'
              ]
            },
            {
              date: '2014-01-12',
              people: [
                'Matt',
                'Heidi',
                'Tyrsky'
              ]
            }
          ]
        });
      });
  });

  it('should respond with a 200 and no suitable date found', () => {
    const testId = 2;
    // DB stub returns an event
    stubForFindOne.resolves(
      {
        _id: testId,
        name: 'Tyrsky\'s secret party',
        dates: [
          '2014-01-01',
          '2014-01-05',
          '2014-01-12'
        ],
        votes: [
          {
            date: '2014-01-01',
            people: [
              'Matt',
              'Heidi',
              'Tyrsky'
            ]
          },
          {
            date: '2014-01-05',
            people: [
              'Matt'
            ]
          },
          {
            date: '2014-01-12',
            people: [
              'Heidi',
              'Jaska'
            ]
          }
        ]
      }
    );
    return request
      .get('/' + testId + '/results')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal(messages.NO_SUITABLE_DATE);
      });
  });

  it('should respond with a 200 and not found', () => {
    const nonExistingId = 'jhy8b';
    // DB stub returns null
    stubForFindOne.resolves(null);
    return request
      .get('/' + nonExistingId + '/results')
      .expect('Content-Type', /json/)
      .expect(404)
      .then((res) => {
        expect(res.body).to.deep.equal(messages.RESOURCE_NOT_FOUND);
      });
  });
});
