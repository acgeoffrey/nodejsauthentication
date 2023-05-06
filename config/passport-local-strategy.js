const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcrypt');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passReqToCallback: true,
    },
    async function (req, email, password, done) {
      try {
        //finding the user
        const user = await User.findOne({ email: email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
          req.flash('error', 'Invalid username/password');
          return done(null, false);
        }

        return done(null, user);
      } catch (err) {
        req.flash('error', err);
        return done(err);
      }
    }
  )
);

// serializing to the user
passport.serializeUser(function (user, done) {
  done(null, user.id); //we are wanting to store the user id -- automatically encrypted
});

// deserializing the user from the key in the cookies
passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);

    return done(null, user); //returning null because there is no error there
  } catch (err) {
    console.log('Error in finding user --> Passport');
    return done(err);
  }
});

//  CREATING THESE FUNCTION ON PASSPORT
//check if the user is authenticated
passport.checkAuthentication = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  //if the user is not authenticated
  return res.redirect('/signin');
};

//Setting the user for the views
passport.setAuthenticatedUser = function (req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  next();
};

module.exports = passport;
