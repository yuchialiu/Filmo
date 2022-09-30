const router = require('express').Router();

const { authentication, upload, checkImageExist } = require('../../util/util');

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
  saveUserReview,
  getUserSavedReview,
  deleteUserSavedReview,
  updateUserSavedMovie,
  // saveUserMovie,
  getUserSavedMovie,
  deleteUserSavedMovie,
  createMovieRating,
} = require('../controllers/user_controller');

router.route('/signup').post(signUp);

router.route('/signin').post(signIn);

router.route('/logout').get(logout);

router.route('/info').get(authentication, getUserDetail);

router.route('/image').post(authentication, cpUpload, checkImageExist, updateUserImage);

router
  .route('/review')
  .post(authentication, cpUpload, createUserReview)
  .get(authentication, getUserReview)
  .patch(authentication, cpUpload, updateUserReview)
  .delete(authentication, deleteUserReview);

router
  .route('/comment')
  .post(authentication, createUserComment)
  .get(authentication, getUserComment)
  .patch(authentication, updateUserComment)
  .delete(authentication, deleteUserComment);

router.route('/store/review').post(authentication, saveUserReview).get(authentication, getUserSavedReview).delete(authentication, deleteUserSavedReview);

router.route('/store/movie').post(authentication, updateUserSavedMovie).get(authentication, getUserSavedMovie).delete(authentication, deleteUserSavedMovie);

router.route('/movie/rating').post(authentication, createMovieRating);

module.exports = router;
