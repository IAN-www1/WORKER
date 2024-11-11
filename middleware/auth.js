// middleware/auth.js
const authMiddleware = (req, res, next) => {
    if (req.session && req.session.employeeId) {
        // Employee is logged in, redirect them to the dashboard or homepage
        return res.redirect('/menu'); // Change this to your desired route
    }
    next(); // Employee is not logged in, continue to the next middleware
};

module.exports = authMiddleware;
