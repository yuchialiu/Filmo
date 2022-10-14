const router = require('express').Router();

const { authenticationAPI, upload, checkImageExist } = require('../../util/util');

const cpUpload = upload.fields([{ name: 'image', maxCount: 1 }]);

const {
  signUp,
  signIn,
  logout,
  getUserDetail,
  updateUserImage,
  createUserReview,
  getUserReview,
  updateUserReview,
  deleteUserReview,
  createUserComment,
  getUserComment,
  updateUserComment,
  deleteUserComment,
  updateUserSavedReview,
  getUserSavedReview,
  deleteUserSavedReview,
  updateUserSavedMovie,
  getUserSavedMovie,
  deleteUserSavedMovie,
  createMovieRating,
  getMovieInfoForReview,
} = require('../controllers/user_controller');

router.route('/signup').post(signUp);

router.route('/signin').post(signIn);

router.route('/logout').get(logout);

router.route('/profile').get(authenticationAPI, getUserDetail);

router.route('/image').post(authenticationAPI, cpUpload, checkImageExist, updateUserImage);

router
  .route('/review')
  .post(authenticationAPI, cpUpload, createUserReview)
  .get(authenticationAPI, getUserReview)
  .patch(authenticationAPI, cpUpload, updateUserReview)
  .delete(authenticationAPI, deleteUserReview);

router
  .route('/comment')
  .post(authenticationAPI, createUserComment)
  .get(authenticationAPI, getUserComment)
  .patch(authenticationAPI, updateUserComment)
  .delete(authenticationAPI, deleteUserComment);

router.route('/store/review').post(authenticationAPI, updateUserSavedReview).get(authenticationAPI, getUserSavedReview).delete(authenticationAPI, deleteUserSavedReview);

router.route('/store/movie').post(authenticationAPI, updateUserSavedMovie).get(authenticationAPI, getUserSavedMovie).delete(authenticationAPI, deleteUserSavedMovie);

router.route('/movie/rating').post(authenticationAPI, createMovieRating);

router.route('/review/submit').get(authenticationAPI, getMovieInfoForReview);

module.exports = router;
