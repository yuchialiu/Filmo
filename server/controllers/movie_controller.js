require('dotenv').config();

const { SERVER_IP } = process.env;
const Movie = require('../models/movie_model');

// const showMain = async (req, res) => {
//   const result = await Movie.getMovieData();
//   res.render('index', { data: result[0] });
// };

// const showMovieInfo = async (req, res) => {
//   const movieId = req.query.id;
//   const { locale } = req.query;
//   const result = await Movie.getMovieInfo(movieId, locale);
//   res.render('movie', { data: result[0] });
// };

const getMovieListInfo = async (req, res) => {
  const { locale } = req.query;
  const limit = 20;
  const movieList = await Movie.getMovieListInfo(locale, limit);

  const result = [];
  for (i in movieList) {
    const info = {
      id: movieList[i].movie_id,
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

  if (result.genre_id.legnth == 0) {
    resultGenre.title = null;
  }

  const castInfo = [];
  for (i in resultCast) {
    const resultPerson = await Movie.getPersonDetail(resultCast[i].person_id, locale);

    const cast = {
      person_id: resultCast[i].person_id,
      cast_id: resultCast[i].id,
      character: resultCast[i].character,
      name: resultCast[i].name,
      image: `${SERVER_IP}/public/assets/images/people/${resultPerson[0].profile_image}`,
    };
    castInfo.push(cast);
  }

  const crewInfo = [];
  for (const i in resultCrew) {
    const resultPerson = await Movie.getPersonDetail(resultCrew[i].person_id, locale);

    const crew = {
      person_id: resultCrew[i].person_id,
      crew_id: resultCrew[i].id,
      job: resultCrew[i].job,
      name: resultCrew[i].name,
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
  for (i in resultCast) {
    const resultCharacter = await Movie.getCharacterByCastId(resultCast[i].cast_id, locale);
    const movie = {
      movie_id: resultCast[i].movie_id,
      title: resultCast[i].title,
      poster: `${SERVER_IP}/public/assets/images/posters/${resultCast[i].poster_image}`,
      character: resultCharacter[0].character,
    };

    castMovie.push(movie);
  }

  const crewMovie = [];
  for (i in resultCrew) {
    const resultJob = await Movie.getJobByCrewId(resultCrew[i].crew_id, locale);
    const movie = {
      movie_id: resultJob[i].movie_id,
      title: resultJob[i].title,
      poster: `${SERVER_IP}/public/assets/images/posters/${resultJob[i].poster_image}`,
      character: resultJob[0].job,
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
