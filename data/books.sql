DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS bookshelves;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255),
  title VARCHAR(255),
  isbn VARCHAR(255),
  image_url VARCHAR(255),
  description TEXT,
  bookshelf TEXT
);

CREATE TABLE bookshelves (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255)
);

INSERT INTO books (author, title, isbn, image_url, description, bookshelf) 
VALUES('Fred Grant','History of Seattle','ISBN_10', 'http://books.google.com/books/content?id=YK3yZNFmdbUC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'Operating for 29 years, the Seattle...','Love this one!');

INSERT INTO books (author, title, isbn, image_url, description, bookshelf) 
VALUES('Mark Arnold','The Best of the Harveyville Fun Times','1477259864', 'http://books.google.com/books/content?id=vDllrEsYLAMC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'A sampling of the best material...','Super fun times');

INSERT INTO bookshelves(name) SELECT DISTINCT bookshelf FROM books;

ALTER TABLE books ADD COLUMN bookshelf_id INT;

UPDATE books SET bookshelf_id=shelf.id FROM (SELECT * FROM bookshelves) AS shelf WHERE books.bookshelf = shelf.name;

ALTER TABLE books DROP COLUMN bookshelf;

ALTER TABLE books ADD CONSTRAINT fk_bookshelves FOREIGN KEY (bookshelf_id) REFERENCES bookshelves(id);