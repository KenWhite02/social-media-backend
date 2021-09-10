const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');

// Create a post
router.post('/', async (req, res) => {
  const newPost = new Post(req.body);

  try {
    const savedPost = await newPost.save();
    res.status(200).send(savedPost);
  } catch (error) {
    res.status(500).send();
  }
});

// Update a post
router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).send('Your post has been updated!');
    } else {
      res.status(403).send('You can update only your post!');
    }
  } catch (error) {
    res.status(500).send();
  }
});

// Delete a post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).send('Your post has been deleted!');
    } else {
      res.status(403).send('You can delete only your post!');
    }
  } catch (error) {
    res.status(500).send();
  }
});

// Like and Unlike a post
router.put('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).send('The post has been liked!');
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).send('The post has been disliked!');
    }
  } catch (error) {
    res.status(403).send();
  }
});

// Get a post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).send(post);
  } catch (error) {
    res.status(500).send();
  }
});

// Get timeline posts
router.get('/timeline/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: user._id });
    const friendsPosts = await Promise.all(
      user.following.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).send(userPosts.concat(...friendsPosts));
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
