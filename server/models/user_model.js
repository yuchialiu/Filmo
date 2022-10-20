/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('./mysqlcon');

const salt = parseInt(process.env.BCRYPT_SALT);

const USER_ROLE = {
  ADMIN: 1,
  USER: 2,
};

const createUser = async (username, role, email, password) => {
  try {
    const user = {
      username,
      role,
      email: email.toLowerCase(),
      password: bcrypt.hashSync(password, salt),
      picture: null,
    };

    const sql =
      'INSERT INTO `user` (username, email, password, profile_image, role) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.execute(sql, [
      user.username,
      user.email,
      user.password,
      user.picture,
      user.role,
    ]);
    user.id = result.insertId;

    return { user };
  } catch (err) {
    console.log(err);
    return {
      error: err,
      status: 403,
    };
  }
};

const validateEmail = async (email) => {
  try {
    const [result] = await pool.execute(
      'SELECT * FROM `user` WHERE email = ?',
      [email]
    );
    if (!result.length) {
      return { error: 'email has not registered' };
    }
    return result;
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const validateUsername = async (username) => {
  const [result] = await pool.execute(
    'SELECT * FROM `user` WHERE username = ?',
    [username]
  );
  return result;
};

const getUserDetail = async (email, role) => {
  try {
    if (role) {
      const [users] = await pool.execute(
        'SELECT * FROM user WHERE email = ? AND role_id = ?',
        [email, role]
      );
      return users[0];
    }
    const [users] = await pool.execute('SELECT * FROM user WHERE email = ?', [
      email,
    ]);
    return users[0];
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const updateUserImage = async (id, image) => {
  try {
    const result = await pool.execute(
      'UPDATE `user` SET profile_image = ? WHERE id = ?',
      [image, id]
    );
    return result;
  } catch (err) {
    console.log(err);
    return { err };
  }
};

// Reviews CRUD
const createUserReview = async (userId, movieId, title, content, image) => {
  try {
    const [result] = await pool.execute(
      'INSERT INTO review (user_id, movie_id, title, content, image) VALUES (?, ?, ?, ?, ?)',
      [userId, movieId, title, content, image]
    );
    return result.insertId;
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const getUserReview = async (userId) => {
  try {
    const [result] = await pool.execute(
      'SELECT * FROM review WHERE user_id = (?) ORDER BY created_dt DESC',
      [userId]
    );
    return result;
  } catch (err) {
    console.log(err);
    return { err };
  }
};

async function validateUserReview(reviewId) {
  const [result] = await pool.execute('SELECT * FROM review WHERE id = (?)', [
    reviewId,
  ]);
  return result[0];
}

const updateUserReview = async (userId, reviewId, title, content, image) => {
  try {
    const validation = await validateUserReview(reviewId);
    if (validation.user_id !== userId) {
      const err = new Error('review belongs to other user');
      throw err;
    } else {
      const [result] = await pool.execute(
        'UPDATE review SET title = ?, content = ?, image = ? WHERE id = ?',
        [title, content, image, reviewId]
      );
      return result.insertId;
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
      const [result] = await pool.execute('DELETE FROM review WHERE id = (?)', [
        reviewId,
      ]);
      return result.insertId;
    }
  } catch (err) {
    console.log(err);
    return { err };
  }
};

// Comment CRUD

const createUserComment = async (userId, reviewId, content) => {
  try {
    const [result] = await pool.execute(
      'INSERT INTO comment (user_id, review_id, content) VALUES (?, ?, ?)',
      [userId, reviewId, content]
    );
    return result.insertId;
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const getUserComment = async (userId) => {
  try {
    const [result] = await pool.execute(
      'SELECT * FROM comment WHERE user_id = (?)',
      [userId]
    );
    return result;
  } catch (err) {
    console.log(err);
    return { err };
  }
};

async function validateUserComment(commentId) {
  const [result] = await pool.execute('SELECT * FROM comment WHERE id = (?)', [
    commentId,
  ]);
  return result[0];
}

const updateUserComment = async (userId, commentId, content) => {
  try {
    const validation = await validateUserComment(commentId);
    if (validation.user_id !== userId) {
      const err = new Error('comment belongs to other user');
      throw err;
    } else {
      const [result] = await pool.execute(
        'UPDATE comment SET content = (?) WHERE id = (?)',
        [content, commentId]
      );
      return result.insertId;
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
      const [result] = await pool.execute(
        'DELETE FROM comment WHERE id = (?)',
        [commentId]
      );
      return result.insertId;
    }
  } catch (err) {
    console.log(err);
    return { err };
  }
};

// Saved Reviews CRD
const updateUserSavedReview = async (userId, reviewId) => {
  try {
    const [resultSavedReview] = await pool.execute(
      'SELECT * FROM saved_review AS ms WHERE user_id = (?) AND review_id = (?)',
      [userId, reviewId]
    );
    if (resultSavedReview.length) {
      await pool.execute(
        'DELETE FROM saved_review WHERE user_id = (?) AND review_id = (?)',
        [userId, reviewId]
      );
      return 'deleted';
    }
    await pool.execute(
      'INSERT INTO saved_review (user_id, review_id) VALUES (?, ?)',
      [userId, reviewId]
    );
    return 'saved';
  } catch (err) {
    console.log(err);
    return err;
  }
};

const getReviewInfo = async (reviewId) => {
  try {
    const [result] = await pool.execute('SELECT * FROM review WHERE id = (?)', [
      reviewId,
    ]);
    return result;
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const checkUserSavedReview = async (userId, reviewId) => {
  try {
    const [result] = await pool.execute(
      'SELECT * FROM saved_review WHERE user_id = (?) AND review_id = (?)',
      [userId, reviewId]
    );
    if (result.length) {
      return true;
    }
    return false;
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const getUserSavedReview = async (userId) => {
  try {
    const [result] = await pool.execute(
      'SELECT * FROM saved_review WHERE user_id = (?)',
      [userId]
    );
    return result;
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const deleteUserSavedReview = async (userId, reviewId) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM saved_review WHERE user_id = (?) AND review_id = (?)',
      [userId, reviewId]
    );
    return result;
  } catch (err) {
    console.log(err);
    return { err };
  }
};

// Saved Movies CRD
const updateUserSavedMovie = async (userId, movieId) => {
  try {
    const [result] = await pool.execute(
      'SELECT * FROM saved_movie AS ms WHERE user_id = (?) AND movie_id = (?)',
      [userId, movieId]
    );
    if (result.length) {
      await pool.execute(
        'DELETE FROM saved_movie WHERE user_id = (?) AND movie_id = (?)',
        [userId, movieId]
      );
      return 'deleted';
    }
    await pool.execute(
      'INSERT INTO saved_movie (user_id, movie_id) VALUES (?, ?)',
      [userId, movieId]
    );
    return 'saved';
  } catch (err) {
    console.log(err);
    return err;
  }
};

const getMovieInfo = async (movieId, locale) => {
  const queryDetails = `SELECT * FROM movie AS m LEFT JOIN movie_translation AS t ON m.id = t.movie_id WHERE t.locale = \'${locale}\' AND m.id = ${movieId}`;
  try {
    const [DetailResult] = await pool.execute(queryDetails);
    return DetailResult;
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const checkUserSavedMovie = async (userId, movieId) => {
  try {
    const [result] = await pool.execute(
      'SELECT * FROM saved_movie WHERE user_id = (?) AND movie_id = (?)',
      [userId, movieId]
    );
    if (result.length) {
      return true;
    }
    return false;
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const getUserSavedMovie = async (userId) => {
  try {
    const [result] = await pool.execute(
      'SELECT * FROM saved_movie WHERE user_id = (?)',
      [userId]
    );
    return result;
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const deleteUserSavedMovie = async (userId, movieId) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM saved_movie WHERE user_id = (?) AND movie_id = (?)',
      [userId, movieId]
    );
    return result;
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const createMovieRating = async (userId, movieId, score) => {
  try {
    const [result] = await pool.execute(
      'INSERT INTO movie_rating (user_id, movie_id, score) VALUES (?, ?, ?)',
      [userId, movieId, score]
    );
    return result;
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const getAllReviews = async () => {
  try {
    const [result] = await pool.execute(
      'SELECT * FROM review ORDER BY created_dt DESC'
    );
    return result;
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const getReviewById = async (reviewId) => {
  try {
    const [result] = await pool.execute('SELECT * FROM review WHERE id = (?)', [
      reviewId,
    ]);
    return result;
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const getReviewByMovieId = async (movieId) => {
  try {
    const [result] = await pool.execute(
      'SELECT * FROM review WHERE movie_id = (?) ORDER BY created_dt DESC',
      [movieId]
    );
    return result;
  } catch (err) {
    console.log(err);
    return { err };
  }
};

const getUserById = async (userId) => {
  try {
    const [result] = await pool.execute('SELECT * FROM user WHERE id = (?)', [
      userId,
    ]);
    return result[0];
  } catch (err) {
    console.log(err);
    return { err };
  }
};

module.exports = {
  USER_ROLE,
  createUser,
  validateUsername,
  validateEmail,
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
  checkUserSavedReview,
  getUserSavedReview,
  getReviewInfo,
  deleteUserSavedReview,
  updateUserSavedMovie,
  checkUserSavedMovie,
  getMovieInfo,
  getUserSavedMovie,
  deleteUserSavedMovie,
  createMovieRating,
  getAllReviews,
  getReviewById,
  getReviewByMovieId,
  getUserById,
};
