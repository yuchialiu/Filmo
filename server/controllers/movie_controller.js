require('dotenv').config();

const { SERVER_IP } = process.env;
const Movie = require('../models/movie_model');

const getMovieListInfo = async (req, res) => {
  const { locale } = req.query;
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

  const result = await Movie.getMovieInfo(movieId, locale);
  const resultCast = await Movie.getCastInfoByMovieId(movieId, locale);
  const resultCrew = await Movie.getCrewInfoByMovieId(movieId, locale);
  const resultGenre = await Movie.getGenre(result.genre_id, locale);

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

  let resultOverview;

  if (result.overview.length === 0) {
    const overviewEn = await Movie.getOverview(movieId);
    resultOverview = overviewEn.overview;
  } else {
    resultOverview = result.overview;
  }

  const response = {
    id: result.id,
    ref_id: result.ref_id,
    original_title: result.original_title,
    release_date: result.release_date,
    runtime: result.runtime,
    genre: resultGenre.title,
    poster: `${SERVER_IP}/public/assets/images/posters/${result.poster_image}`,
    title: result.title,
    overview: resultOverview,
    trailer: result.trailer,
    certification: result.certification,
    spoken_languages: result.spoken_languages,
    cast: castInfo,
    crew: crewInfo,
  };
  res.status(200).send({ data: response });
};

const getPersonDetail = async (req, res) => {
  const personId = req.query.person_id;
  const { locale } = req.query;

  const result = await Movie.getPersonDetail(personId, locale);
  let resultBiography;

  if (result.biography.length === 0) {
    const biographyEn = await Movie.getBiography(personId);
    resultBiography = biographyEn.biography;
  } else {
    resultBiography = result.biography;
  }
  const response = {
    id: result.id,
    ref_id: result.ref_id,
    name: result.name,
    birthday: result.birthday,
    deathday: result.deathday,
    place_of_birth: result.place_of_birth,
    image: `${SERVER_IP}/public/assets/images/posters/${result.profile_image}`,
    biography: resultBiography,
  };
  res.status(200).send({ data: response });
};

const searchMovie = async (req, res) => {
  const { title, genreId, locale } = req.query;

  const resultSearch = await Movie.getMovieListByFilter(title, genreId, locale);

  const result = [];
  for (i in resultSearch) {
    const info = {
      movid_id: resultSearch[i].id,
      title: resultSearch[i].title,
      poster: `${SERVER_IP}/public/assets/images/posters/${resultSearch[i].poster_image}`,
    };

    result.push(info);
  }

  res.status(200).send({ data: result });
};

module.exports = {
  getMovieListInfo,
  getMovieInfo,
  getPersonDetail,
  searchMovie,
};
