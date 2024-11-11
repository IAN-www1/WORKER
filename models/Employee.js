const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Use bcryptjs

// Create a schema for Employee
const employeeSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Ensures that usernames are unique
    },
    password: {
        type: String,
        required: true,
        minlength: 6, // Minimum length for the password
    },
});

// Hash the password before saving the employee
employeeSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Skip hashing if password is not modified
    try {
        const salt = await bcrypt.genSalt(10); // Generate a salt
        this.password = await bcrypt.hash(this.password, salt); // Hash the password
        next(); // Proceed to save the employee
    } catch (err) {
        next(err); // Pass any errors to the next middleware
    }
});

// Method to compare input password with stored hashed password
employeeSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password); // Compare passwords
};

// Create a model from the schema
const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee; // Export the Employee model
