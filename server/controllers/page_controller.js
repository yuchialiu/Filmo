/* eslint-disable object-shorthand */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
const { AWS_CLOUDFRONT_DOMAIN } = process.env;
const dayjs = require('dayjs');
require('dayjs/locale/fr');
require('dayjs/locale/zh-tw');
const User = require('../models/user_model');
const Movie = require('../models/movie_model');
const Page = require('../models/page_model');
const lang = require('../../util/language');

const showMovieListInfo = async (req, res) => {
  const { locale } = req.query;
  // const limit = 100;
  // const movieList = await Movie.getMovieListInfo(locale, limit);
  const movieList = await Movie.getMovieListInfo(locale);

  const result = [];
  for (const i in movieList) {
    const info = {
      movie_id: movieList[i].movie_id,
      title: movieList[i].title,
      banner: `${AWS_CLOUDFRONT_DOMAIN}/images/banners/${movieList[i].banner_image}`,
      poster: `${AWS_CLOUDFRONT_DOMAIN}/images/posters/${movieList[i].poster_image}`,
      trailer_embed: `https://www.youtube.com/embed/${movieList[i].trailer}?rel=0`,
      trailer_watch: `https://www.youtube.com/watch?v=${movieList[i].trailer}?rel=0`,
      trailer: movieList[i].trailer,
    };

    result.push(info);
  }

  res.status(200).render('index', {
    data: result,
    locale,
    locale_string: JSON.stringify(locale),
    lang: lang[locale],
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
  for (const i in resultCast) {
    const resultPerson = await Movie.getPersonDetail(resultCast[i].person_id, locale);

    const cast = {
      person_id: resultCast[i].person_id,
      cast_id: resultCast[i].id,
      character: resultCast[i].character,
      name: resultCast[i].name,
      image: `${AWS_CLOUDFRONT_DOMAIN}/images/people/${resultPerson[0].profile_image}`,
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
    } else {
      savedMovie = false;
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
    // locale: locale,
    user_saved_movie: savedMovie,
  };
  return response;
};

const showMovieInfo = async (req, res) => {
  const { locale } = req.query;

  try {
    const response = await getMovieInfo(req);
    res.status(200).render('movie', {
      data: response,
      locale,
      locale_string: JSON.stringify(locale),
      lang: lang[locale],
    });
  } catch (err) {
    res.status(404).render('404', { locale, lang: lang[locale] });
  }
};

const showMovieInfoForReview = async (req, res) => {
  const { locale } = req.query;

  try {
    const response = await getMovieInfo(req);
    res.status(200).render('review_submit', {
      data: response,
      locale,
      locale_string: JSON.stringify(locale),
      lang: lang[locale],
    });
  } catch (err) {
    res.status(404).render('404', { locale, lang: lang[locale] });
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
  for (const i in resultCast) {
    const resultCharacter = await Movie.getCharacterByCastId(resultCast[i].cast_id, locale);
    const movie = {
      movie_id: resultCast[i].movie_id,
      title: resultCast[i].title,
      poster: `${AWS_CLOUDFRONT_DOMAIN}/images/posters/${resultCast[i].poster_image}`,
      character: resultCharacter[0].character,
    };

    castMovie.push(movie);
  }

  const crewMovie = [];
  for (const i in resultCrew) {
    const resultJob = await Movie.getJobByCrewId(resultCrew[i].crew_id, locale);
    const movie = {
      movie_id: resultCrew[i].movie_id,
      title: resultCrew[i].title,
      poster: `${AWS_CLOUDFRONT_DOMAIN}/images/posters/${resultCrew[i].poster_image}`,
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
    formatDate = 'YYYY MMM DD' + '日';
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
      lang: lang[locale],
    });
  } catch (err) {
    res.status(404).render('404', { locale, lang: lang[locale] });
  }
};

const showProfileReview = async (req, res) => {
  const { userId } = req.session;
  const { locale } = req.query;

  const resultReview = await User.getUserReview(userId);
  const resultAccount = await User.getUserById(userId);

  const info = [];
  for (const i in resultReview) {
    const resultMovie = await Movie.getMovieInfo(resultReview[i].movie_id, locale);

    let formatDate;
    if (locale === 'en-US') {
      formatDate = 'MMMM DD YYYY' + ' ' + 'hh:mm A';
    } else if (locale === 'fr-FR') {
      formatDate = 'DD MMMM YYYY' + ' ' + 'HH:mm';
    } else if (locale === 'zh-TW') {
      formatDate = 'YYYY MMM DD' + '日' + ' ' + 'HH:mm';
    }

    const result = {
      user_id: resultAccount.id,
      username: resultAccount.username,
      profile_image: `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${resultAccount.profile_image}`,
      review_id: resultReview[i].id,
      review_title: resultReview[i].title,
      content: resultReview[i].content,
      image: `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${resultReview[i].image}`,
      image_blurred: resultReview[i].image_blurred,
      // user_id: resultReview[i].user_id,
      created_dt: dayjs(resultReview[i].created_dt).locale(locale).format(formatDate),
      updated_dt: dayjs(resultReview[i].updated_dt).locale(locale).format(formatDate),
      movie_id: resultMovie.movie_id,
      title: resultMovie.title,
      poster: `${AWS_CLOUDFRONT_DOMAIN}/images/posters/${resultMovie.poster_image}`,
      // locale: locale,
    };

    info.push(result);
  }

  res.status(200).render('review_account', {
    data: info,
    locale,
    locale_string: JSON.stringify(locale),
    lang: lang[locale],
  });
};

const showUserSavedReview = async (req, res) => {
  const { userId } = req.session;
  const { locale } = req.query;

  const resultSavedReview = await User.getUserSavedReview(userId);

  const info = [];

  for (const i in resultSavedReview) {
    const resultReview = await User.getReviewInfo(resultSavedReview[i].review_id);
    const resultAccount = await User.getUserById(resultSavedReview[i].user_id);

    for (const j in resultReview) {
      const resultMovie = await Movie.getMovieInfo(resultReview[j].movie_id, locale);

      let formatDate;
      if (locale === 'en-US') {
        formatDate = 'MMMM DD YYYY' + ' ' + 'hh:mm A';
      } else if (locale === 'fr-FR') {
        formatDate = 'DD MMMM YYYY' + ' ' + 'HH:mm';
      } else if (locale === 'zh-TW') {
        formatDate = 'YYYY MMM DD' + '日' + ' ' + 'HH:mm';
      }

      const result = {
        user_id: resultAccount.id,
        username: resultAccount.username,
        profile_image: `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${resultAccount.profile_image}`,
        review_id: resultReview[j].id,
        review_title: resultReview[j].title,
        content: resultReview[j].content,
        image: `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${resultReview[j].image}`,
        created_dt: dayjs(resultReview[j].created_dt).locale(locale).format(formatDate),
        updated_dt: dayjs(resultReview[j].updated_dt).locale(locale).format(formatDate),
        movie_id: resultMovie.movie_id,
        movie_title: resultMovie.title,
        movie_poster: `${AWS_CLOUDFRONT_DOMAIN}/images/posters/${resultMovie.poster_image}`,
      };
      info.push(result);
    }
  }

  res.status(200).render('saved_review', {
    data: info,
    locale,
    locale_string: JSON.stringify(locale),
    lang: lang[locale],
  });
};

const showUserSavedMovie = async (req, res) => {
  const { userId } = req.session;
  const { locale } = req.query;
  const resultSavedMovie = await User.getUserSavedMovie(userId);
  const info = [];

  for (const i in resultSavedMovie) {
    const resultMovie = await User.getMovieInfo(resultSavedMovie[i].movie_id, locale);
    for (const j in resultMovie) {
      const result = {
        movie_id: resultMovie[j].movie_id,
        title: resultMovie[j].title,
        banner: `${AWS_CLOUDFRONT_DOMAIN}/images/banners/${resultMovie[j].banner_image}`,
        poster: `${AWS_CLOUDFRONT_DOMAIN}/images/posters/${resultMovie[j].poster_image}`,
      };
      info.push(result);
    }
  }

  res.status(200).render('saved_movie', {
    data: info,
    locale,
    locale_string: JSON.stringify(locale),
    lang: lang[locale],
  });
};

const showAllReviews = async (req, res) => {
  const { locale } = req.query;

  const resultReview = await User.getAllReviews();

  const info = [];
  for (const i in resultReview) {
    const resultMovie = await Movie.getMovieInfo(resultReview[i].movie_id, locale);
    const resultAccount = await User.getUserById(resultReview[i].user_id);

    let formatDate;
    if (locale === 'en-US') {
      formatDate = 'MMMM DD YYYY' + ' ' + 'hh:mm A';
    } else if (locale === 'fr-FR') {
      formatDate = 'DD MMMM YYYY' + ' ' + 'HH:mm';
    } else if (locale === 'zh-TW') {
      formatDate = 'YYYY MMM DD' + '日' + ' ' + 'HH:mm';
    }

    const result = {
      user_id: resultAccount.id,
      username: resultAccount.username,
      profile_image: `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${resultAccount.profile_image}`,
      review_id: resultReview[i].id,
      content: resultReview[i].content,
      review_title: resultReview[i].title,
      image: `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${resultReview[i].image}`,
      image_blurred: resultReview[i].image_blurred,
      created_dt: dayjs(resultReview[i].created_dt).locale(locale).format(formatDate),
      updated_dt: dayjs(resultReview[i].updated_dt).locale(locale).format(formatDate),
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
    lang: lang[locale],
  });
};

const getReviewInfo = async (req) => {
  const { id, locale } = req.query;

  const resultReview = await User.getReviewById(id);

  const info = [];
  for (const i in resultReview) {
    const resultMovie = await Movie.getMovieInfo(resultReview[i].movie_id, locale);
    const resultAccount = await User.getUserById(resultReview[i].user_id);

    let formatDate;
    if (locale === 'en-US') {
      formatDate = 'MMMM DD YYYY' + ' ' + 'hh:mm A';
    } else if (locale === 'fr-FR') {
      formatDate = 'DD MMMM YYYY' + ' ' + 'HH:mm';
    } else if (locale === 'zh-TW') {
      formatDate = 'YYYY MMM DD' + '日' + ' ' + 'HH:mm';
    }

    const result = {
      user_id: resultAccount.id,
      username: resultAccount.username,
      profile_image: `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${resultAccount.profile_image}`,
      review_id: resultReview[i].id,
      review_title: resultReview[i].title,
      content: resultReview[i].content,
      image: `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${resultReview[i].image}`,
      image_blurred: resultReview[i].image_blurred,
      created_dt: dayjs(resultReview[i].created_dt).locale(locale).format(formatDate),
      updated_dt: dayjs(resultReview[i].updated_dt).locale(locale).format(formatDate),
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

  try {
    const response = await getReviewInfo(req);
    res.render('review_info', {
      data: response,
      locale,
      locale_string: JSON.stringify(locale),
      lang: lang[locale],
    });
  } catch (err) {
    res.status(404).render('404', { locale, lang: lang[locale] });
  }
};

const showReviewWhenUpdate = async (req, res) => {
  const { locale } = req.query;

  try {
    const response = await getReviewInfo(req);
    res.render('review_update', {
      data: response,
      locale,
      locale_string: JSON.stringify(locale),
      lang: lang[locale],
    });
  } catch (err) {
    res.status(404).render('404', { locale, lang: lang[locale] });
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

  for (const i in resultReview) {
    const resultAccount = await User.getUserById(resultReview[i].user_id);

    let formatDate;
    if (locale === 'en-US') {
      formatDate = 'MMMM DD YYYY' + ' ' + 'hh:mm A';
    } else if (locale === 'fr-FR') {
      formatDate = 'DD MMMM YYYY' + ' ' + 'HH:mm';
    } else if (locale === 'zh-TW') {
      formatDate = 'YYYY MMM DD' + '日' + ' ' + 'HH:mm';
    }

    // check if user saved review
    let savedReview = false;
    if (isAuth) {
      const resultSaved = await User.checkUserSavedReview(userId, resultReview[i].id);
      if (resultSaved) {
        savedReview = true;
      } else {
        savedReview = false;
      }
    }

    const result = {
      user_id: resultAccount.id,
      username: resultAccount.username,
      profile_image: `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${resultAccount.profile_image}`,
      review_id: resultReview[i].id,
      review_title: resultReview[i].title,
      content: resultReview[i].content,
      image: `${AWS_CLOUDFRONT_DOMAIN}/images/uploads/${resultReview[i].image}`,
      image_blurred: resultReview[i].image_blurred,
      created_dt: dayjs(resultReview[i].created_dt).locale(locale).format(formatDate),
      updated_dt: dayjs(resultReview[i].updated_dt).locale(locale).format(formatDate),
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

  try {
    const response = await getReviewByMovieId(req);

    res.render('review_movie', {
      data: response,
      movie_id: id,
      locale,
      locale_string: JSON.stringify(locale),
      lang: lang[locale],
    });
  } catch (err) {
    res.status(404).render('404', { locale, lang: lang[locale] });
  }
};

const showSearchMovie = async (req, res) => {
  const { keyword, genreId, locale } = req.query;

  try {
    const resultSearch = await Movie.getMovieListByFilter(keyword, genreId, locale);

    const result = [];
    for (const i in resultSearch) {
      const info = {
        movie_id: resultSearch[i].movie_id,
        title: resultSearch[i].title,
        banner: `${AWS_CLOUDFRONT_DOMAIN}/images/banners/${resultSearch[i].banner_image}`,
        poster: `${AWS_CLOUDFRONT_DOMAIN}/images/posters/${resultSearch[i].poster_image}`,
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
      lang: lang[locale],
    });
  } catch (err) {
    res.status(404).render('404', { locale, lang: lang[locale] });
  }
};

const showProfile = async (req, res) => {
  const { locale } = req.query;

  res.render('profile', {
    data: {
      user_id: req.session.userId,
      username: req.session.userName,
      user_email: req.session.userEmail,
      user_picture: req.session.picture,
    },
    locale,
    locale_string: JSON.stringify(locale),
    lang: lang[locale],
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
