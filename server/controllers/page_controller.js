/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
const { SERVER_IP } = process.env;
const User = require('../models/user_model');
const Movie = require('../models/movie_model');

const movieListInfo = async (req, res) => {
  const { locale } = req.query;
  const limit = 20;
  const movieList = await Movie.getMovieListInfo(locale, limit);

  const result = [];
  for (const i in movieList) {
    const info = {
      id: movieList[i].movie_id,
      title: movieList[i].title,
      poster: `${SERVER_IP}/public/assets/images/posters/${movieList[i].poster_image}`,
      trailer: `https://www.youtube.com/embed/${movieList[i].trailer}?rel=0`,
    };

    result.push(info);
  }

  // const response = {
  //   data: result,
  // };
  console.log(result);
  res.status(200).render('index', { data: result });
};

const movieInfo = async (req, res) => {
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

const profileReview = async (req, res) => {
  const { userId } = req.session;
  const { locale } = req.query;

  const resultReview = await User.getUserReview(userId);

  const info = [];
  for (i in resultReview) {
    const resultMovie = await Movie.getMovieInfo(resultReview[i].movie_id, locale);

    const result = {
      id: resultReview[i].id,
      review_title: resultReview[i].title,
      content: resultReview[i].content,
      image: `${SERVER_IP}/public/assets/images/uploads/${resultReview[i].image}`,
      image_blurred: resultReview[i].image_blurred,
      user_id: resultReview[i].user_id,
      created_dt: resultReview[i].created_dt,
      updated_dt: resultReview[i].updated_dt,
      movie_id: resultMovie.id,
      title: resultMovie.title,
      poster: `${SERVER_IP}/public/assets/images/posters/${resultMovie.poster_image}`,
    };

    info.push(result);
  }

  // const response = {
  //   data: info,
  // };

  res.status(200).render('review_account', { data: info });
};

module.exports = { movieListInfo, profileReview };
