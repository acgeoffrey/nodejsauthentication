//Setting up express
const express = require('express');
const app = express();
const PORT = 8000;

const env = require('./config/environment');

//Setting the express ejs layouts
const expressLayouts = require('express-ejs-layouts');

//used for session cookie
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const passportGoogle = require('./config/passport-google-oauth2-strategy');

//Setting up Database and mongo store for session cookies
const db = require('./config/mongoose');
const MongoStore = require('connect-mongo');

//Setting up flash messages and custom middleware for that
const flash = require('connect-flash');
const customMiddleware = require('./config/middleware');

app.use(express.urlencoded());
app.use(express.static(env.asset_path));
app.use(expressLayouts);

//extract style and script from the sub pages into the layout
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

//setup the view engine
app.set('view engine', 'ejs');
app.set('views', './views');

//mongo store is used to store the session cookie in the db
app.use(
  session({
    name: 'NodeJsAuth',
    //TODO: change the secret key before deployment in production mode
    secret: env.session_cookie_key,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 100,
    },
    store: MongoStore.create(
      {
        mongoUrl: 'mongodb://127.0.0.1:27017/nodejs_authentication',
        autoRemove: 'disabled',
      },
      function (err) {
        console.log(err || 'connect-mongodb setup ok');
      }
    ),
  })
);

//Use passport
app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);

app.use(flash());
app.use(customMiddleware.setFlash);

//use express router
app.use('/', require('./routes'));

app.listen(PORT, function (err) {
  if (err) {
    console.log(`Error in running the server: ${err}`);
  }
  console.log(`Server running on the PORT: ${PORT}`);
});
