'use strict';

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

// app.post('/contact', (request, response) => {
//   console.log(request.body);
//   response.sendFile('./thanks.html', {root: './public'});
// });

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// Test route
app.get('/', (request, response) => {
  response.render('pages/index', { message: 'Woohoo'});
})

// arguments pulled out, refactor to use inline as needed
const path = '*';

function pathNotFoundHandler(request, response) {
  return response.status(404).send('This route does not exist');
}

app.get(path, pathNotFoundHandler);

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
