const router = require('express').Router();
const { authentication } = require('../../util/util');
const Lang = require('../../util/language');

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
  showReviewWhenUpdate,
  showReviewByMovieId,
  showSearchMovie,
  showProfile,
} = require('../controllers/page_controller');

router.get('/home', showMovieListInfo);

router.get('/login', (req, res) => {
  const { locale } = req.query;
  const { isAuth } = req.session;

  res.render('login', {
    locale,
    locale_string: JSON.stringify(locale),
    lang: Lang[locale],
    isAuth,
  });
});

router.get('/profile', authentication, showProfile);

router.get('/movie', showMovieInfo);

router.get('/person', showPersonDetail);

router.get('/profile/review', authentication, showProfileReview);

router.get('/store/review', authentication, showUserSavedReview);

router.get('/store/movie', authentication, showUserSavedMovie);

router.get('/review', showAllReviews);

router.get('/review/movie', showReviewByMovieId);

router.get('/review/info', showReviewById);

router.get('/review/update', authentication, showReviewWhenUpdate);

router.get('/review/submit', authentication, showMovieInfoForReview);

router.get('/search', showSearchMovie);

module.exports = router;
