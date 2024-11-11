const express = require('express');
const Employee = require('../models/Employee'); // Ensure this path is correct
const bcrypt = require('bcryptjs'); // Import bcryptjs for hashing and comparing passwords
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // Import the auth middleware

// Render the login form
router.get('/login', authMiddleware, (req, res) => {
    res.render('login'); // Ensure you have a login.ejs view
});

// Handle login
router.post('/login', async (req, res) => {
    const { username, password } = req.body; // Extract username and password from the request body

    try {
        // Find employee by username
        const employee = await Employee.findOne({ username });
        
        // Check if employee exists
        if (!employee) {
            req.flash('error_msg', 'Invalid username or password');
            return res.redirect('/login');
        }

        // Compare the entered password with the stored hashed password
        const match = await bcrypt.compare(password, employee.password);
        if (!match) {
            req.flash('error_msg', 'Invalid username or password');
            return res.redirect('/login');
        }

        // Successful login: Store employee information in the session
        req.session.employeeId = employee._id; // Store employee ID in the session
        req.flash('success_msg', 'Login successful!');
        res.redirect('/menu'); // Adjust the redirect path as necessary
    } catch (error) {
        console.error('Error during employee login:', error);
        req.flash('error_msg', 'Error logging in, please try again.');
        res.redirect('/login');
    }
});

// Export the router
module.exports = router;
