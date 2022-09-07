const router = require('express').Router();

const { insertGenreCrawler, insertMovieCrawler, insertPersonCrawler } = require('../controllers/crawler_controller');

router.route('/crawler/genre').post(insertGenreCrawler);

router.route('/crawler/movie').post(insertMovieCrawler);

router.route('/crawler/person').post(insertPersonCrawler);

module.exports = router;
