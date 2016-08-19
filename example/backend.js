const router = require('express').Router();
const actions = [];

router.use(require('body-parser').json());

router.post('/', (req, res) => {
  const index = req.body.index;
  if (actions.length == index) {
    actions.push(req.body.action);
    res.end();
  } else {
    res.status(409).json(actions.slice(index));
  }
});

module.exports = router;
