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
    return DetailResult[0][0];
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

const getGenre = async (genreId, locale) => {
  try {
    const genreResult = await pool.execute('SELECT * FROM genre_translation WHERE genre_id = (?) AND locale = (?)', [genreId, locale]);
    return genreResult[0][0];
  } catch (err) {
    console.log(err);
  }
};

const getOverview = async (movieId) => {
  const queryDetails = `SELECT * FROM movie AS m LEFT JOIN movie_translation AS t ON m.id = t.movie_id WHERE t.locale = 'en-US' AND m.id = ${movieId}`;
  try {
    const DetailResult = await pool.execute(queryDetails);
    return DetailResult[0][0];
  } catch (err) {
    console.log(err);
  }
};

const getPersonDetail = async (personId, locale) => {
  const queryDetails = `SELECT * FROM person AS p LEFT JOIN person_translation AS pt ON p.id = pt.person_id WHERE p.id = ${personId} AND locale = \'${locale}\'`;
  try {
    const DetailResult = await pool.execute(queryDetails);
    return DetailResult[0];
  } catch (err) {
    console.log(err);
  }
};

const getCastMovieByPersonId = async (personId, locale) => {
  const queryDetails =
    'SELECT *, c.id AS cast_id FROM cast AS c LEFT JOIN movie AS m ON c.movie_id = m.id LEFT JOIN movie_translation AS mt ON c.movie_id = mt.movie_id WHERE c.person_id = (?) AND locale = (?)';
  try {
    const DetailResult = await pool.execute(queryDetails, [personId, locale]);
    return DetailResult[0];
  } catch (err) {
    console.log(err);
  }
};

const getCrewMovieByPersonId = async (personId, locale) => {
  const queryDetails =
    'SELECT *, c.id AS crew_id FROM crew AS c LEFT JOIN movie AS m ON c.movie_id = m.id LEFT JOIN movie_translation AS mt ON c.movie_id = mt.movie_id WHERE c.person_id = (?) AND locale = (?)';
  try {
    const DetailResult = await pool.execute(queryDetails, [personId, locale]);
    return DetailResult[0];
  } catch (err) {
    console.log(err);
  }
};

const getCharacterByCastId = async (castId, locale) => {
  const queryDetails = 'SELECT * FROM cast_translation WHERE cast_id = (?) AND locale = (?)';
  try {
    // TODO: locale
    if (locale == 'zh-TW' || locale == 'fr-FR') {
      locale = 'en-US';
    }
    const DetailResult = await pool.execute(queryDetails, [castId, locale]);
    return DetailResult[0];
  } catch (err) {
    console.log(err);
  }
};

const getJobByCrewId = async (crewId, locale) => {
  const queryDetails = 'SELECT * FROM crew_translation WHERE crew_id = (?) AND locale = (?)';
  try {
    // TODO: locale
    if (locale == 'zh-TW' || locale == 'fr-FR') {
      locale = 'en-US';
    }
    const DetailResult = await pool.execute(queryDetails, [crewId, locale]);
    return DetailResult[0];
  } catch (err) {
    console.log(err);
  }
};

const getBiography = async (personId) => {
  const queryDetails = `SELECT * FROM person AS p LEFT JOIN person_translation AS pt ON p.id = pt.person_id WHERE p.id = ${personId} AND locale = 'en-US'`;
  try {
    const DetailResult = await pool.execute(queryDetails);
    return DetailResult[0][0];
  } catch (err) {
    console.log(err);
  }
};

const getMovieListByFilter = async (keyword, genreId, locale) => {
  let queryDetails = `SELECT * FROM movie AS m LEFT JOIN movie_translation AS t ON m.id = t.movie_id WHERE locale = \'${locale}\'`;
  if (keyword !== '') {
    queryDetails += " AND title LIKE '%" + `${keyword}` + "%'";
  }
  if (genreId > 0) {
    queryDetails += ` AND genre_id = ${genreId}`;
  }

  try {
    const DetailResult = await pool.execute(queryDetails);
    return DetailResult[0];
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
  getCastMovieByPersonId,
  getCrewMovieByPersonId,
  getCharacterByCastId,
  getJobByCrewId,
  getMovieListByFilter,
  getGenre,
  getOverview,
  getBiography,
};
