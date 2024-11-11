const express = require('express');
const router = express.Router();

router.post('/logout', (req, res) => {
    // Perform logout logic here (e.g., destroying the session)
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Logout failed');
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.sendStatus(200); // Send success status
    });
});
router.get('/check-auth', (req, res) => {
    if (req.session && req.session.user) {
        res.json({ isAuthenticated: true });
    } else {
        res.json({ isAuthenticated: false });
    }
});

  
module.exports = router;
