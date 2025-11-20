const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const general_routes = require('./router/general.js');

const app = express();
app.use(express.json());

// Session Layer
app.use(
    session({
        secret: "fingerprint_customer",
        resave: true,
        saveUninitialized: true
    })
);

// JWT Access Control
app.use("/customer/auth/*", function (req, res, next) {
    if (req.session.authorization) {
        let token = req.session.authorization["accessToken"];

        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                return next();
            }
            return res.status(403).json({ message: "User not authenticated" });
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

// Route Enablement
app.use("/", general_routes);
app.use("/customer", customer_routes);

const PORT = 5000;
app.listen(PORT, () => console.log("Server is running"));
