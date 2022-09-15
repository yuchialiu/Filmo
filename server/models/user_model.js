require('dotenv').config();
const { pool } = require('./mysqlcon');
const bcrypt = require('bcrypt');

const salt = parseInt(process.env.BCRYPT_SALT);
const { TOKEN_EXPIRE, TOKEN_SECRET } = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');

const USER_ROLE = {
  ADMIN: 1,
  USER: 2,
};

const CreateUser = async (username, role, email, password) => {
  try {
    const user = {
      username,
      role,
      email: email.toLowerCase(),
      password: bcrypt.hashSync(password, salt),
      picture: null,
      access_expired: TOKEN_EXPIRE,
    };

    const sql = 'INSERT INTO `user` (username, email, password, profile_image, role) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.execute(sql, [user.username, user.email, user.password, user.picture, user.role]);
    user.id = result.insertId;

    const accessToken = jwt.sign(
      {
        username: user.username,
        email: user.email,
        role: user.role,
      },
      TOKEN_SECRET
    );

    user.access_token = accessToken;

    return { user };
  } catch (err) {
    console.log(err);
    return {
      error: err,
      status: 403,
    };
  }
};

const ValidateUsername = async () => {
  const result = await pool.execute('SELECT * FROM `user`');
  return result[0];
};

const GetUser = async (email) => {
  try {
    const [users] = await pool.execute('SELECT * FROM `user` WHERE email = ?', [email]);
    if (!users[0]) {
      return { error: 'email has not registered' };
    }
    const user = users[0];
    return { user };
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const getUserDetail = async (email, role) => {
  try {
    if (role) {
      const [users] = await pool.execute('SELECT * FROM user WHERE email = ? AND role_id = ?', [email, roleId]);
      return users[0];
    }
    const [users] = await pool.execute('SELECT * FROM user WHERE email = ?', [email]);
    return users[0];
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const updateUserImage = async (id, image) => {
  try {
    const result = await pool.execute('UPDATE `user` SET profile_image = ? WHERE id = ?', [image, id]);
    return result;
  } catch (err) {
    console.log(err);
  }
};

// Reviews CRUD
const createUserReview = async (userId, movieId, content, image) => {
  try {
    const result = await pool.execute('INSERT INTO review (user_id, movie_id, content, image) VALUES (?, ?, ?, ?)', [userId, movieId, content, image]);
    return result[0].insertId;
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const getUserReview = async (userId) => {
  try {
    const result = await pool.execute('SELECT * FROM review WHERE user_id = (?)', [userId]);
    return result[0];
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const updateUserReview = async (userId, reviewId, content) => {
  try {
    const validation = await validateUserReview(reviewId);
    if (validation.user_id !== userId) {
      const err = new Error('review belongs to other user');
      throw err;
    } else {
      const result = await pool.execute('UPDATE review SET content = (?) WHERE id = (?)', [content, reviewId]);
      return result[0].insertId;
    }
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const deleteUserReview = async (userId, reviewId) => {
  try {
    const validation = await validateUserReview(reviewId);
    if (validation.user_id !== userId) {
      const err = new Error('review belongs to other user');
      throw err;
    } else {
      const result = await pool.execute('DELETE FROM review WHERE id = (?)', [reviewId]);
      return result[0].insertId;
    }
  } catch (err) {
    console.log(err);
    return { err };
  }
};

// Comment CRUD

const createUserComment = async (userId, reviewId, content) => {
  try {
    const result = await pool.execute('INSERT INTO comment (user_id, review_id, content) VALUES (?, ?, ?)', [userId, reviewId, content]);
    return result[0].insertId;
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const getUserComment = async (userId) => {
  try {
    const result = await pool.execute('SELECT * FROM comment WHERE user_id = (?)', [userId]);
    return result[0];
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const updateUserComment = async (userId, commentId, content) => {
  try {
    const validation = await validateUserComment(commentId);
    if (validation.user_id !== userId) {
      const err = new Error('comment belongs to other user');
      throw err;
    } else {
      const result = await pool.execute('UPDATE comment SET content = (?) WHERE id = (?)', [content, commentId]);
      return result[0].insertId;
    }
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const deleteUserComment = async (userId, commentId) => {
  try {
    const validation = await validateUserComment(commentId);
    if (validation.user_id !== userId) {
      const err = new Error('comment belongs to other user');
      throw err;
    } else {
      const result = await pool.execute('DELETE FROM comment WHERE id = (?)', [commentId]);
      return result[0].insertId;
    }
  } catch (err) {
    console.log(err);
    return { err };
  }
};

// Saved Reviews CRD
const saveUserReview = async (userId, reviewId) => {
  try {
    await pool.execute('INSERT INTO saved_review (user_id, review_id) VALUES (?, ?)', [userId, reviewId]);
    return { userId, reviewId };
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const getUserSavedReview = async (userId) => {
  try {
    const result = await pool.execute('SELECT * FROM saved_review WHERE user_id = (?)', [userId]);
    return result[0];
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const getReviewInfo = async (reviewId) => {
  try {
    const result = await pool.execute('SELECT * FROM review WHERE id = (?)', [reviewId]);
    return result[0];
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const deleteUserSavedReview = async (userId, reviewId) => {
  try {
    const result = await pool.execute('DELETE FROM saved_review WHERE user_id = (?) AND review_id = (?)', [userId, reviewId]);
    return result[0];
  } catch (err) {
    console.log(err);
    return { err };
  }
};

// Saved Movies CRD
const saveUserMovie = async (userId, movieId) => {
  try {
    await pool.execute('INSERT INTO saved_movie (user_id, movie_id) VALUES (?, ?)', [userId, movieId]);
    return { userId, movieId };
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const getMovieInfo = async (movieId, locale) => {
  const queryDetails = `SELECT * FROM movie AS m LEFT JOIN movie_translation AS t ON m.id = t.movie_id WHERE t.locale = \'${locale}\' AND m.id = ${movieId}`;
  try {
    const DetailResult = await pool.execute(queryDetails);
    return DetailResult[0];
  } catch (err) {
    console.log(err);
  }
};

const getUserSavedMovie = async (userId) => {
  try {
    const result = await pool.execute('SELECT * FROM saved_movie WHERE user_id = (?)', [userId]);
    return result[0];
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const deleteUserSavedMovie = async (userId, movieId) => {
  try {
    const result = await pool.execute('DELETE FROM saved_movie WHERE user_id = (?) AND movie_id = (?)', [userId, movieId]);
    return result[0];
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const createMovieRating = async (userId, movieId, score) => {
  try {
    const result = await pool.execute('INSERT INTO movie_rating (user_id, movie_id, score) VALUES (?, ?, ?)', [userId, movieId, score]);
    return result[0];
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const getAllReviews = async () => {
  try {
    const result = await pool.execute('SELECT * FROM review');
    return result[0];
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const getReviewById = async (reviewId) => {
  try {
    const result = await pool.execute('SELECT * FROM review WHERE id = (?)', [reviewId]);
    return result[0];
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const getUserById = async (userId) => {
  try {
    const result = await pool.execute('SELECT * FROM user WHERE id = (?)', [userId]);
    return result[0][0];
  } catch (err) {
    console.log(err);
    return { err };
  }
};

module.exports = {
  USER_ROLE,
  CreateUser,
  ValidateUsername,
  GetUser,
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
  getReviewInfo,
  deleteUserSavedReview,
  saveUserMovie,
  getMovieInfo,
  getUserSavedMovie,
  deleteUserSavedMovie,
  createMovieRating,
  getAllReviews,
  getReviewById,
  getUserById,
};

async function validateUserReview(reviewId) {
  const result = await pool.execute('SELECT * FROM review WHERE id = (?)', [reviewId]);
  return result[0][0];
}

async function validateUserComment(commentId) {
  const result = await pool.execute('SELECT * FROM comment WHERE id = (?)', [commentId]);
  return result[0][0];
}
