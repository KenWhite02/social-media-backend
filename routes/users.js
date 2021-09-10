const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Update User
router.put('/:id', async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(8);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (error) {
        res.status(500).send();
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).send('Account has been updated');
    } catch (error) {
      res.status(500).send();
    }
  } else {
    return res.status(403).send();
  }
});

// Delete User
router.delete('/:id', async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).send('Account has been deleted successfully!');
    } catch (error) {
      res.status(500).send();
    }
  } else {
    return res.status(403).send('You can delete only your account');
  }
});

// Get a User
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).send(other);
  } catch (error) {
    res.status(500).send();
  }
});

// Follow a User
router.put('/:id/follow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const me = await User.findById(req.params.id);
      const follow = await User.findById(req.body.userId);

      if (!me.following.includes(req.body.userId)) {
        await me.updateOne({ $push: { following: req.body.userId } });
        await follow.updateOne({ $push: { followers: req.params.id } });
        res.status(200).send('User has been followed');
      } else {
        res.status(404).send('You already follow this user!');
      }
    } catch (error) {
      res.status(500).send();
    }
  } else {
    res.status(403).send('You cannot follow yourself!');
  }
});

// Unfollow a User
router.put('/:id/unfollow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const me = await User.findById(req.params.id);
      const unfollow = await User.findById(req.body.userId);

      if (me.following.includes(req.body.userId)) {
        await me.updateOne({ $pull: { following: req.body.userId } });
        await unfollow.updateOne({ $pull: { followers: req.params.id } });
        res.status(200).send('User has been unfollowed');
      } else {
        res.status(404).send('You do not follow this user!');
      }
    } catch (error) {
      res.status(500).send();
    }
  } else {
    res.status(403).send('You cannot unfollow yourself!');
  }
});

module.exports = router;
