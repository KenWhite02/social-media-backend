const router = require('express').Router();
const User = require('../models/User');
const bcrpyt = require('bcrypt');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    // Hashing User Password
    const salt = await bcrpyt.genSalt(8);
    const hashedPassword = await bcrpyt.hash(req.body.password, salt);

    // Creating New User
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(404).send('User not found!');

    const validPassword = await bcrpyt.compare(
      req.body.password,
      user.password
    );
    !validPassword && res.status(400).send('Wrong password!');

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
