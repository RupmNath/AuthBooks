const express = require('express');
let books = require("./booksdb.js");
let { isValid, users } = require("./auth_users.js");
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).send(JSON.stringify(books, null, 2)); // Pretty-print JSON
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;  // Extract ISBN from request parameters
    const book = books[isbn];      // Retrieve book details from books database

    if (book) {
        return res.status(200).json(book); // Return book details if found
    } else {
        return res.status(404).json({ message: "Book not found" }); // Handle case where ISBN does not exist
    }
});


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author; // Extract the author from request params
    let booksByAuthor = [];

    // Iterate through books and check for matching author
    for (let key in books) {
        if (books[key].author === author) {
            booksByAuthor.push(books[key]);
        }
    }

    if (booksByAuthor.length > 0) {
        return res.status(200).json(booksByAuthor);
    } else {
        return res.status(404).json({ message: "No books found by this author" });
    }
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title; // Extract the title from request params
    let booksByTitle = [];

    // Iterate through books and check for matching title
    for (let key in books) {
        if (books[key].title === title) {
            booksByTitle.push(books[key]);
        }
    }

    if (booksByTitle.length > 0) {
        return res.status(200).json(booksByTitle);
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
});


// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Extract ISBN from request params

    // Check if the book exists
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
