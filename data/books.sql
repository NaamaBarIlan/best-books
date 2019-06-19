DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255),
  title VARCHAR(255),
  ISBN VARCHAR(255),
  image_url VARCHAR(255),
  description TEXT,
  bookshelf TEXT
);

INSERT INTO books (author, title, ISBN, image_url, description, bookshelf) 
VALUES('Fred Grant','History of Seattle','ISBN_10', 'http://books.google.com/books/content?id=YK3yZNFmdbUC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'Operating for 29 years, the Seattle...','Love this one!');

INSERT INTO books (author, title, ISBN, image_url, description, bookshelf) 
VALUES('Mark Arnold','The Best of the Harveyville Fun Times','1477259864', 'http://books.google.com/books/content?id=vDllrEsYLAMC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'A sampling of the best material...','Super fun times');
