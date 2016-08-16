import expect from 'expect';
import createActionSync from '../src';

describe('redux-action-sync', () => {
  describe('middleware', () => {
    const action = { type: 'TEST_ACTION' };

    before(() => {
      global.localStorage = {
        getItem() {},
        setItem() {},
      };
    });

    context('without localStorage.actionCount', () => {
      before(() => {
        global.localStorage = {
          getItem() {},
          setItem: expect.createSpy(),
        };
      });

      it("calls 'push' with index == 0", () => {
        const push = expect.createSpy().andReturn(Promise.resolve());
        createActionSync(push)()(() => {})(action);
        expect(push).toHaveBeenCalledWith(0, action);
      });

      it('sets localStorage.actionCount to 1', () => {
        const push = expect.createSpy().andReturn(Promise.resolve());
        createActionSync(push)()(() => {})(action);
        expect(localStorage.setItem).toHaveBeenCalledWith('actionCount', 1);
      });
    });

    context('with localStorage.actionCount', () => {
      before(() => {
        global.localStorage = {
          getItem() { return '12'; },
          setItem: expect.createSpy(),
        };
      });

      it("calls 'push' with index == localStorage.actionCount", () => {
        const push = expect.createSpy().andReturn(Promise.resolve());
        createActionSync(push)()(() => {})(action);
        expect(push).toHaveBeenCalledWith(12, action);
      });

      it('increments localStorage.actionCount by 1', () => {
        const push = expect.createSpy().andReturn(Promise.resolve());
        createActionSync(push)()(() => {})(action);
        expect(localStorage.setItem).toHaveBeenCalledWith('actionCount', 13);
      });
    });

    it('dispatches the action', () => {
      const middleware = createActionSync(() => Promise.resolve());
      const dispatch = expect.createSpy();
      return middleware()(dispatch)(action).then(() => {
        expect(dispatch).toHaveBeenCalledWith(action);
      });
    });
  });
});
