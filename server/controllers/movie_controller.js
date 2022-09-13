require('dotenv').config();

const { SERVER_IP } = process.env;
const Movie = require('../models/movie_model');

// const showMain = async (req, res) => {
//   const result = await Movie.getMovieData();

//   res.render('index', { data: result[0] });
// };

// const showDetail = async (req, res) => {
//   const result = await Index.getMovieDetails(7);
//   res.render('detail', { data: result[0] });
// };

// const getMovieData = async (req, res) => {
//   const result = await Index.getMovieData();
//   const response = {
//     data: result,
//   };
// };

const getMovieListInfo = async (req, res) => {
  // const locale = req.query.locale;
  const locale = 'en-US';
  const limit = 20;
  const movieList = await Movie.getMovieListInfo(locale, limit);

  const result = [];
  for (i in movieList) {
    const info = {
      id: movieList[i].id,
      title: movieList[i].title,
      poster: `${SERVER_IP}/public/assets/images/posters/${movieList[i].poster_image}`,
      trailer: `https://www.youtube.com/embed/${movieList[i].trailer}?rel=0`,
    };

    result.push(info);
  }

  const response = {
    data: result,
  };
  res.status(200).send(response);
};

const getMovieInfo = async (req, res) => {
  const movieId = req.query.id;
  const { locale } = req.query;
  // const locale = 'en-US';

  const result = await Movie.getMovieInfo(movieId, locale);
  const resultCast = await Movie.getCastInfoByMovieId(movieId, locale);
  const resultCrew = await Movie.getCrewInfoByMovieId(movieId, locale);
  const resultGenre = await Movie.getGenre(result[0].genre_id, locale);

  const castInfo = [];
  for (i in resultCast) {
    const cast = {
      cast_id: resultCast[i].id,
      character: resultCast[i].character,
      name: resultCast[i].name,
    };
    castInfo.push(cast);
  }

  const crewInfo = [];
  for (i in resultCrew) {
    const crew = {
      crew_id: resultCrew[i].id,
      job: resultCrew[i].job,
      name: resultCrew[i].name,
    };
    crewInfo.push(crew);
  }

  // TODO:format result
  const response = {
    id: result[0].id,
    ref_id: result[0].ref_id,
    original_title: result[0].original_title,
    release_date: result[0].release_date,
    runtime: result[0].runtime,
    genre: resultGenre.title,
    poster: `${SERVER_IP}/public/assets/images/posters/${result[0].poster_image}`,
    title: result[0].title,
    overview: result[0].overview,
    trailer: result[0].trailer,
    certification: result[0].certification,
    spoken_languages: result[0].spoken_languages,
    cast: castInfo,
    crew: crewInfo,
  };
  res.status(200).send({ data: response });
};

const getPersonDetail = async (req, res) => {
  const personId = req.params.person_id;
  const locale = 'en-US';
  // TODO: req.params
  const result = await Movie.getPersonDetail(personId, locale);
  const response = {
    data: result,
  };
  res.status(200).send(response);
};

const searchMovie = async (req, res) => {
  // TODO: Movie.getMovieListByFilter
};

module.exports = {
  getMovieListInfo,
  getMovieInfo,
  getPersonDetail,
  searchMovie,
};
