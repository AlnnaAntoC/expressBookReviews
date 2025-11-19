const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if username already exists
    const userExists = users.some(user => user.username === username);

    if (userExists) {
        return res.status(409).json({ message: "Username already exists. Please choose a different username." });
    }

    // Add new user to the users array
    users.push({ username, password });
    return res.status(201).json({ message: `User '${username}' registered successfully.` });
});



// Get the book list available in the shop
  //Write your code here

  // Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 2));
});

 

//Write your code here


  // Get book details based on ISBN
// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;          // req.params is always a string
    const book = books[isbn] || books[Number(isbn)]; // Try both string and number keys

    if (book) {
        return res.status(200).json(book);
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
});


  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const authorName = req.params.author.trim().toLowerCase(); // Trim spaces & lowercase
    const booksArray = Object.keys(books); 
    let matchedBooks = [];

    booksArray.forEach((key) => {
        const book = books[key];
        if (book.author && book.author.toLowerCase() === authorName) {
            matchedBooks.push({ isbn: key, ...book });
        }
    });

    if (matchedBooks.length > 0) {
        return res.status(200).json(matchedBooks);
    } else {
        return res.status(404).json({ message: `No books found for author: ${req.params.author}` });
    }
});




// Get all books based on title
// Get book details based on title
public_users.get('/title/:title', function (req, res) {
    const titleName = req.params.title.trim().toLowerCase(); // Trim spaces & normalize case
    const booksArray = Object.keys(books); // Get all book keys
    let matchedBooks = [];

    // Iterate through all books and check for title match
    booksArray.forEach((key) => {
        const book = books[key];
        if (book.title && book.title.toLowerCase() === titleName) {
            matchedBooks.push({ isbn: key, ...book });
        }
    });

    if (matchedBooks.length > 0) {
        return res.status(200).json(matchedBooks);
    } else {
        return res.status(404).json({ message: `No books found with title: ${req.params.title}` });
    }
});



// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn; 
    const book = books[isbn] || books[Number(isbn)]; // Handle string and numeric keys

    if (book) {
        return res.status(200).json({ isbn: isbn, reviews: book.reviews });
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
});






module.exports = public_users;

