import expect from 'expect';
import createActionSync from '../src';

global.localStorage = {
  getItem(key) { return this[key]; },
  setItem(key, value) { this[key] = value; },
};

const createError = (conflicts) => Object.assign(new Error(), { conflicts });

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
      const conflicts1 = [{ type: 'CONFLICT' }, { type: 'ANOTHER' }];
      const conflicts2 = [{ type: 'YET_ANOTHER' }];

      it('dispatches all conflicting actions and retries', () => {
        // Mock 'push' implementation fails twice with a conflict
        // and resolves on the third attempt.
        // This is to verify the retry mechanism of the middleware.
        let attempt = 0;
        const push = () => {
          attempt++;
          if (attempt === 1) return Promise.reject(createError(conflicts1));
          else if (attempt === 2) return Promise.reject(createError(conflicts2));
          return Promise.resolve();
        };

        const middleware = createActionSync(push);
        const dispatch = expect.createSpy();
        return middleware()(dispatch)(action).then(() => {
          expect(dispatch.calls.length).toEqual(4);
          expect(dispatch.calls[0].arguments[0]).toEqual(conflicts1[0]);
          expect(dispatch.calls[1].arguments[0]).toEqual(conflicts1[1]);
          expect(dispatch.calls[2].arguments[0]).toEqual(conflicts2[0]);
          expect(dispatch.calls[3].arguments[0]).toEqual(action);
          expect(localStorage.actionCount).toEqual(4);
        });
      });
    });
  });
});
