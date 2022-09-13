const { pool } = require('./mysqlcon');

const getMovieListInfo = async (locale, limit) => {
  const queryDetails = `SELECT * FROM movie AS m LEFT JOIN movie_translation AS t ON m.id = t.movie_id WHERE locale = \'${locale}\' LIMIT ${limit}`;
  try {
    const DetailResult = await pool.execute(queryDetails);
    return DetailResult[0];
  } catch (err) {
    console.log(err);
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

const getCastInfoByMovieId = async (movieId, locale) => {
  const queryDetails = `SELECT * FROM cast AS c LEFT JOIN person_translation AS pt ON c.person_id = pt.person_id LEFT JOIN cast_translation AS ct ON c.id = ct.cast_id WHERE movie_id = ${movieId} AND pt.locale = \'${locale}\'`;
  try {
    const DetailResult = await pool.execute(queryDetails);
    return DetailResult[0];
  } catch (err) {
    console.log(err);
  }
};

const getCrewInfoByMovieId = async (movieId, locale) => {
  const queryDetails = `SELECT * FROM crew AS c LEFT JOIN person_translation AS pt ON c.person_id = pt.person_id LEFT JOIN crew_translation AS ct ON c.id = ct.crew_id WHERE movie_id = ${movieId} AND pt.locale = \'${locale}\'`;
  try {
    const DetailResult = await pool.execute(queryDetails);
    return DetailResult[0];
  } catch (err) {
    console.log(err);
  }
};

const getPersonDetail = async (personId, locale) => {
  const queryDetails = `SELECT * FROM person AS p LEFT JOIN person_translation AS pt ON p.id = pt.person_id WHERE p.id = ${personId} AND locale = ${locale}`;
  try {
    const DetailResult = await pool.execute(queryDetails);
    return DetailResult;
  } catch (err) {
    console.log(err);
  }
};

const getMovieListByFilter = async (title, genre_id, locale) => {
  let queryDetails = `SELECT * FROM movie AS m LEFT JOIN movie_translation AS t ON m.id = t.movie_id WHERE locale = ${locale}`;
  if (title !== '') {
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

const getGenre = async (genreId, locale) => {
  try {
    const genreResult = await pool.execute('SELECT * FROM genre_translation WHERE genre_id = (?) AND locale = (?)', [genreId, locale]);
    return genreResult[0][0];
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getMovieListInfo,
  getMovieInfo,
  getCastInfoByMovieId,
  getCrewInfoByMovieId,
  getPersonDetail,
  getMovieListByFilter,
  getGenre,
};
