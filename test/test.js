import expect from 'expect';
import createActionSync from '../src';

describe('redux-action-sync', () => {
  before(() => {
    global.localStorage = {
      getItem() {},
      setItem() {},
    };
  });

  describe('middleware', () => {
    let middleware;

    beforeEach(() => {
      middleware = createActionSync(() => Promise.resolve());
    });

    it('dispatches the action', () => {
      const action = { type: 'TEST_ACTION', value: 123 };
      const dispatch = expect.createSpy();
      return middleware()(dispatch)(action).then(() => {
        expect(dispatch).toHaveBeenCalledWith(action);
      });
    });
  });
});
