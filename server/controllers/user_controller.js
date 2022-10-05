/* eslint-disable no-restricted-syntax */
require('dotenv').config();
const validator = require('validator');
const bcrypt = require('bcrypt');

const { SERVER_IP, AWS_CLOUDFRONT_DOMAIN } = process.env;
const User = require('../models/user_model');
const Movie = require('../models/movie_model');
const lang = require('../../util/language');

const signUp = async (req, res) => {
  let { username } = req.body;
  const { email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ error: 'name, email and password are required' });
    return;
  }

  if (!validator.isEmail(email)) {
    res.status(400).json({ error: 'Invalid email format' });
    return;
  }

  username = validator.escape(username);

  const resultEmail = await User.validateEmail(email);
  if (resultEmail.length) {
    return res.status(400).json({ error: 'Email existed' });
  }

  const resultUsername = await User.validateUsername(username);
  if (resultUsername.length) {
    return res.status(400).json({ error: 'Username existed' });
  }

  const result = await User.createUser(username, User.USER_ROLE.USER, email, password);
  if (result.error) {
    res.status(403).json({ error: result.error.message });
    return;
  }

  const { user } = result;
  if (!user) {
    res.status(500).json({ error: 'Database Query Error' });
    return;
  }

  req.session.userId = user.id;
  req.session.userName = user.username;
  req.session.userEmail = user.email;
  req.session.picture = user.picture;
  req.session.isAuth = true;

  res.status(201).send({
    data: {
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
    return res.status(400).json({ error: 'Request Error: email and password are required.' });
  }
  const user = await User.validateEmail(email);

  if (user.error) {
    return res.status(400).json({ error: "This email hasn't been registered" });
  }

  const isAuth = await bcrypt.compare(password, user[0].password);
  if (!isAuth) {
    console.log({ email, error: 'Password is wrong' });
    return res.status(400).json({ error: 'Email or password is wrong' });
  }

  req.session.userId = user[0].id;
  req.session.userName = user[0].username;
  req.session.userEmail = user[0].email;
  req.session.picture = `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${user[0].profile_image}`;
  req.session.isAuth = true;

  return res.status(201).send({
    response: user,
  });
  // const result = await validateUser(email, password);
};

const logout = async (req, res) => {
  req.session.isAuth = false;
  res.status(200).json({ message: 'logout' });
};

// TODO: api from frontend
const getUserDetail = async (req, res) => {
  res.status(200).send({
    data: {
      user_id: req.session.userId,
      username: req.session.userName,
      user_email: req.session.userEmail,
      user_picture: req.session.picture,
    },
  });
};

const updateUserImage = async (req, res) => {
  const { userId } = req.session;
  if (req.files.image === undefined) {
    return res.status(400).json({ error: 'did not choose file' });
  }
  // const image = req.files.image[0].key;
  const image = req.filename;

  const result = await User.updateUserImage(userId, image);
  req.session.picture = `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${image}`;

  if (result.err) {
    console.log(result.err);
    res.status(500).json({ error: 'cannot update image ' });
  } else {
    res.status(200).json({
      data: 'update success',
    });
  }
};

// Reviews CRUD
const createUserReview = async (req, res) => {
  const { userId } = req.session;
  const { movieId, title, content } = req.body;
  let image;
  if (req.files.image) {
    image = req.files.image[0].key;
  } else {
    image = null;
  }

  // image handler
  const result = await User.createUserReview(userId, movieId, title, content, image);
  if (result.err) {
    console.log(result.err);
    res.status(500).json({ error: 'cannot add review' });
  } else {
    res.status(200).json({
      review_id: result,
    });
  }
};

const getUserReview = async (req, res) => {
  const { userId } = req.session;
  const { locale } = req.query;

  const resultReview = await User.getUserReview(userId);

  const info = [];
  for (const review of resultReview) {
    const resultMovie = await Movie.getMovieInfo(review.movie_id, locale);

    const result = {
      id: review.id,
      review_title: review.title,
      content: review.content,
      image: `${SERVER_IP}/public/assets/images/uploads/${review.image}`,
      image_blurred: review.image_blurred,
      user_id: review.user_id,
      created_dt: review.created_dt,
      updated_dt: review.updated_dt,
      movie_id: resultMovie.movie_id,
      title: resultMovie.title,
      poster: `${SERVER_IP}/public/assets/images/posters/${resultMovie.poster_image}`,
    };

    info.push(result);
  }

  const response = {
    data: info,
  };
  res.status(200).send(response);
};

const updateUserReview = async (req, res) => {
  const { userId } = req.session;
  const { reviewId, title, content } = req.body;
  let image;
  if (req.files.image) {
    image = req.files.image[0].key;
  } else {
    image = null;
  }

  const result = await User.updateUserReview(userId, reviewId, title, content, image);
  if (result.err) {
    console.log(result.err);
    res.status(500).json({ error: 'review belongs to other user' });
  } else {
    res.status(200).json({
      data: {
        message: 'updated',
      },
    });
  }
};

const deleteUserReview = async (req, res) => {
  const { userId } = req.session;
  const { reviewId } = req.body;

  const result = await User.deleteUserReview(userId, reviewId);
  if (result.err) {
    console.log(result.err);
    res.status(500).json({ error: 'review belongs to other user' });
  } else {
    res.status(200).json({
      data: {
        message: 'deleted',
      },
    });
  }
};

// Comment CRUD

const createUserComment = async (req, res) => {
  const { userId } = req.session;
  const { reviewId, content } = req.body;

  const result = await User.createUserComment(userId, reviewId, content);
  if (result.err) {
    console.log(result.err);
    res.status(500).json({ error: 'cannot add comment' });
  } else {
    res.status(200).json({
      data: {
        comment_id: result,
      },
    });
  }
};

const getUserComment = async (req, res) => {
  const { userId } = req.session;

  const result = await User.getUserComment(userId);
  if (result.err) {
    console.log(result.err);
    res.status(500).json({ error: 'cannot get comment' });
  } else {
    res.status(200).json({
      data: result,
    });
  }
};

const updateUserComment = async (req, res) => {
  const { userId } = req.session;
  const { commentId, content } = req.body;

  const result = await User.updateUserComment(userId, commentId, content);
  if (result.err) {
    console.log(result.err);
    res.status(500).json({ error: 'comment belongs to other user' });
  } else {
    res.status(200).json({
      data: {
        message: 'updated',
      },
    });
  }
};

const deleteUserComment = async (req, res) => {
  const { userId } = req.session;
  const { commentId } = req.body;

  const result = await User.deleteUserComment(userId, commentId);
  if (result.err) {
    console.log(result.err);
    res.status(500).json({ error: 'comment belongs to other user' });
  } else {
    res.status(200).json({
      data: {
        message: 'deleted',
      },
    });
  }
};

// Saved Reviews CRD
const updateUserSavedReview = async (req, res) => {
  const { userId } = req.session;
  const { reviewId } = req.body;

  const result = await User.updateUserSavedReview(userId, reviewId);
  if (result.err) {
    console.log(result.err);
    res.status(500).send(result.err);
    return;
  }
  res.status(200).send({
    data: result,
  });
};

const getUserSavedReview = async (req, res) => {
  const { userId } = req.session;

  const resultSavedReview = await User.getUserSavedReview(userId);
  const result = [];

  for (const reivew of resultSavedReview) {
    const resultReview = await User.getReviewInfo(reivew.review_id);
    // for (const j in resultReview) {
    const info = {
      review_id: resultReview.id,
      content: resultReview.content,
      image: `${SERVER_IP}/public/assets/images/uploads/${resultReview.image}`,
      created_dt: resultReview.created_dt,
      updated_dt: resultReview.updated_dt,
    };
    result.push(info);
    // }
  }

  res.status(200).send({ data: result });
};

const deleteUserSavedReview = async (req, res) => {
  const { userId } = req.session;
  const { reviewId } = req.body;

  const result = await User.deleteUserSavedReview(userId, reviewId);

  if (result.err) {
    console.log(result.err);
    res.status(500).json({ error: 'cannot delete' });
    return;
  }
  res.status(200).json({ message: 'deleted' });
};

// Saved Movies CRD
const updateUserSavedMovie = async (req, res) => {
  const { userId } = req.session;
  const { movieId } = req.body;

  const result = await User.updateUserSavedMovie(userId, movieId);
  if (result.err) {
    console.log(result.err);
    res.status(500).json({ error: result.err });
    return;
  }
  res.status(200).json({
    data: result,
  });
};

const getUserSavedMovie = async (req, res) => {
  const { userId } = req.session;
  const { locale } = req.query;
  const resultSavedMovie = await User.getUserSavedMovie(userId);
  const result = [];

  for (const movie of resultSavedMovie) {
    const resultMovie = await User.getMovieInfo(movie.movie_id, locale);
    // for (j in resultMovie) {
    const info = {
      movie_id: resultMovie.id,
      title: resultMovie.title,
      poster: `${SERVER_IP}/public/assets/images/posters/${resultMovie.poster_image}`,
    };
    result.push(info);
    // }
  }

  res.status(200).send({ data: result });
};

const deleteUserSavedMovie = async (req, res) => {
  const { userId } = req.session;
  const { movieId } = req.body;

  const result = await User.deleteUserSavedMovie(userId, movieId);

  if (result.err) {
    console.log(result.err);
    res.status(500).json({ error: 'cannot delete' });
    return;
  }
  res.status(200).json({ message: 'deleted' });
};

// Movie rating
const createMovieRating = async (req, res) => {
  const { userId } = req.session;
  const { movieId, score } = req.body;

  const result = await User.createMovieRating(userId, movieId, score);
  if (result.err) {
    console.log(result.err);
    res.status(500).json({ error: 'cannot submit' });
    return;
  }
  res.status(200).json({ message: 'submitted' });
};

// Review ranking

// Comment ranking

// TODO: submit review api from frontend
const getMovieInfoForReview = async (req, res) => {
  const { locale } = req.query;

  res.status(200).send({
    data: {
      locale,
      locale_string: JSON.stringify(locale),
      lang: lang[locale],
    },
  });
};

module.exports = {
  signUp,
  signIn,
  logout,
  getUserDetail,
  updateUserImage,
  createUserReview,
  getUserReview,
  updateUserReview,
  deleteUserReview,
  createUserComment,
  getUserComment,
  updateUserComment,
  deleteUserComment,
  updateUserSavedReview,
  getUserSavedReview,
  deleteUserSavedReview,
  updateUserSavedMovie,
  getUserSavedMovie,
  deleteUserSavedMovie,
  createMovieRating,
  getMovieInfoForReview,
};
