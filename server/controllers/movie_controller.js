const Movie = require('../models/movie_model');

const showMain = async (req, res) => {
  const result = await Movie.getMovieData();

  res.render('index', { data: result[0] });
};

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
  const movieId = req.query.id;
  // const locale = req.query.locale;
  const locale = 'en-US';
  const limit = 5;
  const movieList = await Movie.getMovieListInfo(locale, limit);

  // format result
  let result = [];
  for (i in movieList) {
    let info = {
      name: movieList[i].name,
      // add field
    };

    result.push(info);
  }

  const response = {
    data: result,
  };
};

const getMovieInfo = async (req, res) => {
  const movieId = req.query.id;

  const result = await Movie.getMovieInfo(movieId);
  // Movie.getCastInfoByMovieId
  // Movie.getCrewInfoByMovieId
  // format result
  const response = {
    data: result,
  };
};

const getPersonDetail = async (req, res) => {
  // Movie.getPersonDetail
};

const searchMovie = async (req, res) => {
  // Movie.getMovieListByFilter
};

module.exports = { getMovieListInfo, getMovieInfo, getPersonDetail, searchMovie };
