const proxyquire = require('proxyquire');
const sinon = require('sinon');
const supertest = require('supertest');
const expect = require('chai').expect;
const bodyParser = require('body-parser');
require('sinon-as-promised'); // This needs to be called once to enable promise stubbing

const express = require('express');
const eventRoutes = require('../routes/event-routes');

describe('POST /event/:id/vote', () => {
  let request;
  let getOneByIdStub;
  let updateStub;

  beforeEach(() => {
    const app = express();
    app.use(bodyParser.json());

    const mainRouter = new express.Router();
    app.use(mainRouter);

    getOneByIdStub = sinon.stub();
    updateStub = sinon.stub();

    // Event feature module with stubbed event model dependency so we don't need DB to test.
    // Proxyquire enables stubbing the modules of the required module, in this case
    // the event model and its methods getOneById and update
    const feature = proxyquire('../features/event-feature', {
      '../models/event': {
        getOneById: getOneByIdStub,
        update: updateStub
      }
    });
    // Bind event routes to main router
    eventRoutes(mainRouter, feature);
    // Get a supertest instance so we can make requests
    request = supertest(app);
  });

  it('should respond with a 200 and vote status of the voted event', () => {
    const testEventId = 2;
    const testEventName = 'Secret party';
    const testVoterName = 'Mikko';
    const testVoteDate1 = '2014-01-01';
    const testVoteDate2 = '2014-01-12';

    updateStub.resolves(
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
    getOneByIdStub.resolves(
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
      .post('/event/' + testEventId + '/vote')
      .send({ name: testVoterName, votes: [testVoteDate2] })
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
