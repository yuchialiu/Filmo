require('dotenv').config();
const axios = require('axios');
const { TMDB_Key } = process.env;
const Genre = require('../models/genre_model');

let locale;

const insertGenreEn = async (req, res) => {
  locale = 'en-US';
  const { data } = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_Key}&language=${locale}`);
  const result = await Genre.insertGenreEn(data.genres, locale);

  if (result == 'failed') {
    res.status(500).send({ error: 'insert error' });
  } else {
    res.status(200).send({ response: 'inserted' });
  }
};

const insertGenreZh = async (req, res) => {
  locale = 'zh-TW';
  const { data } = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_Key}&language=${locale}`);
  const result = await Genre.insertGenreZh(data.genres, locale);

  if (result == 'failed') {
    res.status(500).send({ error: 'insert error' });
  } else {
    res.status(200).send({ response: 'inserted' });
  }
};

const insertGenreFr = async (req, res) => {
  locale = 'fr-FR';
  const { data } = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_Key}&language=${locale}`);
  const result = await Genre.insertGenreFr(data.genres, locale);

  if (result == 'failed') {
    res.status(500).send({ error: 'insert error' });
  } else {
    res.status(200).send({ response: 'inserted' });
  }
};

module.exports = {
  insertGenreEn,
  insertGenreZh,
  insertGenreFr,
};
