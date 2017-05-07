const sinon = require('sinon');
const expect = require('chai').expect;
require('sinon-as-promised'); // This needs to be called once to enable promise stubbing

const { initRequest } = require('../test-helpers');
const createEventRouter = require('../../api/event-router');

describe('DELETE /event', () => {
  let createEventRouterRequest;
  let stubForDeleteAll;
  let request;

  before(() => {
    createEventRouterRequest = initRequest();
    stubForDeleteAll = sinon.stub();
    request = createEventRouterRequest(createEventRouter, '../features/event/event-feature', {
      './event-model': {
        deleteAll: stubForDeleteAll
      }
    });
  });

  it('should respond with a 204 when deleting events', () => {
    stubForDeleteAll.resolves(null);
    return request
      .delete('/')
      .expect(204);
  });

  it('should respond with an events deleted message when deleting events', () => {
    stubForDeleteAll.resolves(null);
    return request
      .delete('/')
      .expect(204)
      .then((res) => {
        expect(res.body).to.deep.equal({});
      });
  });

  it('should respond with a 500 in other cases when errors occur in server', () => {
    const errorObject = {
      name: 'not CastError'
    };
    // DB stub returns error
    stubForDeleteAll.rejects(errorObject);
    return request
    .delete('/')
    .expect(500);
  });
});
