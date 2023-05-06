const express = require('express');
const router = express.Router();
const passport = require('passport');

const homeController = require('../controllers/home_controller');
const userController = require('../controllers/user_controller');

router.get('/', homeController.home);
router.get(
  '/dashboard',
  passport.checkAuthentication,
  userController.dashboard
);
router.get('/signin', userController.signIn);
router.get('/signup', userController.signUp);

//create and verify users
router.post('/create', userController.create);
router.get('/account-verify/:token', userController.accountVerification);

//Forget Password
router.get('/forget-password', (req, res) => {
  res.render('forget_password', {
    title: 'Forget Password',
  });
});
router.post('/forget-password', userController.forgetPassword);

//Reset Password
router.get('/reset-password/:token', userController.resetPasswordToken);
router.get('/reset/:id', (req, res) => {
  res.render('reset_password', {
    title: 'Reset Password',
    id: req.params.id,
  });
});
router.post('/reset/:id', userController.resetPassword);

//using passport as a middleware to authenticate
router.post(
  '/create-session',
  passport.authenticate('local', { failureRedirect: '/signin' }),
  userController.createSession
);

router.get('/signout', userController.destroySession);

router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/signin' }),
  userController.createSession
);

module.exports = router;
