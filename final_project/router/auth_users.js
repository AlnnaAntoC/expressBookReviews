const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();

// Users array from general.js will use this
let users = [];

/************************************
 * 1. Validate Username
 ************************************/
const isValid = (username) => {
  // Username should not already exist
  return !users.some(user => user.username === username);
};

/************************************
 * 2. Authenticate User (login check)
 ************************************/
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

/************************************
 * 3. LOGIN Route
 ************************************/
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check inputs
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if credentials match
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  // Generate JWT
  let accessToken = jwt.sign({ username: username }, "access", { expiresIn: "1h" });

  // Save token in session
  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({ message: "User logged in successfully", accessToken });
});

/************************************
 * 4. ADD or UPDATE Book Review
 ************************************/
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;

  if (!review) {
    return res.status(400).json({ message: "Review text is required." });
  }

  let book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }

  // Add/update review
  book.reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: book.reviews
  });
});

/************************************
 * 5. EXPORTS — VERY IMPORTANT
 ************************************/
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
