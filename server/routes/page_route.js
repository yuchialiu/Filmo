const router = require('express').Router();
const { authentication } = require('../../util/util');

const { getAllReviews, getReviewById } = require('../controllers/user_controller');
const { movieListInfo, profileReview } = require('../controllers/page_controller');

router.get('/home', movieListInfo);

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/profile', authentication, (req, res) => {
  res.render('profile', {
    data: {
      user_id: req.session.userId,
      username: req.session.userName,
      user_email: req.session.userEmail,
      user_image: req.session.userImage,
    },
  });
});

router.get('/movie', (req, res) => {
  res.render('movie', { id: req.query.id, locale: req.query.locale });
});

router.get('/person', (req, res) => {
  res.render('person', { person_id: req.query.id, locale: req.query.locale });
});

router.get('/profile/review', authentication, profileReview);

router.get('/store/review', authentication, (req, res) => {
  res.render('saved_review');
});

router.get('/store/movie', authentication, (req, res) => {
  res.render('saved_movie');
});

router.route('/review').get(getAllReviews);

// TODO:
router.route('/review/info').get(getReviewById);

module.exports = router;
