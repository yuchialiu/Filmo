const router = require('express').Router();

const { authentication, upload } = require('../../util/util.js');

const {
  signUp,
  signIn,
  getUserDetail,
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
  saveUserMovie,
  getUserSavedMovie,
  deleteUserSavedMovie,
} = require('../controllers/user_controller');

router.route('/user/signup').post(signUp);

router.route('/user/signin').post(signIn);

router.route('/user/info').get(authentication(), getUserDetail);

// router.route('/user/image').post(authentication(), cpUpload, updateUserImage);

router
  .route('/user/review')
  .post(authentication(), createUserReview)
  .get(authentication(), getUserReview)
  .patch(authentication(), updateUserReview)
  .delete(authentication(), deleteUserReview);

router
  .route('/user/comment')
  .post(authentication(), createUserComment)
  .get(authentication(), getUserComment)
  .patch(authentication(), updateUserComment)
  .delete(authentication(), deleteUserComment);

router.route('/user/store/review').post(authentication(), saveUserReview).get(authentication(), getUserSavedReview).delete(authentication(), deleteUserSavedReview);

router.route('/user/store/movie').post(authentication(), saveUserMovie).get().delete(authentication(), deleteUserSavedMovie);

module.exports = router;
