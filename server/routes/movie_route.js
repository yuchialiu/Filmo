const router = require('express').Router();

const { insertMovie } = require('../controllers/movie_controller');

router.route('/admin/movie').post(insertMovie);

module.exports = router;
