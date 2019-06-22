'use strict';

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Application Middleware
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

// Method overide
app.use(methodOverride((request, response) => {
  if (request.body && typeof request.body === 'object' && '_method' in request.body) {
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}));

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// API Routes:

// Renders the home page
app.get('/', renderHomepage);

// details of single book
app.get('/books/:id', viewBookDetails);

// Renders the search form
app.get('/searches/new', newSearch);

// Creates a new search to the Google Books API
app.post('/searches', createSearch);

// Save book info to DB
app.post('/books', createBook);

// Update book info in DB
app.put('/books/:id', updateBook);

// Delete book from DB
app.delete('/books/:id', deleteBook);

// arguments pulled out, refactor to use inline as needed
const path = '*';

function pathNotFoundHandler(request, response) {
  return response.status(404).send('This route does not exist');
}

app.get(path, pathNotFoundHandler);

// Catch-all
app.get('*', (request, response) => response.status(404).send('This route does not exist'));

// HELPER FUNCTIONS
function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';

  let httpRegex = /^(https:\/\/)?g/

  this.authors = info.authors || 'No author available';
  this.title = info.title ? info.title : 'No title available';
  this.isbn = info.industryIdentifiers ? `isbn_13 ${info.industryIdentifiers[0].identifier}` : 'No isbn available';
  this.image_url = info.imageLinks ? info.imageLinks.thumbnail.replace(httpRegex, 'https') : placeholderImage;
  this.description = info.description ? info.description : 'No description available';
}

function viewBookDetails(request, response) {
  let SQL ='SELECT * FROM books WHERE id = $1;';
  let values = [request.params.id];

  return client.query(SQL, values)
    .then(result => {
      return response.render('pages/books/detail', {book: result.rows[0]});
    })
    .catch(error => handleError(error, response));
}

function createBook(request, response){
  console.log(request.body);
  let { author, title, isbn, image_url, description, bookshelf } = request.body;
  let SQL = 'INSERT INTO books(author, title, isbn, image_url, description, bookshelf) VALUES($1, $2, $3, $4, $5, $6) RETURNING id;';
  let values = [author, title, isbn, image_url, description, bookshelf];

  return client.query(SQL, values)
    .then(sqlResults => {
      response.redirect(`/books/${sqlResults.rows[0].id}`)
    })
    .catch(error => handleError(error, response));
}

function newSearch(request, response) {
  response.render('pages/searches/new');
}

function updateBook (request, response) {
  let { author, title, isbn, image_url, description, bookshelf } = request.body;
  let SQL = `UPDATE books SET  author=$1, title=$2, isbn=$3, image_url=$4, description=$5, bookshelf=$6 WHERE id=$7;`;
  let values = [author, title, isbn, image_url, description, bookshelf, request.params.id];

  client.query(SQL, values)
    .then(response.redirect(`/books/${request.params.id}`))
    .catch(err => handleError(err, response));
}

function deleteBook(request, response) {
  let SQL = 'DELETE FROM books WHERE id=$1;';
  let values = [request.params.id];

  return client.query(SQL, values)
    .then(response.redirect('/'))
    .catch(err => handleError(err, response));
}

function renderHomepage(request, response) {
  let SQL = `SELECT * FROM books`;

  return client.query(SQL)
    .then(results => {
      response.render('pages/index', {results: results.rows})
    })
    // .catch(error => handleError(error, response));
}


// No API key required
function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  // console.log('this is request body!', request.body);
  // console.log('this is request body search', request.body.search);
  // console.log('Test', request.body.search[1]);

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }
  // console.log('url', url);

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => {
      let bookArr = new Book(bookResult.volumeInfo);
      // console.log(bookArr);
      return bookArr;
    })
    
    )

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
