const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();

let users = [
    { username: "testuser", password: "test123" },
    { username: "alice", password: "alicepass" },
    { username: "bob", password: "bobpass" }
];


/********************
 * Validate Username
 ********************/
const isValid = (username) => {
    return !users.some(user => user.username === username);
};

/********************
 * Authenticate Login
 ********************/
const authenticatedUser = (username, password) => {
    return users.some(
        user => user.username === username && user.password === password
    );
};







/********************
 * Login
 ********************/
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ message: "Username and password are required." });

    if (!authenticatedUser(username, password))
        return res.status(401).json({ message: "Invalid username or password." });

    let accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });

    req.session.authorization = { accessToken, username };

    return res.status(200).json({
        message: "User logged in successfully",
        accessToken
    });
});

/********************
 * Add/Update Review
 ********************/
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.session.authorization.username;

    if (!review)
        return res.status(400).json({ message: "Review text is required." });

    let book = books[isbn];

    if (!book)
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });

    book.reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully",
        reviews: book.reviews
    });
});

/********************
 * Add/Update Review - TASK 8
 ********************/
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;

    // Get username from session
    const username = req.session.authorization?.username;
    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review text is required." });
    }

    let book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }

    // Add or update the review for this user
    book.reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully",
        reviews: book.reviews
    });
});


/********************
 * Delete a Review
 ********************/
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }

    // Check if the user has a review
    if (!book.reviews[username]) {
        return res.status(400).json({ message: "You have no review to delete for this book." });
    }

    // Delete the review
    delete book.reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully",
        reviews: book.reviews
    });
});






/********************
 * Module Exports
 ********************/
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
