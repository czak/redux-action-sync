const createActionSync = (push, initialActionCount = 0) => {
  let actionCount = initialActionCount;

  return () => next => action => {
    const process = () =>
      push(actionCount, action).then(
        () => {
          next(action);
          actionCount++;
        },
        error => {
          error.conflicts.forEach(conflict => {
            next(conflict);
            actionCount++;
          });
          return process();
        }
      );

    return process();
  };
};

export default createActionSync;
