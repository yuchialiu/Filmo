const { pool } = require('./mysqlcon');

const getReviewByMovieId = async (movieId) => {
  try {
    const result = await pool.execute('SELECT * FROM review WHERE movie_id = (?)', [movieId]);
    return result[0];
  } catch (err) {
    console.log(err);
    return { err };
  }
};

module.exports = { getReviewByMovieId };
