const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/environment');
const TOKEN_SECRET = env.jwt_secret;
const mailer = require('../mailer/mailer');

//render the dashboard
module.exports.dashboard = async function (req, res) {
  // const user = await User.findById(req.params.id);
  if (req.isAuthenticated()) {
    return res.render('dashboard', {
      title: 'Dashboard',
    });
  } else {
    return res.redirect('/signin');
  }
};

//render the sign in page
module.exports.signIn = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }

  return res.render('signin', {
    title: 'NodeJS Authentication | Sign In',
  });
};

//render the sign up page
module.exports.signUp = function (req, res) {
  return res.render('signup', {
    title: 'NodeJS Authentication | Sign Up',
  });
};

//sign up and create user
module.exports.create = async (req, res) => {
  if (req.body.password != req.body.confirm_password) {
    req.flash('error', "Passwords doesn't match!");
    return res.redirect('back');
  }

  try {
    const { name, email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (user) {
      req.flash('error', 'Email already exits!');
      return res.redirect('back');
    } else {
      const token = jwt.sign({ name, email, password }, TOKEN_SECRET, {
        expiresIn: '10m',
      });
      mailer.accountVerification(req, res, token);
    }
  } catch (err) {
    console.log(err);
  }
};

//account verification
module.exports.accountVerification = async (req, res) => {
  if (req.params.token) {
    jwt.verify(req.params.token, TOKEN_SECRET, async (err, decryptedData) => {
      if (err) {
        req.flash('error', 'Invalid or Expired Link!');
        return res.redirect('/signup');
      }
      const { name, email, password } = decryptedData;
      const user = await User.findOne({ email: email });

      if (user) {
        req.flash('error', 'Email already exits!');
        return res.redirect('/signin');
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      await User.create({
        email: email,
        name: name,
        password: hashedPassword,
      });
      req.flash('success', 'Account activated!');
      return res.redirect('/signin');
    });
  }
};

//forget password
module.exports.forgetPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (user) {
      const token = jwt.sign({ email }, TOKEN_SECRET, {
        expiresIn: '10m',
      });
      mailer.resetPassword(req, res, token);
      req.flash('success', 'Password reset link sent!');
    } else {
      req.flash('error', 'Email not found! Create new account.');
      res.redirect('/signup');
    }
  } catch (err) {
    console.log(err);
  }
};

//reset password
module.exports.resetPasswordToken = async (req, res) => {
  try {
    if (req.params.token) {
      jwt.verify(req.params.token, TOKEN_SECRET, async (err, decryptedData) => {
        if (err) {
          req.flash('error', 'Invalid or Expired Link!');
          return res.redirect('/signin');
        }
        const { email } = decryptedData;
        const user = await User.findOne({ email: email });
        if (user) {
          return res.redirect(`/reset/${user._id}`);
        }

        req.flash('error', 'Error in finding user');
        return res.redirect('/');
      });
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports.resetPassword = async (req, res) => {
  if (req.body.password != req.body.confirm_password) {
    req.flash('error', "Passwords doesn't match!");
    return res.redirect('back');
  }
  try {
    const id = req.params.id;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = await User.findByIdAndUpdate(id, { password: hashedPassword });
    user.save();
    req.flash('success', 'Password reset successfully!');
    res.redirect('/signin');
  } catch (err) {
    console.log(err);
  }
};

//sign in and create a session for the user
module.exports.createSession = function (req, res) {
  req.flash('success', 'Logged in Successfully');
  return res.redirect('/dashboard');
};

//sign out the user
module.exports.destroySession = function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  req.flash('success', 'You have Logged out!');
  return res.redirect('/');
};
