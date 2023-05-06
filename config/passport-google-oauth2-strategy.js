const passport = require('passport');
const googleStrategy = require('passport-google-oauth').OAuth2Strategy;
const crypto = require('crypto');
const User = require('../models/user');
const env = require('../config/environment');

//Setting up google oauth2 strategy on passport
passport.use(
  new googleStrategy(
    {
      clientID: env.google_client_id,
      clientSecret: env.google_client_secret,
      callbackURL: env.google_callback_url,
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        //Finding user if already present
        const user = await User.findOne({
          email: profile.emails[0].value,
        }).exec();

        console.log(profile);

        if (user) {
          //set the user as req.user
          return done(null, user);
        } else {
          //Creating new user if user is not found
          const createUser = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: crypto.randomBytes(20).toString('hex'),
          });

          return done(null, createUser);
        }
      } catch (err) {
        console.log(err);
      }
    }
  )
);

module.exports = passport;
