const router = require('express').Router();

const { signUp, signIn, getUserDetail } = require('../controllers/user_controller');

router.route('/user/signup').post(signUp);

router.route('/user/signin').post(signIn);

router.route('/user/info').post(authentication(), getUserDetail);

module.exports = router;
