require('dotenv').config();
const axios = require('axios');
const { TMDB_Key } = process.env;
const Certification = require('../models/certification_model');

const insertCertification = async (req, res) => {
  const { data } = await axios.get(`https://api.themoviedb.org/3/certification/movie/list?api_key=${TMDB_Key}`);
  const result = await Certification.insertCertification(data.certifications);

  if (result == 'failed') {
    res.status(500).send({ error: 'insert error' });
  } else {
    res.status(200).send({ response: 'inserted' });
  }
};

module.exports = {
  insertCertification,
};
