const router = require('express').Router();
const { authentication } = require('../../util/util');
const lang = require('../../util/language');

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
    lang: lang[locale],
    isAuth,
  });
});

router.get('/profile', authentication, showProfile);

// TODO:
// router.route('/profile', authentication, showProfile);

// router.get('/profile', authentication, (req, res) => {
//   const { locale } = req.query;
//   console.log('aaa');
//   res.render('profile', {
//     data: {
//       user_id: req.session.userId,
//       username: req.session.userName,
//       user_email: req.session.userEmail,
//       user_picture: req.session.picture,
//     },
//     locale,
//     locale_string: JSON.stringify(locale),
//     lang: lang[locale],
//   });
// });

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
