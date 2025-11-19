const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const general_routes = require('./router/general.js');   // <-- FIXED

const app = express();

app.use(express.json());

// Public API routes
app.use("/public", general_routes);  // <-- FIXED


// Session middleware (before customer routes)
app.use(
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
  })
);


// Authentication middleware
app.use("/customer/auth/*", function (req, res, next) {
  if (req.session.authorization) {

    let token = req.session.authorization['accessToken'];

    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        req.user = user;
        next();
      } else {
        return res.status(403).json({ message: "User not authenticated" });
      }
    });

  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});


// Customer routes
app.use("/customer", customer_routes);


// Optional root public fallback
app.use("/", general_routes);


const PORT = 5000;
app.listen(PORT, () => console.log("Server is running"));
