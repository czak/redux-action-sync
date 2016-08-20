import expect from 'expect';
import createActionSync from '../src';

const createError = (conflicts) => Object.assign(new Error(), { conflicts });

describe('redux-action-sync', () => {
  describe('middleware', () => {
    const action = { type: 'TEST_ACTION' };

    context('on success', () => {
      it('dispatches the action', () => {
        const middleware = createActionSync(() => Promise.resolve());
        const dispatch = expect.createSpy();
        return middleware()(dispatch)(action).then(() => {
          expect(dispatch).toHaveBeenCalledWith(action);
        });
      });

      specify("subsequent actions call 'push' with consecutive index values", () => {
        const push = expect.createSpy().andReturn(Promise.resolve());
        const dispatch = createActionSync(push)()(() => {});
        return dispatch(action).then(() => {
          expect(push.calls[0].arguments[0]).toEqual(0);
          return dispatch(action);
        }).then(() => {
          expect(push.calls[1].arguments[0]).toEqual(1);
          return dispatch(action);
        }).then(() => {
          expect(push.calls[2].arguments[0]).toEqual(2);
        });
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
        });
      });
    });
  });
});
