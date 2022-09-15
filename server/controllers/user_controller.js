require('dotenv').config();
const validator = require('validator');
const bcrypt = require('bcrypt');

const { TOKEN_EXPIRE, TOKEN_SECRET, SERVER_IP } = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');
const User = require('../models/user_model');
const Movie = require('../models/movie_model');
const router = require('../routes/crawler_route');

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
  for (i in resultUsername) {
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
  const user = await User.GetUser(email);

  if (user.error) {
    return res.status(400).send("This email hasn't been registered");
  }
  // console.log(user.user.password);
  if (!bcrypt.compareSync(password, user.user.password)) {
    console.log({ email, error: 'Password is wrong' });
    return res.status(400).send('Email or password is wrong');
  }

  const result = {};
  const accessToken = await generateJWT(user.user);
  result.access_token = accessToken;
  result.user = user.user;
  res.status(201).send({
    response: result,
  });
  // const result = await validateUser(email, password);
};

const getUserDetail = async (req, res) => {
  res.status(200).send({
    data: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      picture: `${SERVER_IP}/public/assets/images/uploads/${req.user.picture}`,
    },
  });
};

const updateUserImage = async (req, res) => {
  const { id } = req.user;
  const image = req.files.image[0].filename;

  const result = await User.updateUserImage(id, image);

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
  const { id } = req.user;
  const { movie_id, content } = req.body;
  let image;
  if (req.files.image) {
    image = req.files.image[0].filename;
  } else {
    image = null;
  }

  // image handler
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
  const { locale } = req.query;

  const resultReview = await User.getUserReview(id);

  const info = [];
  for (i in resultReview) {
    const resultMovie = await Movie.getMovieInfo(resultReview[i].movie_id, locale);

    const result = {
      id: resultReview[i].id,
      content: resultReview[i].content,
      image: `${SERVER_IP}/public/assets/images/uploads/${resultReview[i].image}`,
      image_blurred: resultReview[i].image_blurred,
      user_id: resultReview[i].user_id,
      created_dt: resultReview[i].created_dt,
      updated_dt: resultReview[i].updated_dt,
      movie_id: resultMovie.id,
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

  const resultSavedReview = await User.getUserSavedReview(id);
  const result = [];

  for (i in resultSavedReview) {
    const resultReview = await User.getReviewInfo(resultSavedReview[i].review_id);
    for (j in resultReview) {
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
  const { locale } = req.query;
  const resultSavedMovie = await User.getUserSavedMovie(id);
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
const createMovieRating = async (req, res) => {
  const { id } = req.user;
  const { movie_id, score } = req.body;

  const result = await User.createMovieRating(id, movie_id, score);
  if (result.err) {
    console.log(result.err);
    res.status(500).send({ err: 'cannot submit' });
    return;
  }
  res.status(200).send({ result: 'submitted' });
};

// Review ranking

// Comment ranking

const getAllReviews = async (req, res) => {
  const { locale } = req.query;

  const resultReview = await User.getAllReviews();

  const info = [];
  for (i in resultReview) {
    const resultMovie = await Movie.getMovieInfo(resultReview[i].movie_id, locale);
    const resultAccount = await User.getUserById(resultReview[i].user_id);

    const result = {
      user_id: resultAccount.id,
      username: resultAccount.username,
      profile_image: resultAccount.profile_image,
      review_id: resultReview[i].id,
      content: resultReview[i].content,
      image: `${SERVER_IP}/public/assets/images/uploads/${resultReview[i].image}`,
      image_blurred: resultReview[i].image_blurred,
      user_id: resultReview[i].user_id,
      created_dt: resultReview[i].created_dt,
      updated_dt: resultReview[i].updated_dt,
      movie_id: resultMovie.id,
      title: resultMovie.title,
      poster: `${SERVER_IP}/public/assets/images/posters/${resultMovie.poster_image}`,
    };

    info.push(result);
  }

  const response = {
    data: info,
  };
  // res.status(200).send(response);
  res.render('review_all', { data: info });
};

const getReviewById = async (req, res) => {
  const { id, locale } = req.query;

  const resultReview = await User.getReviewById(id);

  const info = [];
  for (i in resultReview) {
    const resultMovie = await Movie.getMovieInfo(resultReview[i].movie_id, locale);
    const resultAccount = await User.getUserById(resultReview[i].user_id);

    const result = {
      user_id: resultAccount.id,
      username: resultAccount.username,
      profile_image: resultAccount.profile_image,
      review_id: resultReview[i].id,
      content: resultReview[i].content,
      image: `${SERVER_IP}/public/assets/images/uploads/${resultReview[i].image}`,
      image_blurred: resultReview[i].image_blurred,
      user_id: resultReview[i].user_id,
      created_dt: resultReview[i].created_dt,
      updated_dt: resultReview[i].updated_dt,
      movie_id: resultMovie.id,
      title: resultMovie.title,
      poster: `${SERVER_IP}/public/assets/images/posters/${resultMovie.poster_image}`,
    };

    info.push(result);
  }

  const response = {
    data: info,
  };
  // res.status(200).send(response);
  res.render('review', { data: info });
};

// const showReview = async (req, res) => {
//   const { id } = req.user;
//   const result = await User.getUserReview(id);
//   // const result = await Movie.getMovieData();
//   res.render('review_account', { title: '123', data: result[0] });
// };

module.exports = {
  signUp,
  signIn,
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
  saveUserReview,
  getUserSavedReview,
  deleteUserSavedReview,
  saveUserMovie,
  getUserSavedMovie,
  deleteUserSavedMovie,
  createMovieRating,
  getAllReviews,
  getReviewById,
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
