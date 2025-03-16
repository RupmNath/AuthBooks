const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();
let users = [];
const SECRET_KEY = "fingerprint_customer"; // Secret key for JWT

// Check if username exists
const isValid = (username) => users.some(user => user.username === username);

// Authenticate username and password
const authenticatedUser = (username, password) => 
    users.some(user => user.username === username && user.password === password);

// ✅ User Registration
regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (isValid(username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });

    console.log("User registered:", { username });

    return res.status(201).json({ message: "User registered successfully" });
});

// ✅ User Login (Returns JWT Token)
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    let token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

    console.log("Login successful:", { username, token });

    return res.status(200).json({ message: "Login successful", token });
});

// 🔹 Middleware for Authentication
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "User not logged in" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded.username;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid token" });
    }
};

// ✅ Add or Modify a Book Review
regd_users.put("/auth/review/:isbn", authenticate, (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;
    const username = req.user;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    books[isbn].reviews[username] = review;

    console.log(`Review added/updated by ${username} for book ISBN ${isbn}`);
    
    return res.status(200).json({ message: "Review added/updated successfully", book: books[isbn] });
});

// ✅ Delete a Book Review
regd_users.delete("/auth/review/:isbn", authenticate, (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found" });
    }

    delete books[isbn].reviews[username];

    console.log(`Review deleted by ${username} for book ISBN ${isbn}`);

    return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
