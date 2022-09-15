require('dotenv').config();

const { API_VERSION, SERVER_IP } = process.env;

// Express Initialization
const express = require('express');

const app = express();

app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/profile', (req, res) => {
  res.render('profile');
});

app.get('/login', (req, res) => {
  res.render('login');
});

// app.get('/review', (req, res) => {
//   res.render('review_all');
// });

app.get('/movie', (req, res) => {
  res.render('movie', { id: req.query.id, locale: req.query.locale });
});

app.get('/person', (req, res) => {
  res.render('person', { person_id: req.query.id, locale: req.query.locale });
});

// TODO:
app.get('/profile_review', (req, res) => {
  res.render('review_account');
});

app.get('/user_store_review', (req, res) => {
  res.render('saved_review');
});

app.get('/user_store_movie', (req, res) => {
  res.render('saved_movie');
});

app.use('/', [require('./server/routes/user_route')]);

// API Routes
app.use(`/api/${API_VERSION}`, [require('./server/routes/crawler_route'), require('./server/routes/user_route'), require('./server/routes/movie_route')]);

// Server Port
const port = 3000;
app.listen(port, () => {
  console.log(`server.js listening on port ${port}`);
});
