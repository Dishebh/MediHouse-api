const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
require('dotenv').config();

const router = express.Router();

const baseUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.BASE_URL_PROD
    : process.env.BASE_URL_DEV;

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.patch('/update-user', authController.updateUser);

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get('/google/callback', passport.authenticate('google'), (req, res) => {
  res.redirect(`${baseUrl}/dashboard`);
});

// router.get('/logout', (req, res) => {
//   req.logout();
//   res.redirect(`${baseUrl}/login`);
// });

router.get('/current_user', (req, res) => {
  console.log('user!', req.user);
  res.send(req.user);
});

module.exports = router;
