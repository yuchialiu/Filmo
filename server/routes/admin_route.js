const router = require('express').Router();

const { insertGenreEn, insertGenreZh, insertGenreFr } = require('../controllers/genre_controller');

const { insertMovie } = require('../controllers/movie_controller');

const { insertPerson } = require('../controllers/person_controller');

router.route('/admin/genre').post(insertGenreEn, insertGenreZh, insertGenreFr);

router.route('/admin/movie').post(insertMovie);

router.route('/admin/person').post(insertPerson);

module.exports = router;
