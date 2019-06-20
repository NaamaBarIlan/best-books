'use strict';

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Application Middleware
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// API Routes:

// Renders the search form
app.get('/searches/new', newSearch);

// Creates a new search to the Google Books API
app.post('/searches', createSearch);


// Renders the home page
app.get('/', (request, response) => {
  let SQL = `SELECT * FROM books`;

  return client.query(SQL)
    .then(results => {
      // TODO: add an if/else here --->
      // if (results.rowCount === 0) {
      // res.render('pages/searches/new')
      // } else {
      // res.render('pages/index', {books:result.row});
      // }
      console.log('!!!!! results.rows', results.rows); 
      console.log('!!!!! results.rows.length', results.rows.length) ;
      response.render('pages/index', {results: results.rows})
    })
    // TODO: add .catch(err => handleError(err, res));
});


// Test route
// app.get('/', (request, response) => {
//   response.render('pages/index', { message: 'Woohoo'});
// })

// arguments pulled out, refactor to use inline as needed
const path = '*';

function pathNotFoundHandler(request, response) {
  return response.status(404).send('This route does not exist');
}

app.get(path, pathNotFoundHandler);

// Catch-all
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

// HELPER FUNCTIONS
// Only show part of this to get students started
function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';

  let httpRegex = /^(https:\/\/)?g/

  this.authors = info.authors || 'No author available';
  this.title = info.title ? info.title : 'No title available';
  this.isbn = info.industryIdentifiers ? `ISBN_13 ${info.industryIdentifiers[0].identifier}` : 'No ISBN available';
  this.image = info.imageLinks ? info.imageLinks.thumbnail.replace(httpRegex, 'https') : placeholderImage;
  this.description = info.description ? info.description : 'No description available';
}

// Note that .ejs file extension is not required
function newSearch(request, response) {
  response.render('pages/searches/new');
}

// No API key required
function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  console.log('this is request body!', request.body);
  console.log('this is request body search', request.body.search);
  console.log('Test', request.body.search[1]);

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }
  console.log('url', url);

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', {searchResults: results}))
    .catch(error => handleError(error, response));
  // console.log('result', );
}

// Error handling
function handleError(error, response) {
  console.error(error);
  response.status(500).send('Sorry, something went wrong')
}

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
