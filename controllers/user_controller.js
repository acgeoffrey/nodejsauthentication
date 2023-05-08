const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/environment');
const TOKEN_SECRET = env.jwt_secret;
const mailer = require('../mailer/mailer');

/*** Render the Dashboard ***/
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

/*** Render the Signin page ***/
module.exports.signIn = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }

  return res.render('signin', {
    title: 'NodeJS Authentication | Sign In',
  });
};

/*** Render the Signup page ***/
module.exports.signUp = function (req, res) {
  return res.render('signup', {
    title: 'NodeJS Authentication | Sign Up',
  });
};

/*** Signup User ***/
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
      ///Using JSON Web Token for creating verification token

      const token = jwt.sign({ name, email, password }, TOKEN_SECRET, {
        expiresIn: '10m',
      });
      mailer.accountVerification(req, res, token);
    }
  } catch (err) {
    console.log(err);
  }
};

/*** Account Verification and Creating user in the database ***/

module.exports.accountVerification = async (req, res) => {
  if (req.params.token) {
    ///Verifying the json web token
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

      // If email not found in database already, create a new user
      //Encrypting the password using bcrypt
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

/*** Sending Password Reset Link ***/
module.exports.forgetPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (user) {
      /// creating jwt token for resetting password
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

/*** Verify Password Reset Link and redirecting to Password Reset Page ***/
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

/*** Password Reset Controller ***/
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

/*** Signin and Create a session for the user ***/
module.exports.createSession = function (req, res) {
  req.flash('success', 'Logged in Successfully');
  return res.redirect('/dashboard');
};

/*** Signout the user ***/
module.exports.destroySession = function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  req.flash('success', 'You have Logged out!');
  return res.redirect('/');
};
