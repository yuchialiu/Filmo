const { pool } = require('./mysqlcon');
require('dotenv').config();
const { TMDB_Key } = process.env;
const axios = require('axios');

const fs = require('fs');
const request = require('request');

// let locale;
let myFileName;

// Image handler
const download = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url).pipe(fs.createWriteStream(path)).on('close', callback);
  });
};

const insertPerson = async (data) => {
  try {
    // Movie ID
    const queryMovie = await pool.execute('SELECT * FROM movie');
    for (let j in queryMovie[0]) {
      if (data.id == queryMovie[0][j].ref_id) {
        movie_id = queryMovie[0][j].id;
      }
    }
    let personId;

    let cast = data.cast;
    castIndex = 10;
    castLen = cast.length;
    if (castLen < castIndex) {
      castIndex = castLen;
    }
    for (let i = 0; i < castIndex; i++) {
      const personDb = await pool.execute('SELECT * FROM person WHERE ref_id = ?', [cast[i].id]);
      if (personDb[0].length == 0) {
        const url = `https://image.tmdb.org/t/p/h632${cast[i].profile_path}`;
        const path = `./public/people/${cast[i].id}.jpg`;
        myFileName = `${cast[i].id}.jpg`;

        download(url, path, () => {
          console.log(`✅ cast image ${i} Done!`);
        });

        let insertId = await savePerson(cast[i].id, myFileName);
        // let sqlPerson = 'INSERT INTO person (ref_id, profile_image) VALUES (?, ?)';
        // const resultPerson = await pool.execute(sqlPerson, [cast[i].id, myFileName]);
        personId = insertId;

        savePersonDetail(cast[i].id, insertId);
      } else {
        personId = personDb[0][0].id;
      }

      let sqlCast = 'INSERT INTO `cast` (movie_id, person_id) VALUES (?, ?)';
      const resultCast = await pool.execute(sqlCast, [movie_id, personId]);

      const sqlCastUS = 'INSERT INTO cast_translation (cast_id, locale, `character`) VALUES (?, ?, ?)';
      await pool.execute(sqlCastUS, [resultCast[0].insertId, 'en-US', cast[i].character]);
    }

    let crew = data.crew;
    crewIndex = 5;
    crewLen = crew.length;
    if (crewLen < crewIndex) {
      crewIndex = crewLen;
    }
    for (let i = 0; i < crewIndex; i++) {
      const personDb = await pool.execute('SELECT * FROM person WHERE ref_id = ?', [crew[i].id]);

      if (personDb[0].length == 0) {
        const url = `https://image.tmdb.org/t/p/h632${crew[i].profile_path}`;
        const path = `./public/people/${crew[i]}.jpg`;
        myFileName = `${crew[i].id}.jpg`;

        download(url, path, () => {
          console.log(`✅ crew image ${i} Done!`);
        });

        let insertId = await savePerson(crew[i].id, myFileName);
        // let sqlPerson = 'INSERT INTO person (ref_id, profile_image) VALUES (?, ?)';
        // const resultPerson = await pool.execute(sqlPerson, [crew[i].id, myFileName]);
        personId = insertId;

        savePersonDetail(crew[i].id, insertId);
      } else {
        console.log('personDb[0]', personDb[0]);
        personId = personDb[0][0].id;
      }

      let sqlCrew = 'INSERT INTO crew (movie_id, person_id) VALUES (?, ?)';
      const resultCrew = await pool.execute(sqlCrew, [movie_id, personId]);

      const sqlCrewUS = 'INSERT INTO crew_translation (crew_id, locale, job) VALUES (?, ?, ?)';
      await pool.execute(sqlCrewUS, [resultCrew[0].insertId, 'en-US', crew[i].job]);
    }
    return;
  } catch (err) {
    console.log(err);
    return 'failed';
  }
};

module.exports = {
  insertPerson,
};

async function savePerson(personId, myFileName) {
  let sqlPerson = 'INSERT INTO person (ref_id, profile_image) VALUES (?, ?)';
  const resultPerson = await pool.execute(sqlPerson, [personId, myFileName]);
  return resultPerson[0].insertId;
}

async function savePersonDetail(apiId, dbPersonId) {
  let locales = ['en-US', 'fr-FR', 'zh-TW'];

  for (i in locales) {
    const personDetail = await axios.get(`https://api.themoviedb.org/3/person/${apiId}?api_key=${TMDB_Key}&language=${locales[i]}`);
    if (i == 0) {
      const sqlPersonUpdate = `UPDATE person SET birthday = (?), deathday = (?) , place_of_birth = (?) WHERE ref_id = ${apiId}`;
      await pool.execute(sqlPersonUpdate, [personDetail.data.birthday, personDetail.data.deathday, personDetail.data.place_of_birth]);
    }

    const sqlPersonUS = 'INSERT INTO person_translation (person_id, locale, `name`, biography) VALUES (?, ?, ?, ?)';
    await pool.execute(sqlPersonUS, [dbPersonId, locales[i], personDetail.data.name, personDetail.data.biography]);
  }
}

// let sqlPerson = 'INSERT INTO person (ref_id, profile_image) VALUES ';
// sqlPerson += '(?, ?), ';
// sqlPerson = sqlPerson.slice(0, -2);
// const resultPerson = await pool.execute(sqlPerson, [cast[i].id, myFileName]);

// //en-US
// locale = 'en-US';
// const personDetailUS = await axios.get(`https://api.themoviedb.org/3/person/${cast[i].id}?api_key=${TMDB_Key}&language=${locale}`);
// const sqlPersonUpdate = `UPDATE person SET birthday = (?), deathday = (?) , place_of_birth = (?) WHERE ref_id = ${cast[i].id}`;
// await pool.execute(sqlPersonUpdate, [personDetailUS.data.birthday, personDetailUS.data.deathday, personDetailUS.data.place_of_birth]);

// const sqlPersonUS = 'INSERT INTO person_translation (person_id, locale, `name`, biography) VALUES (?, ?, ?, ?)';
// await pool.execute(sqlPersonUS, [resultPerson[0].insertId, locale, personDetailUS.data.name, personDetailUS.data.biography]);

// //fr-FR
// locale = 'fr-FR';
// const personDetailFR = await axios.get(`https://api.themoviedb.org/3/person/${cast[i].id}?api_key=${TMDB_Key}&language=${locale}`);
// const sqlPersonFR = 'INSERT INTO person_translation (person_id, locale, `name`, biography) VALUES (?, ?, ?, ?)';
// await pool.execute(sqlPersonFR, [resultPerson[0].insertId, locale, personDetailFR.data.name, personDetailFR.data.biography]);

// //zh-TW
// locale = 'zh-TW';
// const personDetailTW = await axios.get(`https://api.themoviedb.org/3/person/${cast[i].id}?api_key=${TMDB_Key}&language=${locale}`);
// const sqlPersonTW = 'INSERT INTO person_translation (person_id, locale, `name`, biography) VALUES (?, ?, ?, ?)';
// await pool.execute(sqlPersonTW, [resultPerson[0].insertId, locale, personDetailTW.data.name, personDetailTW.data.biography]);

// let sqlCast = 'INSERT INTO `cast` (movie_id, person_id) VALUES (?, ?)';
// const resultCast = await pool.execute(sqlCast, [movie_id, resultPerson[0].insertId]);

// const sqlCastUS = 'INSERT INTO cast_translation (cast_id, locale, `character`) VALUES (?, ?, ?)';
// await pool.execute(sqlCastUS, [resultCast[0].insertId, 'en-US', cast[i].character]);
