const { pool } = require('./mysqlcon');

const getMovieData = async () => {
  const queryMovie = `SELECT m.id, m.poster_image, t.title, t.trailer FROM movie AS m LEFT JOIN movie_translation AS t ON m.id = t.movie_id WHERE locale = 'en-US'`;
  try {
    const movieResult = await pool.execute(queryMovie);
    return movieResult;
  } catch (err) {
    console.log(err);
  }
};

const getMovieDetails = async (movieId) => {
  const queryDetails = `SELECT m.id, m.original_title, m.release_date, m.runtime, m.genre_id, m.poster_image, t.title, t.overview, t.trailer FROM movie AS m  LEFT JOIN movie_translation AS t ON m.id = t.movie_id WHERE locale = 'en-US'  AND m.id = ${movieId}`;
  try {
    const DetailResult = await pool.execute(queryDetails);
    return DetailResult;
  } catch (err) {
    console.log(err);
  }
};

module.exports = { getMovieData, getMovieDetails };
