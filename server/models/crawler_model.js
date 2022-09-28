/* eslint-disable no-await-in-loop */
/* eslint-disable object-shorthand */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
const { pool } = require('./mysqlcon');
require('dotenv').config();

const { TMDB_Key } = process.env;
const axios = require('axios');

// Image Handler Config
const fs = require('fs');
const request = require('request');

// let myFileName;
let posterFileName;
let bannerFileName;
let castFileName;
let crewFileName;
// myFileName = myFileName.split('.').join('-' + Date.now() + '.');

// Image Handler
const download = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url).pipe(fs.createWriteStream(path)).on('close', callback);
  });
};

const insertGenreCrawler = async (genres, locale) => {
  try {
    // Save genre main table
    if (locale === 'en-US') {
      for (const i in genres) {
        const sql = 'INSERT INTO genre (ref_id) VALUES (?)';
        await pool.execute(sql, [genres[i].id]);
      }
    }

    // Save genre locales
    for (const i in genres) {
      const query = await pool.execute(`SELECT * FROM genre WHERE ref_id = ${genres[i].id}`);

      if (query[0].length !== 0) {
        const sqlLocale = 'INSERT INTO genre_translation (genre_id, locale, title) VALUES (?, ?, ?)';
        await pool.execute(sqlLocale, [query[0][0].id, locale, genres[i].name]);
      }
    }
  } catch (err) {
    console.log(err);
    return 'failed';
  }
};

const prepareMovieInfo = async (movie) => {
  // Validate genre
  const genre = await pool.execute('SELECT * FROM genre');
  let genreId;
  for (const j in genre[0]) {
    if (movie.genre_ids[0] === genre[0][j].ref_id) {
      genreId = genre[0][j].id;
    }
  }

  if (movie.poster_path === null) {
    posterFileName = null;
  } else {
    const url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    const path = `./public/assets/images/posters/p_${movie.id}.jpg`;
    posterFileName = `p_${movie.id}.jpg`;

    download(url, path, () => {
      console.log(`✅ image ${movie.id} Done!`);
    });
  }

  if (movie.backdrop_path === null) {
    bannerFileName = null;
  } else {
    const url = `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`;
    const path = `./public/assets/images/banners/b_${movie.id}.jpg`;
    bannerFileName = `b_${movie.id}.jpg`;

    download(url, path, () => {
      console.log(`✅ image ${movie.id} Done!`);
    });
  }
  return { genreId, posterFileName, bannerFileName };
};

const insertMovieCrawler = async (movies) => {
  try {
    for (const movie of movies) {
      // Validate movie
      // const movieDb = await pool.execute('SELECT * FROM movie WHERE ref_id = (?)', [movie.id]);
      const movieInfo = await prepareMovieInfo(movie);
      // if (movieDb[0].length === 0) {

      const sql = `INSERT INTO movie (ref_id, original_title, release_date, genre_id, poster_image, banner_image) 
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE original_title = ?, release_date = ?, genre_id = ?, poster_image = ?, banner_image = ?`;
      const resultMovie = await pool.execute(sql, [
        movie.id,
        movie.original_title,
        movie.release_date,
        movieInfo.genreId,
        movieInfo.posterFileName,
        movieInfo.bannerFileName,
        movie.original_title,
        movie.release_date,
        movieInfo.genreId,
        movieInfo.posterFileName,
        movieInfo.bannerFileName,
      ]);

      let movieId;
      if (resultMovie[0].insertId !== 0) {
        movieId = resultMovie[0].insertId;
      } else {
        const resultId = await pool.execute('SELECT id FROM movie WHERE ref_id = ?', [movie.id]);
        movieId = resultId[0][0].id;
      }

      await saveMovieTranslation(movie.id, movieId);
      // } else {
      //   'UPDATE'
      // }
    }

    return;
  } catch (err) {
    console.log(err);
    return 'failed';
  }
};

const insertPersonCrawler = async () => {
  try {
    const locale = 'en-US';
    const movieDb = await pool.execute('SELECT * FROM movie');
    for (const i in movieDb[0]) {
      const { data } = await axios.get(`https://api.themoviedb.org/3/movie/${movieDb[0][i].ref_id}/credits?api_key=${TMDB_Key}&language=${locale}`);

      let movieId;
      // Movie ID
      if (data.id === movieDb[0][i].ref_id) {
        movieId = movieDb[0][i].id;
      } else {
        return 'not existed';
      }

      // Handling Cast
      const { cast } = data;
      let castIndex = 10;
      const castLen = cast.length;
      if (castLen < castIndex) {
        castIndex = castLen;
      }
      for (let i = 0; i < castIndex; i++) {
        // const personDb = await pool.execute('SELECT * FROM person WHERE ref_id = ?', [cast[i].id]);
        // if (personDb[0].length == 0) {
        if (cast[i].profile_path === null) {
          castFileName = null;
        } else {
          const url = `https://image.tmdb.org/t/p/h632${cast[i].profile_path}`;
          const path = `./public/assets/images/people/${cast[i].id}.jpg`;
          castFileName = `${cast[i].id}.jpg`;

          download(url, path, () => {
            console.log(`✅ cast image ${i} Done!`);
          });
        }

        const resultPerson = await savePerson(cast[i].id, castFileName);

        let personId;
        if (resultPerson[0].insertId !== 0) {
          personId = resultPerson[0].insertId;
        } else {
          const resultId = await pool.execute('SELECT id FROM person WHERE ref_id = ?', [cast[i].id]);
          personId = resultId[0][0].id;
        }

        await savePersonDetail(cast[i].id, personId);
        // } else {
        // personId = personDb[0][0].id;
        // }

        const sqlCast = `INSERT INTO \`cast\` (movie_id, person_id) 
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE movie_id = ?, person_id = ?`;
        const resultCast = await pool.execute(sqlCast, [movieId, personId, movieId, personId]);

        let castId;
        if (resultCast[0].insertId !== 0) {
          castId = resultCast[0].insertId;
        } else {
          const resultCastId = await pool.execute('SELECT id FROM cast WHERE person_id = ?', [personId]);
          castId = resultCastId[0][0].id;
        }

        const sqlCastUS = `INSERT INTO cast_translation (cast_id, locale, \`character\`) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE locale = ?, \`character\` = ?`;
        await pool.execute(sqlCastUS, [castId, 'en-US', cast[i].character, 'en-US', cast[i].character]);
      }

      // Handling Crew
      const { crew } = data;
      let crewIndex = 10;
      const crewLen = crew.length;
      if (crewLen < crewIndex) {
        crewIndex = crewLen;
      }
      for (let i = 0; i < crewIndex; i++) {
        // const personDb = await pool.execute('SELECT * FROM person WHERE ref_id = ?', [crew[i].id]);

        // if (personDb[0].length == 0) {
        if (crew[i].profile_path === null) {
          crewFileName = null;
        } else {
          const url = `https://image.tmdb.org/t/p/h632${crew[i].profile_path}`;
          const path = `./public/assets/images/people/${crew[i].id}.jpg`;
          crewFileName = `${crew[i].id}.jpg`;

          download(url, path, () => {
            console.log(`✅ crew image ${i} Done!`);
          });
        }

        const resultPerson = await savePerson(crew[i].id, crewFileName);

        let personId;
        if (resultPerson[0].insertId !== 0) {
          personId = resultPerson[0].insertId;
        } else {
          const resultId = await pool.execute('SELECT id FROM person WHERE ref_id = ?', [crew[i].id]);
          personId = resultId[0][0].id;
        }
        await savePersonDetail(crew[i].id, personId);
        // } else {
        // personId = personDb[0][0].id;
        // }

        const sqlCrew = `INSERT INTO crew (movie_id, person_id) 
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE movie_id = ?, person_id = ?`;
        const resultCrew = await pool.execute(sqlCrew, [movieId, personId, movieId, personId]);

        let crewId;
        if (resultCrew[0].insertId !== 0) {
          crewId = resultCrew[0].insertId;
        } else {
          const resultCrewId = await pool.execute('SELECT id FROM crew WHERE person_id = ?', [personId]);
          crewId = resultCrewId[0][0].id;
        }

        const sqlCrewUS = `INSERT INTO crew_translation (crew_id, locale, job) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE locale = ?, job = ?`;

        await pool.execute(sqlCrewUS, [crewId, 'en-US', crew[i].job, 'en-US', crew[i].job]);
      }
    }
    return;
  } catch (err) {
    console.log(err);
    return 'failed';
  }
};

module.exports = {
  insertGenreCrawler,
  insertMovieCrawler,
  insertPersonCrawler,
};

async function saveMovieTranslation(apiId, movieId) {
  const locales = ['en-US', 'fr-FR', 'zh-TW'];
  const lanArr = [];

  for (const i in locales) {
    const details = await axios.get(`https://api.themoviedb.org/3/movie/${apiId}?api_key=${TMDB_Key}&language=${locales[i]}&append_to_response=videos,releases`);
    const dataDetails = details.data;

    if (i === 0) {
      const sqlRuntime = `UPDATE movie SET runtime = (?) WHERE ref_id = ${apiId}`;
      await pool.execute(sqlRuntime, [dataDetails.runtime]);
    }

    const sqlDetails =
      'INSERT INTO movie_translation (movie_id, locale, title, overview, spoken_languages) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE locale = ?, title = ?, overview = ?, spoken_languages = ?';

    if (dataDetails.spoken_languages.length === 0) {
      lanArr.push(null);
    } else {
      lanArr.push(dataDetails.spoken_languages[0].english_name);
    }

    const resultMovieDetails = await pool.execute(sqlDetails, [
      movieId,
      locales[i],
      dataDetails.title,
      dataDetails.overview,
      lanArr[0],
      locales[i],
      dataDetails.title,
      dataDetails.overview,
      lanArr[0],
    ]);

    if (dataDetails.videos.results.length !== 0) {
      await pool.execute(`UPDATE movie_translation SET trailer = (?) WHERE id = ${resultMovieDetails[0].insertId} AND locale = \'${locales[i]}\'`, [
        dataDetails.videos.results[0].key,
      ]);
    }

    for (const j in dataDetails.releases.countries) {
      if (dataDetails.releases.countries[j].iso_3166_1 === locales[i].slice(-2)) {
        const sqlCertification = `UPDATE movie_translation SET certification = (?) WHERE id = ${resultMovieDetails[0].insertId} AND locale = \'${locales[i]}\'`;
        await pool.execute(sqlCertification, [dataDetails.releases.countries[j].certification]);
      }
    }
  }
}

async function savePerson(personId, myFileName) {
  const sqlPerson = 'INSERT INTO person (ref_id, profile_image) VALUES (?, ?) ON DUPLICATE KEY UPDATE profile_image = ?';
  const resultPerson = await pool.execute(sqlPerson, [personId, myFileName, myFileName]);
  return resultPerson;
}

async function savePersonDetail(apiId, dbPersonId) {
  const locales = ['en-US', 'fr-FR', 'zh-TW'];

  for (const locale of locales) {
    const personDetail = await axios.get(`https://api.themoviedb.org/3/person/${apiId}?api_key=${TMDB_Key}&language=${locale}`);
    if (locale === 'en-US') {
      const sqlPersonUpdate = `UPDATE person SET birthday = (?), deathday = (?) , place_of_birth = (?) WHERE ref_id = ${apiId}`;
      await pool.execute(sqlPersonUpdate, [personDetail.data.birthday, personDetail.data.deathday, personDetail.data.place_of_birth]);
    }

    const sqlPerson = `INSERT INTO person_translation (person_id, locale, \`name\`, biography) 
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE locale = ?, \`name\` = ?, biography = ?`;
    await pool.execute(sqlPerson, [dbPersonId, locale, personDetail.data.name, personDetail.data.biography, locale, personDetail.data.name, personDetail.data.biography]);
  }
}
