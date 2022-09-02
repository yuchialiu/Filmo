const router = require('express').Router();

const { insertGenreEn, insertGenreZh, insertGenreFr } = require('../controllers/genre_controller');

router.route('/admin/genre').post(insertGenreEn, insertGenreZh, insertGenreFr);

module.exports = router;
