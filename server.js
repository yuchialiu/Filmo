require('dotenv').config();
const { API_VERSION } = process.env;

// Express Initialization
const express = require('express');
const app = express();

app.use(express.static('public'));

// API Routes
app.use('/api/' + API_VERSION, [require('./server/routes/genre_route')]);

// Server Port
const port = 3000;
app.listen(port, () => {
  console.log(`server.js listening on port ${port}`);
});
