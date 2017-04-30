const sinon = require('sinon');
const bodyParser = require('body-parser');
const expect = require('chai').expect;
const initRequest = require('./util/test-helpers').initRequest;
require('sinon-as-promised'); // This needs to be called once to enable promise stubbing

const createEventRouter = require('../routes/event-routes');

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

  it('should respond with a 200 and vote status of the voted event', () => {
    const testEventId = 2;
    const testEventName = 'Secret party';
    const testVoterName = 'Mikko';
    const testVoteDate1 = '2014-01-01';
    const testVoteDate2 = '2014-01-12';

    stubForUpdate.resolves(
      {
        _id: testEventId,
        name: testEventName,
        dates: [
          '2014-01-01',
          '2014-01-05',
          '2014-01-12'
        ],
        votes: [
          {
            date: testVoteDate1,
            people: [
              'John',
              'Julia',
              'Paul',
              testVoterName
            ]
          },
          {
            date: testVoteDate2,
            people: [
              'Julia',
              testVoterName
            ]
          }
        ]
      });
    // DB stub returns an event
    stubForGetOneById.resolves(
      {
        _id: testEventId,
        name: testEventName,
        dates: [
          '2014-01-01',
          '2014-01-05',
          '2014-01-12'
        ],
        votes: [
          {
            date: testVoteDate1,
            people: [
              'John',
              'Julia',
              'Paul',
              testVoterName
            ]
          },
          {
            date: testVoteDate2,
            people: [
              'Julia'
            ]
          }
        ]
      }
    );
    return request
      .post('/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: [testVoteDate2] })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal({
          id: testEventId,
          name: testEventName,
          dates: [
            '2014-01-01',
            '2014-01-05',
            '2014-01-12'
          ],
          votes: [
            {
              date: testVoteDate1,
              people: [
                'John',
                'Julia',
                'Paul',
                testVoterName
              ]
            },
            {
              date: testVoteDate2,
              people: [
                'Julia',
                testVoterName
              ]
            }
          ]
        });
      });
  });
});
