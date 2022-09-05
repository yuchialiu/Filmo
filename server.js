require('dotenv').config();
const { API_VERSION } = process.env;

// Express Initialization
const express = require('express');
const app = express();

app.set('view engine', 'pug');

app.use(express.static('public'));
app.use('/public', express.static('public'));

// app.get('/', (req, res) => {
//   res.render('index');
// });

app.use('/', [require('./server/routes/index_route')]);

// API Routes
app.use('/api/' + API_VERSION, [require('./server/routes/admin_route')]);

// Server Port
const port = 3000;
app.listen(port, () => {
  console.log(`server.js listening on port ${port}`);
});
