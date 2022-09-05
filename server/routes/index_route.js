const router = require('express').Router();
const { showMain, showDetail } = require('../controllers/index_controller');

router.route('/').get(showMain);
router.route('/index.html').get(showMain);
router.route('/detail').get(showDetail);

module.exports = router;
