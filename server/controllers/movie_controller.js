/* eslint-disable no-await-in-loop */
/* eslint-disable object-shorthand */
/* eslint-disable no-restricted-syntax */
require('dotenv').config();

const { SERVER_IP } = process.env;
const Movie = require('../models/movie_model');

const getMovieListInfo = async (req, res) => {
  const { locale } = req.query;
  const limit = 20;
  const movieList = await Movie.getMovieListInfo(locale, limit);

  const result = [];
  for (const movie of movieList) {
    const info = {
      id: movie.movie_id,
      title: movie.title,
      poster: `${SERVER_IP}/public/assets/images/posters/${movie.poster_image}`,
      trailer: `https://www.youtube.com/embed/${movie.trailer}?rel=0`,
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

  if (!result.genre_id.legnth) {
    resultGenre.title = null;
  }

  const castInfo = [];
  for (const castDetail of resultCast) {
    const resultPerson = await Movie.getPersonDetail(castDetail.person_id, locale);

    const cast = {
      person_id: castDetail.person_id,
      cast_id: castDetail.id,
      character: castDetail.character,
      name: castDetail.name,
      image: `${SERVER_IP}/public/assets/images/people/${resultPerson[0].profile_image}`,
    };
    castInfo.push(cast);
  }

  const crewInfo = [];
  for (const crewDetail of resultCrew) {
    const resultPerson = await Movie.getPersonDetail(crewDetail.person_id, locale);

    const crew = {
      person_id: crewDetail.person_id,
      crew_id: crewDetail.id,
      job: crewDetail.job,
      name: crewDetail.name,
      image: `${SERVER_IP}/public/assets/images/people/${resultPerson[0].profile_image}`,
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
    movie_id: result.movie_id,
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

  if (result[0].biography.length === 0) {
    const biographyEn = await Movie.getBiography(personId);
    resultBiography = biographyEn.biography;
  } else {
    resultBiography = result[0].biography;
  }

  const resultCast = await Movie.getCastMovieByPersonId(personId, locale);
  const resultCrew = await Movie.getCrewMovieByPersonId(personId, locale);

  const castMovie = [];
  for (const castDetail of resultCast) {
    const resultCharacter = await Movie.getCharacterByCastId(castDetail.cast_id, locale);
    const movie = {
      movie_id: castDetail.movie_id,
      title: castDetail.title,
      poster: `${SERVER_IP}/public/assets/images/posters/${castDetail.poster_image}`,
      character: resultCharacter[0].character,
    };

    castMovie.push(movie);
  }

  const crewMovie = [];
  for (const crewDetail of resultCrew) {
    const resultJob = await Movie.getJobByCrewId(crewDetail.crew_id, locale);
    const movie = {
      movie_id: crewDetail.movie_id,
      title: crewDetail.title,
      poster: `${SERVER_IP}/public/assets/images/posters/${crewDetail.poster_image}`,
      job: resultJob[0].job,
    };

    crewMovie.push(movie);
  }

  const response = {
    id: result[0].person_id,
    ref_id: result[0].ref_id,
    name: result[0].name,
    birthday: result[0].birthday,
    deathday: result[0].deathday,
    place_of_birth: result[0].place_of_birth,
    image: `${SERVER_IP}/public/assets/images/people/${result[0].profile_image}`,
    biography: resultBiography,
    other_cast_movie: castMovie,
    other_crew_movie: crewMovie,
  };
  res.status(200).send({ data: response });
};

const searchMovie = async (req, res) => {
  const { keyword, genreId, locale } = req.query;

  const resultSearch = await Movie.getMovieListByFilter(keyword, genreId, locale);

  const result = [];
  for (const movie of resultSearch) {
    const info = {
      movid_id: movie.id,
      title: movie.title,
      banner: `${SERVER_IP}/public/assets/images/banners/${movie.banner_image}`,
      poster: `${SERVER_IP}/public/assets/images/posters/${movie.poster_image}`,
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
