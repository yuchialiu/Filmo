const { pool } = require('./mysqlcon');
require('dotenv').config();

const { TMDB_Key } = process.env;
const axios = require('axios');

// Image Handler Config
const fs = require('fs');
const request = require('request');

let myFileName;
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

const insertMovieCrawler = async (movies) => {
  try {
    for (const i in movies) {
      // Validate movie
      const movieDb = await pool.execute('SELECT * FROM movie WHERE ref_id = (?)', [movies[i].id]);
      if (movieDb[0].length == 0) {
        // Validate genre
        const genre = await pool.execute('SELECT * FROM genre');
        for (const j in genre[0]) {
          if (movies[i].genre_ids[0] == genre[0][j].ref_id) {
            genre_id = genre[0][j].id;
          }
        }

        if (movies[i].poster_path === null) {
          myFileName = null;
        } else {
          const url = `https://image.tmdb.org/t/p/w500${movies[i].poster_path}`;
          const path = `./public/assets/images/posters/${movies[i].id}.jpg`;
          myFileName = `${movies[i].id}.jpg`;

          download(url, path, () => {
            console.log(`✅ image ${i} Done!`);
          });
        }

        const sql = 'INSERT INTO movie (ref_id, original_title, release_date, genre_id, poster_image) VALUES (?, ?, ?, ?, ?)';
        const resultMovie = await pool.execute(sql, [movies[i].id, movies[i].original_title, movies[i].release_date, genre_id, myFileName]);

        saveMovieTranslation(movies[i].id, resultMovie[0].insertId);
      }
    }

    return;
  } catch (err) {
    console.log(err);
    return 'failed';
  }
};

const insertPersonCrawler = async () => {
  try {
    locale = 'en-US';
    const movieDb = await pool.execute('SELECT * FROM movie');
    for (const i in movieDb[0]) {
      const { data } = await axios.get(`https://api.themoviedb.org/3/movie/${movieDb[0][i].ref_id}/credits?api_key=${TMDB_Key}&language=${locale}`);

      let movie_id;
      // Movie ID
      if (data.id == movieDb[0][i].ref_id) {
        movie_id = movieDb[0][i].id;
      } else {
        return 'not existed';
      }

      let personId;

      // Handling Cast
      const { cast } = data;
      castIndex = 10;
      castLen = cast.length;
      if (castLen < castIndex) {
        castIndex = castLen;
      }
      for (let i = 0; i < castIndex; i++) {
        const personDb = await pool.execute('SELECT * FROM person WHERE ref_id = ?', [cast[i].id]);
        if (personDb[0].length == 0) {
          if (cast[i].profile_path === null) {
            myFileName = null;
          } else {
            const url = `https://image.tmdb.org/t/p/h632${cast[i].profile_path}`;
            const path = `./public/assets/images/people/${cast[i].id}.jpg`;
            myFileName = `${cast[i].id}.jpg`;

            download(url, path, () => {
              console.log(`✅ cast image ${i} Done!`);
            });
          }

          const insertId = await savePerson(cast[i].id, myFileName);
          personId = insertId;

          savePersonDetail(cast[i].id, insertId);
        } else {
          personId = personDb[0][0].id;
        }

        const sqlCast = 'INSERT INTO `cast` (movie_id, person_id) VALUES (?, ?)';
        const resultCast = await pool.execute(sqlCast, [movie_id, personId]);

        const sqlCastUS = 'INSERT INTO cast_translation (cast_id, locale, `character`) VALUES (?, ?, ?)';
        await pool.execute(sqlCastUS, [resultCast[0].insertId, 'en-US', cast[i].character]);
      }

      // Handling Crew
      const { crew } = data;
      crewIndex = 5;
      crewLen = crew.length;
      if (crewLen < crewIndex) {
        crewIndex = crewLen;
      }
      for (let i = 0; i < crewIndex; i++) {
        const personDb = await pool.execute('SELECT * FROM person WHERE ref_id = ?', [crew[i].id]);

        if (personDb[0].length == 0) {
          if (crew[i].profile_path === null) {
            myFileName = null;
          } else {
            const url = `https://image.tmdb.org/t/p/h632${crew[i].profile_path}`;
            const path = `./public/assets/images/people/${crew[i]}.jpg`;
            myFileName = `${crew[i].id}.jpg`;

            download(url, path, () => {
              console.log(`✅ crew image ${i} Done!`);
            });
          }

          const insertId = await savePerson(crew[i].id, myFileName);
          personId = insertId;

          savePersonDetail(crew[i].id, insertId);
        } else {
          personId = personDb[0][0].id;
        }

        const sqlCrew = 'INSERT INTO crew (movie_id, person_id) VALUES (?, ?)';
        const resultCrew = await pool.execute(sqlCrew, [movie_id, personId]);

        const sqlCrewUS = 'INSERT INTO crew_translation (crew_id, locale, job) VALUES (?, ?, ?)';
        await pool.execute(sqlCrewUS, [resultCrew[0].insertId, 'en-US', crew[i].job]);
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

    if (i == 0) {
      const sqlRuntime = `UPDATE movie SET runtime = (?) WHERE ref_id = ${apiId}`;
      await pool.execute(sqlRuntime, [dataDetails.runtime]);
    }

    const sqlDetails = 'INSERT INTO movie_translation (movie_id, locale, title, overview, spoken_languages) VALUES (?, ?, ?, ?, ?)';

    if (dataDetails.spoken_languages.length === 0) {
      lanArr.push(null);
    } else {
      lanArr.push(dataDetails.spoken_languages[0].english_name);
    }

    const resultMovieDetails = await pool.execute(sqlDetails, [movieId, locales[i], dataDetails.title, dataDetails.overview, lanArr[0]]);

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
  const sqlPerson = 'INSERT INTO person (ref_id, profile_image) VALUES (?, ?)';
  const resultPerson = await pool.execute(sqlPerson, [personId, myFileName]);
  return resultPerson[0].insertId;
}

async function savePersonDetail(apiId, dbPersonId) {
  const locales = ['en-US', 'fr-FR', 'zh-TW'];

  for (const i in locales) {
    const personDetail = await axios.get(`https://api.themoviedb.org/3/person/${apiId}?api_key=${TMDB_Key}&language=${locales[i]}`);
    if (i == 0) {
      const sqlPersonUpdate = `UPDATE person SET birthday = (?), deathday = (?) , place_of_birth = (?) WHERE ref_id = ${apiId}`;
      await pool.execute(sqlPersonUpdate, [personDetail.data.birthday, personDetail.data.deathday, personDetail.data.place_of_birth]);
    }

    const sqlPerson = 'INSERT INTO person_translation (person_id, locale, `name`, biography) VALUES (?, ?, ?, ?)';
    await pool.execute(sqlPerson, [dbPersonId, locales[i], personDetail.data.name, personDetail.data.biography]);
  }
}
