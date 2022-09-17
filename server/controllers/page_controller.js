/* eslint-disable object-shorthand */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
const { SERVER_IP } = process.env;
const User = require('../models/user_model');
const Movie = require('../models/movie_model');

const showMovieListInfo = async (req, res) => {
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
  result.locale = locale;

  res.status(200).render('index', { data: result });
};

const showMovieInfo = async (req, res) => {
  const movieId = req.query.id;
  const { locale } = req.query;

  const result = await Movie.getMovieInfo(movieId, locale);
  const resultCast = await Movie.getCastInfoByMovieId(movieId, locale);
  const resultCrew = await Movie.getCrewInfoByMovieId(movieId, locale);
  const resultGenre = await Movie.getGenre(result.genre_id, locale);

  if (result.genre_id.legnth === 0) {
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
    locale: locale,
  };
  res.status(200).render('movie', { data: response });
};

const showPersonDetail = async (req, res) => {
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
      movie_id: resultCrew[i].movie_id,
      title: resultCrew[i].title,
      poster: `${SERVER_IP}/public/assets/images/posters/${resultCrew[i].poster_image}`,
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
    locale: locale,
  };

  res.status(200).render('person', { data: response });
};

const showProfileReview = async (req, res) => {
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
      locale: locale,
    };

    info.push(result);
  }
  info.locale = locale;

  res.status(200).render('review_account', { data: info });
};

const showUserSavedReview = async (req, res) => {
  const { userId } = req.session;
  const { locale } = req.query;

  const resultSavedReview = await User.getUserSavedReview(userId);
  const info = [];

  for (const i in resultSavedReview) {
    const resultReview = await User.getReviewInfo(resultSavedReview[i].review_id);

    for (const j in resultReview) {
      const resultMovie = await Movie.getMovieInfo(resultReview[j].movie_id, locale);
      const result = {
        review_id: resultReview[j].id,
        review_title: resultReview[j].title,
        content: resultReview[j].content,
        image: `${SERVER_IP}/public/assets/images/uploads/${resultReview[j].image}`,
        created_dt: resultReview[j].created_dt,
        updated_dt: resultReview[j].updated_dt,
        movie_id: resultMovie.movie_id,
        movie_title: resultMovie.title,
        movie_poster: `${SERVER_IP}/public/assets/images/posters/${resultMovie.poster_image}`,
      };
      info.push(result);
    }
  }

  info.locale = locale;
  res.status(200).render('saved_review', { data: info });
};

const showUserSavedMovie = async (req, res) => {
  const { userId } = req.session;
  const { locale } = req.query;
  const resultSavedMovie = await User.getUserSavedMovie(userId);
  const info = [];

  for (i in resultSavedMovie) {
    const resultMovie = await User.getMovieInfo(resultSavedMovie[i].movie_id, locale);
    for (j in resultMovie) {
      const result = {
        movie_id: resultMovie[j].id,
        title: resultMovie[j].title,
        poster: `${SERVER_IP}/public/assets/images/posters/${resultMovie[j].poster_image}`,
      };
      info.push(result);
    }
  }
  info.locale = locale;

  res.status(200).render('saved_movie', { data: info });
};

const showAllReviews = async (req, res) => {
  const { locale } = req.query;

  const resultReview = await User.getAllReviews();

  const info = [];
  for (const i in resultReview) {
    const resultMovie = await Movie.getMovieInfo(resultReview[i].movie_id, locale);
    const resultAccount = await User.getUserById(resultReview[i].user_id);

    const result = {
      user_id: resultAccount.id,
      username: resultAccount.username,
      profile_image: resultAccount.profile_image,
      review_id: resultReview[i].id,
      content: resultReview[i].content,
      image: `${SERVER_IP}/public/assets/images/uploads/${resultReview[i].image}`,
      image_blurred: resultReview[i].image_blurred,
      created_dt: resultReview[i].created_dt,
      updated_dt: resultReview[i].updated_dt,
      movie_id: resultMovie.id,
      title: resultMovie.title,
      poster: `${SERVER_IP}/public/assets/images/posters/${resultMovie.poster_image}`,
    };

    info.push(result);
  }
  info.locale = locale;

  res.render('review_all', { data: info });
};

const showReviewById = async (req, res) => {
  const { id, locale } = req.query;

  const resultReview = await User.getReviewById(id);

  const info = [];
  for (const i in resultReview) {
    const resultMovie = await Movie.getMovieInfo(resultReview[i].movie_id, locale);
    const resultAccount = await User.getUserById(resultReview[i].user_id);

    const result = {
      user_id: resultAccount.id,
      username: resultAccount.username,
      profile_image: resultAccount.profile_image,
      review_id: resultReview[i].id,
      content: resultReview[i].content,
      image: `${SERVER_IP}/public/assets/images/uploads/${resultReview[i].image}`,
      image_blurred: resultReview[i].image_blurred,
      created_dt: resultReview[i].created_dt,
      updated_dt: resultReview[i].updated_dt,
      movie_id: resultMovie.id,
      title: resultMovie.title,
      poster: `${SERVER_IP}/public/assets/images/posters/${resultMovie.poster_image}`,
    };

    info.push(result);
  }
  info.locale = locale;

  res.render('review_info', { data: info });
};

module.exports = {
  showMovieListInfo,
  showMovieInfo,
  showPersonDetail,
  showProfileReview,
  showUserSavedReview,
  showUserSavedMovie,
  showAllReviews,
  showReviewById,
};
