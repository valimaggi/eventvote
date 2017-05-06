const sinon = require('sinon');
const bodyParser = require('body-parser');
const expect = require('chai').expect;
require('sinon-as-promised'); // This needs to be called once to enable promise stubbing

const initRequest = require('../test-helpers').initRequest;
const createEventRouter = require('../../features/event/event-routes');
const validation = require('../../features/validation');
const messages = require('../../common/messages');

describe('request body validation ', () => {
  let createEventRouterRequest;
  let request;

  before(() => {
    createEventRouterRequest = initRequest(bodyParser.json(), validation.requestBody);
    request = createEventRouterRequest(createEventRouter, '../features/event/event-feature', {});
  });

  // eslint-disable-next-line
  it('should respond with a 400 when posting no request body to /event', () => {
    return request
      .post('/')
      .send()
      .expect(400);
  });

  // eslint-disable-next-line
  it('should respond with a 400 when posting no request body to /event/:id/vote', () => {
    return request
      .post('/2352/vote')
      .send()
      .expect(400);
  });

  // eslint-disable-next-line
  it('should respond with an error message when posting no request body /event', () => {
    return request
      .post('/')
      .send()
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(messages.INVALID_REQUEST_BODY);
      });
  });

  // eslint-disable-next-line
  it('should respond with an error message when posting no request body /event/:id/vote', () => {
    return request
      .post('/2352/vote')
      .send()
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(messages.INVALID_REQUEST_BODY);
      });
  });

  // eslint-disable-next-line
  it('should respond with an error message when posting undefined request body /event', () => {
    return request
      .post('/')
      .send(undefined)
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(messages.INVALID_REQUEST_BODY);
      });
  });

  // eslint-disable-next-line
  it('should respond with an error message when posting undefined request body /event/:id/vote', () => {
    return request
      .post('/2352/vote')
      .send(undefined)
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(messages.INVALID_REQUEST_BODY);
      });
  });

  // eslint-disable-next-line
  it('should respond with an error message when posting empty object as request body /event', () => {
    return request
      .post('/')
      .send({})
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(messages.INVALID_REQUEST_BODY);
      });
  });

  // eslint-disable-next-line
  it('should respond with an error message when posting empty object as request body /event/:id/vote', () => {
    return request
      .post('/2352/vote')
      .send({})
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        expect(res.body).to.deep.equal(messages.INVALID_REQUEST_BODY);
      });
  });
});
