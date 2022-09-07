const { pool } = require('./mysqlcon');

const getMovieListInfo = async (locale, limit) => {
  const queryDetails = `SELECT * FROM movie AS m 
   LEFT JOIN movie_translation AS t 
   ON m.id = t.movie_id 
   WHERE locale = ${locale}
   LIMIT ${limit}`;
  try {
    const DetailResult = await pool.execute(queryDetails);
    return DetailResult;
  } catch (err) {
    console.log(err);
  }
};

const getMovieInfo = async (movieId, locale) => {
  const queryDetails = `SELECT * FROM movie AS m 
   LEFT JOIN movie_translation AS t 
   ON m.id = t.movie_id 
   WHERE locale = ${locale} AND m.id = ${movieId}`;
  try {
    const DetailResult = await pool.execute(queryDetails);
    return DetailResult;
  } catch (err) {
    console.log(err);
  }
};

const getCastInfoByMovieId = async (movieId) => {
  const queryDetails = ``;
  try {
    const DetailResult = await pool.execute(queryDetails);
    return DetailResult;
  } catch (err) {
    console.log(err);
  }
};

const getCrewInfoByMovieId = async (movieId) => {
  const queryDetails = ``;
  try {
    const DetailResult = await pool.execute(queryDetails);
    return DetailResult;
  } catch (err) {
    console.log(err);
  }
};

const getPersonDetail = async (personId, locale) => {};

const getMovieListByFilter = async (title, genre_id, locale) => {
  let queryDetails = `SELECT * FROM movie AS m 
  LEFT JOIN movie_translation AS t 
  ON m.id = t.movie_id 
  WHERE locale = ${locale}`;
  if (title != '') {
    queryDetails += ` AND title LIKE %${title}%`;
  }
  if (genre_id > 0) {
    queryDetails += ` AND genre_id = ${genre_id}`;
  }

  try {
    const DetailResult = await pool.execute(queryDetails);
    return DetailResult;
  } catch (err) {
    console.log(err);
  }
};

module.exports = { getMovieListInfo, getMovieInfo, getCastInfoByMovieId, getCrewInfoByMovieId, getPersonDetail, getMovieListByFilter };
