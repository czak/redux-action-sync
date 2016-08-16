const getActionCount = () =>
  parseInt(localStorage.getItem('actionCount'), 10) || 0;

const incrementActionCount = () =>
  localStorage.setItem('actionCount', getActionCount() + 1);

export default push => () => next => action =>
  push(getActionCount(), action).then(() => {
    next(action);
    incrementActionCount();
  });
