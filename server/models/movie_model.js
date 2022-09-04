const { pool } = require('./mysqlcon');
require('dotenv').config();
const { TMDB_Key } = process.env;
const axios = require('axios');

const fs = require('fs');
const request = require('request');

let locale;
let myFileName;
// myFileName = myFileName.split('.').join('-' + Date.now() + '.');

// Image handler
const download = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url).pipe(fs.createWriteStream(path)).on('close', callback);
  });
};

const insertMovie = async (movies) => {
  try {
    for (let i in movies) {
      // validate genre
      const genre = await pool.execute('SELECT * FROM genre');
      for (let j in genre[0])
        if (movies[i].genre_ids[0] == genre[0][j].ref_id) {
          genre_id = genre[0][j].id;
        }

      const url = `https://image.tmdb.org/t/p/w500${movies[i].poster_path}`;
      const path = `./public/posters/${movies[i].id}.jpg`;
      myFileName = `${movies[i].id}.jpg`;

      download(url, path, () => {
        console.log(`✅ image ${i} Done!`);
      });

      let sql = 'INSERT INTO movie (ref_id, original_title, release_date, genre_id, poster_image) VALUES (?, ?, ?, ?, ?)';
      // sql += '(?, ?, ?, ?, ?), ';
      // sql = sql.slice(0, -2);

      const resultMovie = await pool.execute(sql, [movies[i].id, movies[i].original_title, movies[i].release_date, genre_id, myFileName]);

      saveMovieTranslation(movies[i].id, resultMovie[0].insertId);
    }

    return;
  } catch (err) {
    console.log(err);
    return 'failed';
  }
};

module.exports = { insertMovie };

async function saveMovieTranslation(apiId, movieId) {
  let locales = ['en-US', 'fr-FR', 'zh-TW'];

  for (i in locales) {
    const details = await axios.get(`https://api.themoviedb.org/3/movie/${apiId}?api_key=${TMDB_Key}&language=${locales[i]}&append_to_response=videos,releases`);
    const dataDetails = details.data;

    let sqlRuntime = `UPDATE movie SET runtime = (?) WHERE ref_id = ${apiId}`;
    await pool.execute(sqlRuntime, [dataDetails.runtime]);

    let sqlDetails = 'INSERT INTO movie_translation (movie_id, locale, title, overview, spoken_languages) VALUES (?, ?, ?, ?, ?)';

    let resultMovieDetails = await pool.execute(sqlDetails, [movieId, locales[i], dataDetails.title, dataDetails.overview, dataDetails.spoken_languages[0].english_name]);
    //pending
    if (dataDetails.videos.results[0]) {
      await pool.execute(`UPDATE movie_translation SET trailer = (?) WHERE id = ${resultMovieDetails[0].insertId}`, [
        `https://www.youtube.com/watch?v=${dataDetails.videos.results[0].key}`,
      ]);
    }
    //pending
    for (let j in dataDetails.releases.countries) {
      if (dataDetails.releases.countries[j].iso_3166_1 === 'US') {
        let sqlCertification = `UPDATE movie_translation SET certification = (?) WHERE id = ${resultMovieDetails[0].insertId}`;
        await pool.execute(sqlCertification, [dataDetails.releases.countries[j].certification]);
      }
    }
  }
}

// //movie_translation: en-US
// locale = 'en-US';
// const details = await axios.get(`https://api.themoviedb.org/3/movie/${movies[i].id}?api_key=${TMDB_Key}&language=${locale}&append_to_response=videos,releases`);
// const dataDetails = details.data;

// let sqlRuntime = `UPDATE movie SET runtime = (?) WHERE ref_id = ${movies[i].id}`;
// await pool.execute(sqlRuntime, [dataDetails.runtime]);

// let sqlDetails = 'INSERT INTO movie_translation (movie_id, locale, title, overview, spoken_languages) VALUES (?, ?, ?, ?, ?)';

// let resultMovieDetails = await pool.execute(sqlDetails, [resultMovie[0].insertId, locale, dataDetails.title, dataDetails.overview, dataDetails.spoken_languages[0].english_name]);

// if (dataDetails.videos.results[0]) {
//   await pool.execute(`UPDATE movie_translation SET trailer = (?) WHERE id = ${resultMovieDetails[0].insertId}`, [
//     `https://www.youtube.com/watch?v=${dataDetails.videos.results[0].key}`,
//   ]);
// }

// for (let j in dataDetails.releases.countries) {
//   if (dataDetails.releases.countries[j].iso_3166_1 === 'US') {
//     let sqlCertification = `UPDATE movie_translation SET certification = (?) WHERE id = ${resultMovieDetails[0].insertId}`;
//     await pool.execute(sqlCertification, [dataDetails.releases.countries[j].certification]);
//   }
// }

// //movie_translation: fr-FR
// locale = 'fr-FR';
// const detailsFR = await axios.get(`https://api.themoviedb.org/3/movie/${movies[i].id}?api_key=${TMDB_Key}&language=${locale}&append_to_response=videos,releases`);
// const dataDetailsFR = detailsFR.data;

// let sqlDetailsFR = 'INSERT INTO movie_translation (movie_id, locale, title, overview, spoken_languages) VALUES (?, ?, ?, ?, ?)';

// let resultMovieDetailsFR = await pool.execute(sqlDetailsFR, [
//   resultMovie[0].insertId,
//   locale,
//   dataDetailsFR.title,
//   dataDetailsFR.overview,
//   dataDetailsFR.spoken_languages[0].english_name,
// ]);

// if (dataDetailsFR.videos.results[0]) {
//   await pool.execute(`UPDATE movie_translation SET trailer = (?) WHERE id = ${resultMovieDetailsFR[0].insertId}`, [
//     `https://www.youtube.com/watch?v=${dataDetailsFR.videos.results[0].key}`,
//   ]);
// }

// let sqlCertificationFR = `UPDATE movie_translation SET certification = (?) WHERE id = ${resultMovieDetailsFR[0].insertId}`;

// for (let j in dataDetailsFR.releases.countries) {
//   if (dataDetailsFR.releases.countries[j].iso_3166_1 === 'FR' && dataDetailsFR.releases.countries[j].certification !== '') {
//     await pool.execute(sqlCertificationFR, [dataDetailsFR.releases.countries[j].certification]);
//   } else if (dataDetailsFR.releases.countries[j].iso_3166_1 === 'US') {
//     await pool.execute(sqlCertificationFR, [dataDetailsFR.releases.countries[j].certification]);
//   }
// }

// //movie_translation: zh-TW
// locale = 'zh-TW';
// const detailsTW = await axios.get(`https://api.themoviedb.org/3/movie/${movies[i].id}?api_key=${TMDB_Key}&language=${locale}&append_to_response=videos,releases`);
// const dataDetailsTW = detailsTW.data;

// let sqlDetailsTW = 'INSERT INTO movie_translation (movie_id, locale, title, overview, spoken_languages) VALUES (?, ?, ?, ?, ?)';
// let resultMovieDetailsTW = await pool.execute(sqlDetailsTW, [
//   resultMovie[0].insertId,
//   locale,
//   dataDetailsTW.title,
//   dataDetailsTW.overview,
//   dataDetailsTW.spoken_languages[0].english_name,
// ]);

// if (dataDetailsTW.videos.results[0]) {
//   await pool.execute(`UPDATE movie_translation SET trailer = (?) WHERE id = ${resultMovieDetailsTW[0].insertId}`, [
//     `https://www.youtube.com/watch?v=${dataDetailsTW.videos.results[0].key}`,
//   ]);
// }

// let sqlCertificationTW = `UPDATE movie_translation SET certification = (?) WHERE id = ${resultMovieDetailsTW[0].insertId}`;

// for (let j in dataDetailsTW.releases.countries) {
//   if (dataDetailsTW.releases.countries[j].iso_3166_1 === 'TW' && dataDetailsTW.releases.countries[j].certification !== '') {
//     await pool.execute(sqlCertificationTW, [dataDetailsTW.releases.countries[j].certification]);
//   } else if (dataDetailsTW.releases.countries[j].iso_3166_1 === 'US') {
//     await pool.execute(sqlCertificationTW, [dataDetailsTW.releases.countries[j].certification]);
//   }
// }
