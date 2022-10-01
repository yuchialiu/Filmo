/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
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
    res.status(400).send('name, email and password are required');
    return;
  }

  if (!validator.isEmail(email)) {
    res.status(400).send('Invalid email format');
    return;
  }

  username = validator.escape(username);

  const resultEmail = await User.GetUser(email);
  if (resultEmail.user) {
    if (resultEmail.user.email === email) {
      return res.status(400).send('email existed');
    }
  }

  const resultUsername = await User.ValidateUsername();
  for (const i in resultUsername) {
    if (resultUsername[i].username === username) {
      return res.status(400).send('username existed');
    }
  }

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

  req.session.userId = user.id;
  req.session.userName = user.username;
  req.session.userEmail = user.email;
  req.session.picture = user.picture;
  req.session.isAuth = true;

  res.status(201).send({
    data: {
      // access_token: user.access_token,
      // access_expired: user.access_expired,
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
  const user = await User.GetUser(email);

  if (user.error) {
    return res.status(400).send("This email hasn't been registered");
  }

  const isAuth = await bcrypt.compare(password, user.password);
  // console.log(user.user.password);
  if (!isAuth) {
    console.log({ email, error: 'Password is wrong' });
    return res.status(400).send('Email or password is wrong');
  }
  // const result = user;
  // const result = {};
  // const accessToken = await generateJWT(user.user);
  // result.access_token = accessToken;
  // result.user = user.user;
  req.session.userId = user.id;
  req.session.userName = user.username;
  req.session.userEmail = user.email;
  // TODO:need to check route
  req.session.picture = `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${user.profile_image}`;
  req.session.isAuth = true;

  return res.status(201).send({
    response: user,
  });
  // const result = await validateUser(email, password);
};

const logout = async (req, res) => {
  req.session.isAuth = false;
  res.status(200).send('logout');
};

const getUserDetail = async (req, res) => {
  res.status(200).send({
    data: {
      user_id: req.session.userId,
      username: req.session.userName,
      user_email: req.session.userEmail,
      user_picture: req.session.picture,
      // id: req.user.id,
      // username: req.user.username,
      // email: req.user.email,
      // picture: `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${req.user.picture}`,
    },
  });
};

const updateUserImage = async (req, res) => {
  const { userId } = req.session;
  if (req.files.image === undefined) {
    return res.status(400).send('did not choose file');
  }
  // const image = req.files.image[0].key;
  const image = req.filename;

  const result = await User.updateUserImage(userId, image);
  req.session.picture = `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${image}`;

  if (result.err) {
    console.log(result.err);
    res.status(500).send({ err: 'cannot update image ' });
  } else {
    res.status(200).send({
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
    res.status(500).send({ err: 'cannot add comment' });
  } else {
    res.status(200).send({
      review_id: result,
    });
  }
};

const getUserReview = async (req, res) => {
  const { userId } = req.session;
  const { locale } = req.query;

  const resultReview = await User.getUserReview(userId);

  const info = [];
  for (const i in resultReview) {
    const resultMovie = await Movie.getMovieInfo(resultReview[i].movie_id, locale);

    const result = {
      id: resultReview[i].id,
      review_title: resultReview[i].title,
      content: resultReview[i].content,
      image: `${SERVER_IP}/public/assets/images/uploads/${resultReview[i].image}`,
      image_blurred: resultReview[i].image_blurred,
      user_id: resultReview[i].user_id,
      created_dt: resultReview[i].created_dt,
      updated_dt: resultReview[i].updated_dt,
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
  const { userId } = req.session;
  const { review_id } = req.body;

  const result = await User.deleteUserReview(userId, review_id);
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
  const { userId } = req.session;
  const { review_id, content } = req.body;

  const result = await User.createUserComment(userId, review_id, content);
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
  const { userId } = req.session;

  const result = await User.getUserComment(userId);
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
  const { userId } = req.session;
  const { comment_id, content } = req.body;

  const result = await User.updateUserComment(userId, comment_id, content);
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
  const { userId } = req.session;
  const { comment_id } = req.body;

  const result = await User.deleteUserComment(userId, comment_id);
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
const updateUserSavedReview = async (req, res) => {
  const { userId } = req.session;
  const { review_id } = req.body;

  const result = await User.updateUserSavedReview(userId, review_id);
  if (result.err) {
    console.log(result.err);
    res.status(500).send(result.err);
    return;
  }
  res.status(200).send({
    data: result,
  });
};
// const saveUserReview = async (req, res) => {
//   const { userId } = req.session;
//   const { review_id } = req.body;

//   const result = await User.saveUserReview(userId, review_id);
//   if (result.err) {
//     console.log(result.err);
//     res.status(500).send({ err: 'review saved or review not existed' });
//   } else {
//     res.status(200).send({
//       data: {
//         user_id: result.userId,
//         review_id: result.reviewId,
//       },
//     });
//   }
// };

const getUserSavedReview = async (req, res) => {
  const { userId } = req.session;

  const resultSavedReview = await User.getUserSavedReview(userId);
  const result = [];

  for (const i in resultSavedReview) {
    const resultReview = await User.getReviewInfo(resultSavedReview[i].review_id);
    for (const j in resultReview) {
      const info = {
        review_id: resultReview[j].id,
        content: resultReview[j].content,
        image: `${SERVER_IP}/public/assets/images/uploads/${resultReview[j].image}`,
        created_dt: resultReview[j].created_dt,
        updated_dt: resultReview[j].updated_dt,
      };
      result.push(info);
    }
  }

  res.status(200).send({ data: result });
};

const deleteUserSavedReview = async (req, res) => {
  const { userId } = req.session;
  const { review_id } = req.body;

  const result = await User.deleteUserSavedReview(userId, review_id);

  if (result.err) {
    console.log(result.err);
    res.status(500).send({ err: 'cannot delete' });
    return;
  }
  res.status(200).send({ result: 'deleted' });
};

// Saved Movies CRD
const updateUserSavedMovie = async (req, res) => {
  const { userId } = req.session;
  const { movie_id } = req.body;

  const result = await User.updateUserSavedMovie(userId, movie_id);
  if (result.err) {
    console.log(result.err);
    res.status(500).send(result.err);
    return;
  }
  res.status(200).send({
    data: result,
  });
};

// const saveUserMovie = async (req, res) => {
//   const { userId } = req.session;
//   const { movie_id } = req.body;

//   const result = await User.saveUserMovie(userId, movie_id);
//   if (result.err) {
//     console.log(result.err);
//     res.status(500).send({ err: 'movie saved or not existed' });
//     return;
//   }
//   res.status(200).send({
//     data: {
//       user_id: result.userId,
//       movie_id: result.movieId,
//     },
//   });
// };

const getUserSavedMovie = async (req, res) => {
  const { userId } = req.session;
  const { locale } = req.query;
  const resultSavedMovie = await User.getUserSavedMovie(userId);
  const result = [];

  for (i in resultSavedMovie) {
    const resultMovie = await User.getMovieInfo(resultSavedMovie[i].movie_id, locale);
    for (j in resultMovie) {
      const info = {
        movie_id: resultMovie[j].id,
        title: resultMovie[j].title,
        poster: `${SERVER_IP}/public/assets/images/posters/${resultMovie[j].poster_image}`,
      };
      result.push(info);
    }
  }

  res.status(200).send({ data: result });
};

const deleteUserSavedMovie = async (req, res) => {
  const { userId } = req.session;
  const { movie_id } = req.body;

  const result = await User.deleteUserSavedMovie(userId, movie_id);

  if (result.err) {
    console.log(result.err);
    res.status(500).send({ err: 'cannot delete' });
    return;
  }
  res.status(200).send({ result: 'deleted' });
};

// Movie rating
const createMovieRating = async (req, res) => {
  const { userId } = req.session;
  const { movie_id, score } = req.body;

  const result = await User.createMovieRating(userId, movie_id, score);
  if (result.err) {
    console.log(result.err);
    res.status(500).send({ err: 'cannot submit' });
    return;
  }
  res.status(200).send({ result: 'submitted' });
};

// Review ranking

// Comment ranking

// submit review
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
  // saveUserReview,
  getUserSavedReview,
  deleteUserSavedReview,
  updateUserSavedMovie,
  // saveUserMovie,
  getUserSavedMovie,
  deleteUserSavedMovie,
  createMovieRating,
  getMovieInfoForReview,
};

// async function validateUser(email, password) {
//   const user = await User.GetUser(email);

//   if (user.length == 0) {
//     res.status(400).send("This email hasn't been registered");
//     return;
//   }
//   // console.log(user.user.password);
//   if (!bcrypt.compareSync(password, user.user.password)) {
//     console.log({ email, error: 'Password is wrong' });
//     return { error: 'Email or password is wrong' };
//   }

//   const result = {};
//   const accessToken = await generateJWT(user.user);
//   result.access_token = accessToken;
//   result.user = user.user;
//   return result;
// }

// function generateJWT(user) {
//   const accessToken = jwt.sign(
//     {
//       username: user.username,
//       id: user.id,
//       role: user.role,
//       email: user.email,
//       picture: user.profile_image,
//     },
//     TOKEN_SECRET,
//     { expiresIn: TOKEN_EXPIRE }
//   );

//   return accessToken;
// }
