const getActionCount = () =>
  parseInt(localStorage.getItem('actionCount'), 10) || 0;

const incrementActionCount = () =>
  localStorage.setItem('actionCount', getActionCount() + 1);

const createActionSync = push => () => next => action => {
  const process = () =>
    push(getActionCount(), action).then(
      () => {
        next(action);
        incrementActionCount();
      },
      error => {
        error.conflicts.forEach(conflict => {
          next(conflict);
          incrementActionCount();
        });
        return process();
      }
    );

  return process();
};

export default createActionSync;
