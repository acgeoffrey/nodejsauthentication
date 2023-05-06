const User = require('../models/user');

module.exports.home = async (req, res) => {
  try {
    const user = await User.find({});

    return res.render('home', {
      title: 'NodeJS Authentication | Home',
    });
  } catch (err) {
    console.log(err);
  }
};
