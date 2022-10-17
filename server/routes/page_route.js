const router = require('express').Router();
const { authentication, language } = require('../../util/util');
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

router.get('/home', language, showMovieListInfo);

router.get('/login', language, (req, res) => {
  const { locale } = req.query;
  const { isAuth } = req.session;

  res.render('login', {
    locale,
    locale_string: JSON.stringify(locale),
    lang: Lang[locale],
    isAuth,
  });
});

router.get('/profile', language, authentication, showProfile);

router.get('/movie', language, showMovieInfo);

router.get('/person', language, showPersonDetail);

router.get('/profile/review', language, authentication, showProfileReview);

router.get('/store/review', language, authentication, showUserSavedReview);

router.get('/store/movie', language, authentication, showUserSavedMovie);

router.get('/review', language, showAllReviews);

router.get('/review/movie', language, showReviewByMovieId);

router.get('/review/info', language, showReviewById);

router.get('/review/update', language, authentication, showReviewWhenUpdate);

router.get('/review/submit', language, authentication, showMovieInfoForReview);

router.get('/search', language, showSearchMovie);

module.exports = router;
