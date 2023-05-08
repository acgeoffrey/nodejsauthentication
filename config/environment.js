const production = {
  name: 'production',
  asset_path: process.env.AUTH_ASSET_PATH,
  session_cookie_key: process.env.AUTH_SESSION_COOKIE_KEY,
  db: 'nodejs_authentication',
  nodemailer: {
    clientId: process.env.AUTH_NM_CI,
    clientSecret: process.env.AUTH_NM_CS,
    refreshToken: process.env.AUTH_NM_RTOKEN,
    user: process.env.AUTH_NM_USER,
  },
  google_client_id: process.env.AUTH_G_CI,
  google_client_secret: process.env.AUTH_G_CS,
  google_callback_url: 'http://127.0.0.1:8000/auth/google/callback',
  jwt_secret: process.env.AUTH_JWT_SECRET,
  google_recaptcha2: process.env.AUTH_RECAPTCHA,
};

module.exports = production;
