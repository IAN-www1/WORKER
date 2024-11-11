// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const cors = require('cors');

// Adjust path to controllers
const Item = require('./models/Item');
const Order = require('./models/Order');
const checkoutRoutes = require('./routes/checkout');
const loginRoutes = require('./routes/login'); // Adjust the path as necessary
const Employee = require('./models/Employee'); // Ensure this is correct
const authRoutes = require('./routes/auth');

const app = express();

// Set view engine to EJS
app.set('view engine', 'ejs');

// Connection URI from environment variable
const uri = process.env.MONGO_URI;

// Connect to MongoDB using Mongoose
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected successfully to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Increase payload size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json()); // For parsing application/json

// Enable CORS for all routes
app.use(cors());

// Session middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set `secure: true` if using HTTPS

}));



// Flash messages middleware
app.use(flash());

// Set up global variables for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});
// Prevent caching
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Routes
app.use('/checkout', checkoutRoutes);
app.use('/', loginRoutes); // Use the login routes
app.use(authRoutes);

// Example route handler in your Express app
app.get('/', (req, res) => {
  res.redirect('/login'); // Redirect to the login page
});

app.get('/login', (req, res) => {
  res.render('login'); // Render login.ejs
});


// Billing route
app.get('/billing', async (req, res) => {
  if (!req.session.employeeId) {
    req.flash('error_msg', 'Please log in to view this resource');
    return res.redirect('/login');
  }

  try {
    // Fetch the user from the database
    const employee = await Employee.findById(req.session.employeeId);
    if (!employee) {
      req.flash('error_msg', 'User not found');
      return res.redirect('/login');
    }

    res.render('billing', { cartItems: req.session.cartItems });
  } catch (error) {
    console.error('Error fetching user or billing information:', error);
    req.flash('error_msg', 'An error occurred while fetching billing information');
    res.redirect('/login');
  }
});

// Route to fetch items for menu
app.get('/menu', async (req, res) => {
  // Check if the user is logged in (by checking session for employee ID)
  if (!req.session.employeeId) {
    req.flash('error_msg', 'Please log in to view this resource');
    return res.redirect('/login');
  }

  try {
    // Fetch the employee from the database using the employee ID in the session
    const employee = await Employee.findById(req.session.employeeId);
    if (!employee) {
      req.flash('error_msg', 'Employee not found');
      return res.redirect('/login');
    }

    // Fetch all items from MongoDB
    const items = await Item.find();
    res.render('menu', { items }); // Pass items to menu.ejs
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).send('Server Error');
  }
});

// Start the server
const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
