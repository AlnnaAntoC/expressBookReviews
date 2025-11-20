const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

/********************
 * User Registration
 ********************/
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (!isValid(username)) {
        return res.status(409).json({ message: "Username already exists." });
    }

    users.push({ username, password });
    return res.status(201).json({ message: `User '${username}' registered successfully.` });
});

/********************
 * Get All Books
 ********************/
public_users.get("/", (req, res) => {
    return res.status(200).send(JSON.stringify(books, null, 2));
});

/********************
 * Get Book by ISBN
 ********************/
public_users.get("/isbn/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn] || books[Number(isbn)];

    if (!book) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
    return res.status(200).json(book);
});

/********************
 * Get Book by Author
 ********************/
public_users.get("/author/:author", (req, res) => {
    const authorName = req.params.author.trim().toLowerCase();
    const matchedBooks = Object.keys(books)
        .filter(key => books[key].author?.toLowerCase() === authorName)
        .map(key => ({ isbn: key, ...books[key] }));

    if (matchedBooks.length === 0)
        return res.status(404).json({ message: `No books found for author: ${req.params.author}` });

    return res.status(200).json(matchedBooks);
});

/********************
 * Get Book by Title
 ********************/
public_users.get("/title/:title", (req, res) => {
    const titleName = req.params.title.trim().toLowerCase();
    const matchedBooks = Object.keys(books)
        .filter(key => books[key].title?.toLowerCase() === titleName)
        .map(key => ({ isbn: key, ...books[key] }));

    if (matchedBooks.length === 0)
        return res.status(404).json({ message: `No books found with title: ${req.params.title}` });

    return res.status(200).json(matchedBooks);
});

/********************
 * Get Reviews
 ********************/
public_users.get("/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn] || books[Number(isbn)];

    if (!book) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }

    return res.status(200).json({ isbn, reviews: book.reviews });
});

module.exports = public_users;
