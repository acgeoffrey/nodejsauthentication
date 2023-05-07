const nodemailer = require('../config/nodemailer');
const env = require('../config/environment');

/*** Mail Template for Account Verification email ***/
exports.accountVerification = (req, res, token) => {
  const html = `
  <h2>Activate your account</h2>
  <a href="http://${req.headers.host}/account-verify/${token}">
  <button>Click here to Activate your Account</button></a>
  <p><strong><em>NOTE:</em> </strong> Activation link expires in 10 minutes</p>.
  `;

  nodemailer.transporter.sendMail(
    {
      from: env.nodemailer.user,
      to: req.body.email,
      subject: 'Verify your email | NodeJS Authentication',
      html: html,
    },
    (err, info) => {
      if (err) {
        console.log('Error in sending mail', err);
        return res.redirect('/signin');
      }
      return res.redirect('/signin');
    }
  );
};

/*** Mail Template for Reset Password Link ***/
exports.resetPassword = (req, res, token) => {
  const html = `
  <h2>Reset your Account Password</h2>
  <a href="http://${req.headers.host}/reset-password/${token}">
  <button>Click here to Reset your Password</button></a>
  <p><strong><em>NOTE:</em> </strong> Activation link expires in 10 minutes</p>.
  `;

  nodemailer.transporter.sendMail(
    {
      from: env.nodemailer.user,
      to: req.body.email,
      subject: 'Reset Password Link | NodeJS Authentication',
      html: html,
    },
    (err, info) => {
      if (err) {
        console.log('Error in sending mail', err);
        return res.redirect('/signin');
      }
      return res.redirect('/signin');
    }
  );
};
