require('dotenv').config();
const axios = require('axios');
const { pool } = require('../models/mysqlcon');
const { TMDB_Key } = process.env;
const Person = require('../models/person_model');

let locale;
let movieId = 21;
let resArr = [];

const insertPerson = async (req, res) => {
  locale = 'en-US';
  const movieDb = await pool.execute(`SELECT * FROM movie WHERE id < ${movieId}`);
  for (let i in movieDb[0]) {
    const { data } = await axios.get(`https://api.themoviedb.org/3/movie/${movieDb[0][i].ref_id}/credits?api_key=${TMDB_Key}&language=${locale}`);
    const result = await Person.insertPerson(data);
    resArr.push(result);
  }

  if (resArr == 'failed') {
    res.status(500).send({ error: 'insert error' });
  } else {
    res.status(200).send({ response: 'inserted' });
  }
};

module.exports = {
  insertPerson,
};
