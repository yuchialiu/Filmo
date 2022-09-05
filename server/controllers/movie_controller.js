require('dotenv').config();
const axios = require('axios');
const { TMDB_Key } = process.env;
const Movie = require('../models/movie_model');

let locale;
let page = 5;

const insertMovie = async (req, res) => {
  locale = 'en-US';
  const { data } = await axios.get(
    `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_Key}&language=${locale}&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&with_watch_monetization_types=flatrate`
  );
  const result = await Movie.insertMovie(data.results);

  if (result == 'failed') {
    res.status(500).send({ error: 'insert error' });
  } else {
    res.status(200).send({ response: 'inserted' });
  }
};

module.exports = {
  insertMovie,
};
