import expect from 'expect';
import createActionSync from '../src';

global.localStorage = {
  getItem(key) { return this[key]; },
  setItem(key, value) { this[key] = value; },
};

const createError = (data) => Object.assign(new Error(), data);

describe('redux-action-sync', () => {
  beforeEach(() => delete localStorage.actionCount);

  describe('middleware', () => {
    const action = { type: 'TEST_ACTION' };

    context('with empty localStorage', () => {
      it("calls 'push' with index == 0", () => {
        const push = expect.createSpy().andReturn(Promise.resolve());
        createActionSync(push)()(() => {})(action);
        expect(push).toHaveBeenCalledWith(0, action);
      });

      it('sets localStorage.actionCount to 1', () => {
        const push = () => Promise.resolve();
        return createActionSync(push)()(() => {})(action).then(() => {
          expect(localStorage.actionCount).toEqual(1);
        });
      });
    });

    context('with initial value in localStorage.actionCount', () => {
      beforeEach(() => { localStorage.actionCount = '12'; });

      it("calls 'push' with index == localStorage.actionCount", () => {
        const push = expect.createSpy().andReturn(Promise.resolve());
        createActionSync(push)()(() => {})(action);
        expect(push).toHaveBeenCalledWith(12, action);
      });

      it('increments localStorage.actionCount by 1', () => {
        const push = () => Promise.resolve();
        return createActionSync(push)()(() => {})(action).then(() => {
          expect(localStorage.actionCount).toEqual(13);
        });
      });
    });

    it('dispatches the action', () => {
      const middleware = createActionSync(() => Promise.resolve());
      const dispatch = expect.createSpy();
      return middleware()(dispatch)(action).then(() => {
        expect(dispatch).toHaveBeenCalledWith(action);
      });
    });

    context('on conflict', () => {
      const conflicts = [{ type: 'CONFLICT' }, { type: 'ANOTHER' }];

      it('dispatches all conflicting actions', () => {
        const error = createError({ conflicts });
        const middleware = createActionSync(() => Promise.reject(error));
        const dispatch = expect.createSpy();
        return middleware()(dispatch)(action).then(() => {
          expect(dispatch.calls.length).toEqual(2);
          expect(dispatch.calls[0].arguments[0]).toEqual(conflicts[0]);
          expect(dispatch.calls[1].arguments[0]).toEqual(conflicts[1]);
        });
      });

      it('increments actionCount for each conflict dispatched', () => {
        const error = createError({ conflicts });
        const middleware = createActionSync(() => Promise.reject(error));
        return middleware()(() => {})(action).then(() => {
          expect(localStorage.actionCount).toEqual(2);
        });
      });
    });
  });
});
