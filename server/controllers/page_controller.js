/* eslint-disable no-await-in-loop */
/* eslint-disable object-shorthand */
/* eslint-disable no-restricted-syntax */
const { AWS_CLOUDFRONT_DOMAIN } = process.env;
const dayjs = require('dayjs');
require('dayjs/locale/fr');
require('dayjs/locale/zh-tw');
const User = require('../models/user_model');
const Movie = require('../models/movie_model');
const Page = require('../models/page_model');
const Lang = require('../../util/language');

const showMovieListInfo = async (req, res) => {
  const { locale } = req.query;
  const { isAuth } = req.session;
  // const limit = 100;
  // const movieList = await Movie.getMovieListInfo(locale, limit);
  const movieList = await Movie.getMovieListInfo(locale);

  const result = [];
  for (const movie of movieList) {
    const info = {
      movie_id: movie.movie_id,
      title: movie.title,
      banner: `${AWS_CLOUDFRONT_DOMAIN}/images/banners/${movie.banner_image}`,
      poster: `${AWS_CLOUDFRONT_DOMAIN}/images/posters/${movie.poster_image}`,
      trailer_embed: `https://www.youtube.com/embed/${movie.trailer}?rel=0`,
      trailer_watch: `https://www.youtube.com/watch?v=${movie.trailer}?rel=0`,
      trailer: movie.trailer,
    };

    result.push(info);
  }

  res.status(200).render('index', {
    data: result,
    locale,
    locale_string: JSON.stringify(locale),
    lang: Lang[locale],
    isAuth,
  });
};

const convertMinsToHrsMins = (mins) => {
  let h = Math.floor(mins / 60);
  let m = mins % 60;
  h = h < 10 ? `0${h}` : h; // (or alternatively) h = String(h).padStart(2, '0')
  m = m < 10 ? `0${m}` : m; // (or alternatively) m = String(m).padStart(2, '0')
  return `${h}h ${m}m`;
};

const getMovieInfo = async (req) => {
  const movieId = req.query.id;
  const { locale } = req.query;
  const { userId, isAuth } = req.session;

  const result = await Movie.getMovieInfo(movieId, locale, userId);
  const resultCast = await Movie.getCastInfoByMovieId(movieId, locale);
  const resultCrew = await Movie.getCrewInfoByMovieId(movieId, locale);
  const resultGenre = await Movie.getGenre(result.genre_id, locale);

  if (result.genre_id.legnth === 0) {
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
      image: `${AWS_CLOUDFRONT_DOMAIN}/images/people/${resultPerson[0].profile_image}`,
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
      image: `${AWS_CLOUDFRONT_DOMAIN}/images/people/${resultPerson[0].profile_image}`,
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

  const runtime = convertMinsToHrsMins(result.runtime);

  // check if user saved movie
  let savedMovie = false;
  if (isAuth) {
    const resultSaved = await User.checkUserSavedMovie(userId, movieId);
    if (resultSaved) {
      savedMovie = true;
    }
  }

  const response = {
    movie_id: result.movie_id,
    ref_id: result.ref_id,
    original_title: result.original_title,
    release_date: result.release_date,
    year: dayjs(result.release_date).year(),
    runtime: runtime,
    genre: resultGenre.title,
    poster: `${AWS_CLOUDFRONT_DOMAIN}/images/posters/${result.poster_image}`,
    title: result.title,
    overview: resultOverview,
    trailer: result.trailer,
    certification: result.certification,
    spoken_languages: result.spoken_languages,
    cast: castInfo,
    crew: crewInfo,
    user_saved_movie: savedMovie,
  };
  return response;
};

const showMovieInfo = async (req, res) => {
  const { locale } = req.query;
  const { isAuth } = req.session;

  try {
    const response = await getMovieInfo(req);
    res.status(200).render('movie', {
      data: response,
      locale,
      locale_string: JSON.stringify(locale),
      lang: Lang[locale],
      isAuth,
    });
  } catch (err) {
    res.status(404).render('404', { locale, lang: Lang[locale], isAuth });
  }
};

const showMovieInfoForReview = async (req, res) => {
  const { locale } = req.query;
  const { isAuth } = req.session;

  try {
    const response = await getMovieInfo(req);
    res.status(200).render('review_submit', {
      data: response,
      locale,
      locale_string: JSON.stringify(locale),
      lang: Lang[locale],
    });
  } catch (err) {
    res.status(404).render('404', { locale, lang: Lang[locale], isAuth });
  }
};

const getPersonDetail = async (req) => {
  const personId = req.query.id;
  const { locale } = req.query;

  const result = await Movie.getPersonDetail(personId, locale);
  let resultBiography;

  if (result[0].biography === '') {
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
      poster: `${AWS_CLOUDFRONT_DOMAIN}/images/posters/${castDetail.poster_image}`,
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
      poster: `${AWS_CLOUDFRONT_DOMAIN}/images/posters/${crewDetail.poster_image}`,
      job: resultJob[0].job,
    };

    crewMovie.push(movie);
  }

  let formatDate;
  if (locale === 'en-US') {
    formatDate = 'MMMM DD YYYY';
  } else if (locale === 'fr-FR') {
    formatDate = 'DD MMMM YYYY';
  } else if (locale === 'zh-TW') {
    formatDate = 'YYYY MMM DD日';
  }

  const response = {
    id: result[0].person_id,
    ref_id: result[0].ref_id,
    name: result[0].name,
    birthday: dayjs(result[0].birthday).locale(locale).format(formatDate),
    deathday: dayjs(result[0].deathday).locale(locale).format(formatDate),
    place_of_birth: result[0].place_of_birth,
    image: `${AWS_CLOUDFRONT_DOMAIN}/images/people/${result[0].profile_image}`,
    biography: resultBiography,
    other_cast_movie: castMovie,
    other_crew_movie: crewMovie,
    locale: locale,
  };
  return response;
};

const showPersonDetail = async (req, res) => {
  const { locale } = req.query;

  try {
    const response = await getPersonDetail(req);
    res.status(200).render('person', {
      data: response,
      locale,
      locale_string: JSON.stringify(locale),
      lang: Lang[locale],
    });
  } catch (err) {
    res.status(404).render('404', { locale, lang: Lang[locale] });
  }
};

const showProfileReview = async (req, res) => {
  const { userId } = req.session;
  const { locale } = req.query;

  const resultAccount = await User.getUserById(userId);
  const resultReview = await User.getUserReview(userId);

  const info = [];
  for (const review of resultReview) {
    const resultMovie = await Movie.getMovieInfo(review.movie_id, locale);

    let formatDate;
    if (locale === 'en-US') {
      formatDate = 'MMMM DD YYYY hh:mm A';
    } else if (locale === 'fr-FR') {
      formatDate = 'DD MMMM YYYY HH:mm';
    } else if (locale === 'zh-TW') {
      formatDate = 'YYYY MMM DD日 HH:mm';
    }

    const result = {
      user_id: resultAccount.id,
      username: resultAccount.username,
      profile_image: `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${resultAccount.profile_image}`,
      review_id: review.id,
      review_title: review.title,
      content: review.content,
      image: `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${review.image}`,
      image_blurred: review.image_blurred,
      created_dt: dayjs(review.created_dt).locale(locale).format(formatDate),
      updated_dt: dayjs(review.updated_dt).locale(locale).format(formatDate),
      movie_id: resultMovie.movie_id,
      title: resultMovie.title,
      poster: `${AWS_CLOUDFRONT_DOMAIN}/images/posters/${resultMovie.poster_image}`,
    };

    info.push(result);
  }

  res.status(200).render('review_account', {
    data: info,
    locale,
    locale_string: JSON.stringify(locale),
    lang: Lang[locale],
  });
};

const showUserSavedReview = async (req, res) => {
  const { userId } = req.session;
  const { locale } = req.query;

  const resultSavedReview = await User.getUserSavedReview(userId);

  const info = [];
  for (const review of resultSavedReview) {
    const resultReview = await User.getReviewInfo(review.review_id);
    const resultAccount = await User.getUserById(resultReview[0].user_id);
    const resultMovie = await Movie.getMovieInfo(resultReview[0].movie_id, locale);

    let formatDate;
    if (locale === 'en-US') {
      formatDate = 'MMMM DD YYYY hh:mm A';
    } else if (locale === 'fr-FR') {
      formatDate = 'DD MMMM YYYY HH:mm';
    } else if (locale === 'zh-TW') {
      formatDate = 'YYYY MMM DD日 HH:mm';
    }

    const result = {
      user_id: resultAccount.id,
      username: resultAccount.username,
      profile_image: `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${resultAccount.profile_image}`,
      review_id: resultReview[0].id,
      review_title: resultReview[0].title,
      content: resultReview[0].content,
      image: `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${resultReview[0].image}`,
      created_dt: dayjs(resultReview[0].created_dt).locale(locale).format(formatDate),
      updated_dt: dayjs(resultReview[0].updated_dt).locale(locale).format(formatDate),
      movie_id: resultMovie.movie_id,
      movie_title: resultMovie.title,
      movie_poster: `${AWS_CLOUDFRONT_DOMAIN}/images/posters/${resultMovie.poster_image}`,
    };
    info.push(result);
  }

  res.status(200).render('saved_review', {
    data: info,
    locale,
    locale_string: JSON.stringify(locale),
    lang: Lang[locale],
  });
};

const showUserSavedMovie = async (req, res) => {
  const { userId, isAuth } = req.session;
  const { locale } = req.query;
  const resultSavedMovie = await User.getUserSavedMovie(userId);
  const info = [];

  for (const movie of resultSavedMovie) {
    const resultMovie = await User.getMovieInfo(movie.movie_id, locale);
    const result = {
      movie_id: resultMovie[0].movie_id,
      title: resultMovie[0].title,
      banner: `${AWS_CLOUDFRONT_DOMAIN}/images/banners/${resultMovie[0].banner_image}`,
      poster: `${AWS_CLOUDFRONT_DOMAIN}/images/posters/${resultMovie[0].poster_image}`,
    };
    info.push(result);
  }

  res.status(200).render('saved_movie', {
    data: info,
    locale,
    locale_string: JSON.stringify(locale),
    lang: Lang[locale],
    isAuth,
  });
};

const showAllReviews = async (req, res) => {
  const { locale } = req.query;
  const { isAuth } = req.session;

  const resultReview = await User.getAllReviews();

  const info = [];
  for (const review of resultReview) {
    const resultMovie = await Movie.getMovieInfo(review.movie_id, locale);
    const resultAccount = await User.getUserById(review.user_id);

    let formatDate;
    if (locale === 'en-US') {
      formatDate = 'MMMM DD YYYY hh:mm A';
    } else if (locale === 'fr-FR') {
      formatDate = 'DD MMMM YYYY HH:mm';
    } else if (locale === 'zh-TW') {
      formatDate = 'YYYY MMM DD日 HH:mm';
    }

    const result = {
      user_id: resultAccount.id,
      username: resultAccount.username,
      profile_image: `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${resultAccount.profile_image}`,
      review_id: review.id,
      content: review.content,
      review_title: review.title,
      image: `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${review.image}`,
      image_blurred: review.image_blurred,
      created_dt: dayjs(review.created_dt).locale(locale).format(formatDate),
      updated_dt: dayjs(review.updated_dt).locale(locale).format(formatDate),
      movie_id: resultMovie.movie_id,
      title: resultMovie.title,
      banner: `${AWS_CLOUDFRONT_DOMAIN}/images/banners/${resultMovie.banner_image}`,
      poster: `${AWS_CLOUDFRONT_DOMAIN}/images/posters/${resultMovie.poster_image}`,
    };

    info.push(result);
  }

  res.render('review_all', {
    data: info,
    locale,
    locale_string: JSON.stringify(locale),
    lang: Lang[locale],
    isAuth,
  });
};

const getReviewInfo = async (req) => {
  const { id, locale } = req.query;

  const resultReview = await User.getReviewById(id);

  const info = [];
  for (const review of resultReview) {
    const resultMovie = await Movie.getMovieInfo(review.movie_id, locale);
    const resultAccount = await User.getUserById(review.user_id);

    let formatDate;
    if (locale === 'en-US') {
      formatDate = 'MMMM DD YYYY hh:mm A';
    } else if (locale === 'fr-FR') {
      formatDate = 'DD MMMM YYYY HH:mm';
    } else if (locale === 'zh-TW') {
      formatDate = 'YYYY MMM DD日 HH:mm';
    }

    const result = {
      user_id: resultAccount.id,
      username: resultAccount.username,
      profile_image: `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${resultAccount.profile_image}`,
      review_id: review.id,
      review_title: review.title,
      content: review.content,
      image: `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${review.image}`,
      image_blurred: review.image_blurred,
      created_dt: dayjs(review.created_dt).locale(locale).format(formatDate),
      updated_dt: dayjs(review.updated_dt).locale(locale).format(formatDate),
      movie_id: resultMovie.movie_id,
      title: resultMovie.title,
      banner: `${AWS_CLOUDFRONT_DOMAIN}/images/banners/${resultMovie.banner_image}`,
      poster: `${AWS_CLOUDFRONT_DOMAIN}/images/posters/${resultMovie.poster_image}`,
    };

    info.push(result);
  }

  return info;
};

const showReviewById = async (req, res) => {
  const { locale } = req.query;
  const { isAuth } = req.session;

  try {
    const response = await getReviewInfo(req);
    res.render('review_info', {
      data: response,
      locale,
      locale_string: JSON.stringify(locale),
      lang: Lang[locale],
      isAuth,
    });
  } catch (err) {
    res.status(404).render('404', { locale, lang: Lang[locale], isAuth });
  }
};

const showReviewWhenUpdate = async (req, res) => {
  const { locale } = req.query;
  const { isAuth } = req.session;

  try {
    const response = await getReviewInfo(req);
    res.render('review_update', {
      data: response,
      locale,
      locale_string: JSON.stringify(locale),
      lang: Lang[locale],
      isAuth,
    });
  } catch (err) {
    res.status(404).render('404', { locale, lang: Lang[locale], isAuth });
  }
};

const getReviewByMovieId = async (req) => {
  const { id, locale } = req.query;
  const { userId, isAuth } = req.session;

  const info = [];
  const movie = [];
  const resultReview = await Page.getReviewByMovieId(id);
  const resultMovie = await Movie.getMovieInfo(id, locale);

  const movieInfo = {
    movie_id: resultMovie.movie_id,
    title: resultMovie.title,
    banner: `${AWS_CLOUDFRONT_DOMAIN}/images/banners/${resultMovie.banner_image}`,
    poster: `${AWS_CLOUDFRONT_DOMAIN}/images/posters/${resultMovie.poster_image}`,
  };
  movie.push(movieInfo);

  for (const review of resultReview) {
    const resultAccount = await User.getUserById(review.user_id);

    let formatDate;
    if (locale === 'en-US') {
      formatDate = 'MMMM DD YYYY hh:mm A';
    } else if (locale === 'fr-FR') {
      formatDate = 'DD MMMM YYYY HH:mm';
    } else if (locale === 'zh-TW') {
      formatDate = 'YYYY MMM DD日 HH:mm';
    }

    // check if user sign in
    let savedReview = false;
    if (isAuth) {
      const resultSaved = await User.checkUserSavedReview(userId, review.id);
      if (resultSaved) {
        savedReview = true;
      }
    }

    const result = {
      user_id: resultAccount.id,
      username: resultAccount.username,
      profile_image: `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${resultAccount.profile_image}`,
      review_id: review.id,
      review_title: review.title,
      content: review.content,
      image: `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${review.image}`,
      image_blurred: review.image_blurred,
      created_dt: dayjs(review.created_dt).locale(locale).format(formatDate),
      updated_dt: dayjs(review.updated_dt).locale(locale).format(formatDate),
      user_saved_review: savedReview,
      // movie_id: resultMovie.movie_id,
      // title: resultMovie.title,
      // banner: `${SERVER_IP}/public/assets/images/banners/${resultMovie.banner_image}`,
      // poster: `${SERVER_IP}/public/assets/images/posters/${resultMovie.poster_image}`,
    };
    info.push(result);
  }

  return { info, movie };
};

const showReviewByMovieId = async (req, res) => {
  const { id, locale } = req.query;
  const { isAuth } = req.session;

  try {
    const response = await getReviewByMovieId(req);

    res.render('review_movie', {
      data: response,
      movie_id: id,
      locale,
      locale_string: JSON.stringify(locale),
      lang: Lang[locale],
      isAuth,
    });
  } catch (err) {
    res.status(404).render('404', { locale, lang: Lang[locale], isAuth });
  }
};

const showSearchMovie = async (req, res) => {
  const { keyword, genreId, locale } = req.query;
  const { isAuth } = req.session;

  try {
    const resultSearch = await Movie.getMovieListByFilter(keyword, genreId, locale);

    const result = [];
    for (const movie of resultSearch) {
      const info = {
        movie_id: movie.movie_id,
        title: movie.title,
        banner: `${AWS_CLOUDFRONT_DOMAIN}/images/banners/${movie.banner_image}`,
        poster: `${AWS_CLOUDFRONT_DOMAIN}/images/posters/${movie.poster_image}`,
      };

      result.push(info);
    }

    if (!result.length || !resultSearch.length) {
      res.status(200).render('search', { data: 'empty', locale, locale_string: JSON.stringify(locale) });
      return;
    }

    res.status(200).render('search', {
      data: result,
      locale,
      locale_string: JSON.stringify(locale),
      lang: Lang[locale],
      isAuth,
    });
  } catch (err) {
    res.status(404).render('404', { locale, lang: Lang[locale], isAuth });
  }
};

const showProfile = async (req, res) => {
  const { locale } = req.query;
  const { isAuth } = req.session;

  res.render('profile', {
    data: {
      user_id: req.session.userId,
      username: req.session.userName,
      user_email: req.session.userEmail,
      user_picture: req.session.picture,
    },
    locale,
    locale_string: JSON.stringify(locale),
    lang: Lang[locale],
    isAuth,
  });
};

module.exports = {
  showMovieListInfo,
  showMovieInfo,
  showMovieInfoForReview,
  showPersonDetail,
  showProfileReview,
  showUserSavedReview,
  showUserSavedMovie,
  showAllReviews,
  showReviewById,
  showReviewWhenUpdate,
  showReviewByMovieId,
  showSearchMovie,
  showProfile,
};
