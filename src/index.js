const createActionSync = push => {
  let actionCount = 0;

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
}

export default createActionSync;
