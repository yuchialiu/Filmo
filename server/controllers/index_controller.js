const Index = require('../models/index_model');

const showMain = async (req, res) => {
  const result = await Index.getMovieData();

  res.render('index', { data: result[0] });
};

const showDetail = async (req, res) => {
  const result = await Index.getMovieDetails(7);
  res.render('detail', { data: result[0] });
};

const getMovieData = async (req, res) => {
  const result = await Index.getMovieData();
  const response = {
    data: result,
  };
};

const getMovieDetails = async (req, res) => {
  const result = await Index.getMovieData(movieId);
  const response = {
    data: result,
  };
};

module.exports = { showMain, showDetail, getMovieData, getMovieDetails };
