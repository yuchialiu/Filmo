require('dotenv').config();
const axios = require('axios');
const { TMDB_Key } = process.env;
const Person = require('../models/person_model');

let locale;
let movieId = 610150;

const insertPerson = async (req, res) => {
  locale = 'en-US';
  const { data } = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_Key}&language=${locale}`);
  const result = await Person.insertPerson(data);

  if (result == 'failed') {
    res.status(500).send({ error: 'insert error' });
  } else {
    res.status(200).send({ response: 'inserted' });
  }
};

module.exports = {
  insertPerson,
};
