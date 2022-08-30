require('dotenv').config();


// Express Initialization
const express = require('express');
const app = express();

app.use(express.static('public'));

// Server Port
const port = 3000;
app.listen(port, () => {
  console.log(`server.js listening on port ${port}`);
});