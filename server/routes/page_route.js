const router = require('express').Router();
const { authentication } = require('../../util/util');

const {
  showMovieListInfo,
  showMovieInfo,
  showMovieInfoForReview,
  showPersonDetail,
  showProfileReview,
  showUserSavedReview,
  showUserSavedMovie,
  showAllReviews,
  showReviewById,
  showReviewByMovieId,
} = require('../controllers/page_controller');

router.get('/home', showMovieListInfo);

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
      locale: req.query.locale,
    },
  });
});

router.get('/movie', showMovieInfo);
// router.get('/movie', (req, res) => {
//   res.render('movie', { id: req.query.id, locale: req.query.locale });
// });

router.get('/person', showPersonDetail);

router.get('/profile/review', authentication, showProfileReview);

router.get('/store/review', authentication, showUserSavedReview);

router.get('/store/movie', authentication, showUserSavedMovie);

router.get('/review', showAllReviews);

router.get('/review/movie', showReviewByMovieId);

router.get('/review/info', showReviewById);

router.get('/review/submit', authentication, showMovieInfoForReview);

module.exports = router;
