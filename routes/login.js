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
            return res.status(400).json({ success: false, message: 'Invalid username or password' });
        }

        // Compare the entered password with the stored hashed password
        const match = await bcrypt.compare(password, employee.password);
        if (!match) {
            return res.status(400).json({ success: false, message: 'Invalid username or password' });
        }

        // Successful login: Store employee information in the session
        req.session.employeeId = employee._id; // Store employee ID in the session

        // Return success message as JSON
        return res.status(200).json({ success: true, message: 'Login successful!' });
    } catch (error) {
        console.error('Error during employee login:', error);
        return res.status(500).json({ success: false, message: 'Error logging in, please try again.' });
    }
});

// Export the router
module.exports = router;
