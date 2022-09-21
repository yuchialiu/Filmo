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
  showReviewWhenUpdate,
  showReviewByMovieId,
  showSearchMovie,
} = require('../controllers/page_controller');
// TODO:
// const { searchMovie } = require('../controllers/movie_controller');

router.get('/home', showMovieListInfo);

router.get('/login', (req, res) => {
  const { locale } = req.query;
  console.log(locale);
  res.render('login', {
    locale,
    locale_string: JSON.stringify(locale),
  });
});

router.get('/profile', authentication, (req, res) => {
  const { locale } = req.query;

  res.render('profile', {
    data: {
      user_id: req.session.userId,
      username: req.session.userName,
      user_email: req.session.userEmail,
      user_image: req.session.userImage,
    },
    locale,
    locale_string: JSON.stringify(locale),
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

router.get('/review/update', authentication, showReviewWhenUpdate);

router.get('/review/submit', authentication, showMovieInfoForReview);
// TODO:
router.get('/search', showSearchMovie);

module.exports = router;
