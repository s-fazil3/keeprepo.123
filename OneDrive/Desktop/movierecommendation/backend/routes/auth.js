const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    await authController.signup(req, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    await authController.login(req, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
