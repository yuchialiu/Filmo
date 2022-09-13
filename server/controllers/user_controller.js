require('dotenv').config();
const validator = require('validator');
const bcrypt = require('bcrypt');

const { TOKEN_EXPIRE, TOKEN_SECRET } = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');
const User = require('../models/user_model');

const signUp = async (req, res) => {
  let { username } = req.body;
  const { email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).send({ error: 'Request Error: name, email and password are required.' });
    return;
  }

  if (!validator.isEmail(email)) {
    res.status(400).send({ error: 'Request Error: Invalid email format' });
    return;
  }

  username = validator.escape(username);

  const result = await User.CreateUser(username, User.USER_ROLE.USER, email, password);
  if (result.error) {
    res.status(403).send({ error: result.error });
    return;
  }

  const { user } = result;
  if (!user) {
    res.status(500).send({ error: 'Database Query Error' });
    return;
  }

  res.status(201).send({
    data: {
      access_token: user.access_token,
      access_expired: user.access_expired,
      user: {
        id: user.id,
        username: user.username,
        role: 'user',
        email: user.email,
        picture: user.picture,
      },
    },
  });
};

const signIn = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send({ error: 'Request Error: email and password are required.' });
  }

  try {
    const result = await validateUser(email, password);
    res.status(201).send({
      response: result,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err });
  }
};

const getUserDetail = async (req, res) => {
  res.status(200).send({
    data: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      picture: req.user.picture,
    },
  });
};

// const updateUserImage = async (req, res) => {
//   const { id } = req.user;
//   const image = req.files.image[0].filename;
//   const path = await User.putImage(id, image);
//   res.status(201).json({
//     data: {
//       picture: path,
//     },
//   });
// };

// Reviews CRUD
const createUserReview = async (req, res) => {
  const { id } = req.user;
  const { movie_id, content, image } = req.body;

  // TODO: image handler
  const result = await User.createUserReview(id, movie_id, content, image);
  if (result.err) {
    console.log(result.err);
    res.status(500).send({ err: 'cannot add comment' });
  } else {
    res.status(200).send({
      data: {
        comment_id: result,
      },
    });
  }
};

const getUserReview = async (req, res) => {
  const { id } = req.user;

  const result = await User.getUserReview(id);
  if (result.err) {
    console.log(result.err);
    res.status(500).send({ err: 'cannot get review' });
  } else {
    res.status(200).send({
      data: result,
    });
  }
};

const updateUserReview = async (req, res) => {
  const { id } = req.user;
  const { review_id, content } = req.body;

  const result = await User.updateUserReview(id, review_id, content);
  if (result.err) {
    console.log(result.err);
    res.status(500).send({ err: 'review belongs to other user' });
  } else {
    res.status(200).send({
      data: {
        comment: 'updated',
      },
    });
  }
};

const deleteUserReview = async (req, res) => {
  const { id } = req.user;
  const { review_id } = req.body;

  const result = await User.deleteUserReview(id, review_id);
  if (result.err) {
    console.log(result.err);
    res.status(500).send({ err: 'review belongs to other user' });
  } else {
    res.status(200).send({
      data: {
        comment: 'deleted',
      },
    });
  }
};

// Comment CRUD

const createUserComment = async (req, res) => {
  const { id } = req.user;
  const { review_id, content } = req.body;

  const result = await User.createUserComment(id, review_id, content);
  if (result.err) {
    console.log(result.err);
    res.status(500).send({ err: 'cannot add comment' });
  } else {
    res.status(200).send({
      data: {
        comment_id: result,
      },
    });
  }
};

const getUserComment = async (req, res) => {
  const { id } = req.user;

  const result = await User.getUserComment(id);
  if (result.err) {
    console.log(result.err);
    res.status(500).send({ err: 'cannot get comment' });
  } else {
    res.status(200).send({
      data: result,
    });
  }
};

const updateUserComment = async (req, res) => {
  const { id } = req.user;
  const { comment_id, content } = req.body;

  const result = await User.updateUserComment(id, comment_id, content);
  if (result.err) {
    console.log(result.err);
    res.status(500).send({ err: 'comment belongs to other user' });
  } else {
    res.status(200).send({
      data: {
        comment: 'updated',
      },
    });
  }
};

const deleteUserComment = async (req, res) => {
  const { id } = req.user;
  const { comment_id } = req.body;

  const result = await User.deleteUserComment(id, comment_id);
  if (result.err) {
    console.log(result.err);
    res.status(500).send({ err: 'comment belongs to other user' });
  } else {
    res.status(200).send({
      data: {
        comment: 'deleted',
      },
    });
  }
};

// Saved Reviews CRD
const saveUserReview = async (req, res) => {
  const { id } = req.user;
  const { review_id } = req.body;

  const result = await User.saveUserReview(id, review_id);
  if (result.err) {
    console.log(result.err);
    res.status(500).send({ err: 'review saved or review not existed' });
  } else {
    res.status(200).send({
      data: {
        user_id: result.userId,
        review_id: result.reviewId,
      },
    });
  }
};

const getUserSavedReview = async (req, res) => {
  const { id } = req.user;
  const result = await User.getUserSavedReview(id);
  // TODO: get review info by review ID
  // if (result.err) {
  //   console.log(result.errerr);
  //   res.status(500).send({ err: result.err });
  //   return;
  // }
  res.status(200).send({ data: result });
};

const deleteUserSavedReview = async (req, res) => {
  const { id } = req.user;
  const { review_id } = req.body;

  const result = await User.deleteUserSavedReview(id, review_id);

  if (result.err) {
    console.log(result.err);
    res.status(500).send({ err: 'cannot delete' });
    return;
  }
  res.status(200).send({ result: 'deleted' });
};

// Saved Movies CRD
const saveUserMovie = async (req, res) => {
  const { id } = req.user;
  const { movie_id } = req.body;

  const result = await User.saveUserMovie(id, movie_id);
  if (result.err) {
    console.log(result.err);
    res.status(500).send({ err: 'movie saved or review not existed' });
    return;
  }
  res.status(200).send({
    data: {
      user_id: result.userId,
      movie_id: result.movieId,
    },
  });
};

const getUserSavedMovie = async (req, res) => {
  const { id } = req.user;
  const result = await User.getUserSavedMovie(id);
  const data = {};
  data.user_id = id;
  data.result = result;
  // TODO: get movie info by movie ID
  res.status(200).send({ data });
};

const deleteUserSavedMovie = async (req, res) => {
  const { id } = req.user;
  const { movie_id } = req.body;

  const result = await User.deleteUserSavedMovie(id, movie_id);

  if (result.err) {
    console.log(result.err);
    res.status(500).send({ err: 'cannot delete' });
    return;
  }
  res.status(200).send({ result: 'deleted' });
};

// Movie rating

// Review ranking

// Comment ranking

module.exports = {
  signUp,
  signIn,
  getUserDetail,
  createUserReview,
  getUserReview,
  updateUserReview,
  deleteUserReview,
  createUserComment,
  getUserComment,
  updateUserComment,
  deleteUserComment,
  saveUserReview,
  getUserSavedReview,
  deleteUserSavedReview,
  saveUserMovie,
  getUserSavedMovie,
  deleteUserSavedMovie,
};

async function validateUser(email, password) {
  const user = await User.GetUser(email);
  // console.log(user.user.password);
  if (!bcrypt.compareSync(password, user.user.password)) {
    console.log({ email, error: 'Password is wrong' });
    return { error: 'Email or password is wrong' };
  }

  const result = {};
  const accessToken = await generateJWT(user.user);
  result.access_token = accessToken;
  result.user = user.user;
  return result;
}

function generateJWT(user) {
  const accessToken = jwt.sign(
    {
      username: user.username,
      id: user.id,
      role: user.role,
      email: user.email,
      picture: user.profile_image,
    },
    TOKEN_SECRET,
    { expiresIn: TOKEN_EXPIRE }
  );

  return accessToken;
}
