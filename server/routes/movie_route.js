const router = require('express').Router();
const { getMovieListInfo, getMovieInfo, getPersonDetail, searchMovie } = require('../controllers/movie_controller');

// router.route('/').get(showMain);
router.route('/movie/info/list').get(getMovieListInfo);
router.route('/movie/info').get(getMovieInfo);
router.route('/movie/person/detail').get(getPersonDetail);
router.route('/movie/search').get(searchMovie);

module.exports = router;
