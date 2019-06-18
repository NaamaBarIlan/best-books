'use strict';

// Application Dependencies
const express = require('express');
const superagent = require('superagent');

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Application Middleware
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// API Routes
// Renders the search form
app.get('/', newSearch);

// Creates a new search to the Google Books API
app.post('/searches', createSearch);

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
  // const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';

  this.authors = info.authors || 'No author available';
  this.title = info.title || 'No title available';
  this.image = info.imageLinks.thumbnail;
}

// Note that .ejs file extension is not required
function newSearch(request, response) {
  response.render('pages/index');
}

// // No API key required
// // Console.log request.body and request.body.search
function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  console.log('this is request body!', request.body);
  console.log('this is request body search', request.body.search);
  console.log('TEst', request.body.search[1]);


  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }
  console.log('url', url);


  // WARNING: won't work as is. Why not?
  superagent.get(url)
    .then(apiResponse => {
      let bookArray = apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo))
      console.log('testimage', bookArray);
      return bookArray;
    })

    .then(results => response.render('pages/searches/show', {searchResults: results}));

  // console.log('result', );
//   // how will we handle errors?
}

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
