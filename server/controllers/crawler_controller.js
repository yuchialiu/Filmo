require('dotenv').config();
const axios = require('axios');
const { TMDB_Key } = process.env;
const Crawler = require('../models/crawler_model');

let resArr = [];
let locale;
let page = 5; //movie page

const insertGenreCrawler = async (req, res) => {
  const locales = ['en-US', 'zh-TW', 'fr-FR'];
  for (let i in locales) {
    const { data } = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_Key}&language=${locales[i]}`);
    const result = await Crawler.insertGenreCrawler(data.genres, locales[i]);
    resArr.push(result);
  }

  if (resArr[0] == 'failed') {
    res.status(500).send({ error: 'insert error' });
  } else {
    res.status(200).send({ response: 'inserted' });
  }
};

const insertMovieCrawler = async (req, res) => {
  locale = 'en-US';
  const { data } = await axios.get(
    `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_Key}&language=${locale}&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&with_watch_monetization_types=flatrate`
  );
  const result = await Crawler.insertMovieCrawler(data.results);

  if (result == 'failed') {
    res.status(500).send({ error: 'insert error' });
  } else {
    res.status(200).send({ response: 'inserted' });
  }
};

const insertPersonCrawler = async (req, res) => {
  const result = await Crawler.insertPersonCrawler();

  if (result == 'failed') {
    res.status(500).send({ error: 'insert error' });
  } else if (result == 'not existed') {
    res.status(500).send({ error: 'movie not existed' });
  } else {
    res.status(200).send({ response: 'inserted' });
  }
};

module.exports = {
  insertGenreCrawler,
  insertMovieCrawler,
  insertPersonCrawler,
};
