const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();
const axios = require('axios'); // Add at top if not already


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
 * Get All Books (Async)
 ********************/
public_users.get("/books-async", async (req, res) => {
    try {
        // Simulate async operation
        const allBooks = await new Promise((resolve, reject) => {
            if (books) resolve(books);
            else reject("Books data not found");
        });
        res.status(200).json(allBooks);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books", error });
    }
});





/********************
 * Get Book by ISBN (Async/Await)
 ********************/
public_users.get("/isbn-async/:isbn", async (req, res) => {
    try {
        const isbn = req.params.isbn;

        const book = await new Promise((resolve, reject) => {
            if (books[isbn] || books[Number(isbn)]) {
                resolve(books[isbn] || books[Number(isbn)]);
            } else {
                reject(`Book with ISBN ${isbn} not found`);
            }
        });

        res.status(200).json(book);
    } catch (error) {
        res.status(404).json({ message: error });
    }
});

/********************
 * Get Books by Author (Async/Await)
 ********************/
public_users.get("/author-async/:author", async (req, res) => {
    try {
        const authorName = req.params.author.trim().toLowerCase();

        const matchedBooks = await new Promise((resolve, reject) => {
            const booksByAuthor = Object.keys(books)
                .filter(key => books[key].author?.toLowerCase() === authorName)
                .map(key => ({ isbn: key, ...books[key] }));
            
            if (booksByAuthor.length > 0) resolve(booksByAuthor);
            else reject(`No books found for author: ${req.params.author}`);
        });

        res.status(200).json(matchedBooks);
    } catch (error) {
        res.status(404).json({ message: error });
    }
});


/********************
 * Get Books by Title (Async/Await)
 ********************/
public_users.get("/title-async/:title", async (req, res) => {
    try {
        const titleName = req.params.title.trim().toLowerCase();

        const matchedBooks = await new Promise((resolve, reject) => {
            const booksByTitle = Object.keys(books)
                .filter(key => books[key].title?.toLowerCase() === titleName)
                .map(key => ({ isbn: key, ...books[key] }));

            if (booksByTitle.length > 0) resolve(booksByTitle);
            else reject(`No books found with title: ${req.params.title}`);
        });

        res.status(200).json(matchedBooks);
    } catch (error) {
        res.status(404).json({ message: error });
    }
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
